---
title: Cilkscale — the OpenCilk scalability analysis tool
tags:
  - tools
attribution: true
---
Cilkscale can help you reason about the parallel performance and scalability of
your Cilk program.  Specifically, Cilkscale enables you to:

- Collect statistics of parallel performance for your application.
- Measure the [work, span, and
  parallelism](/posts/2022-05-20-what-the-is-parallelism-anyhow) of your
  computations and predict how their performance will scale on multiple
  processors.
- Automatically benchmark your program on different numbers of processors.
- Produce graphical plots of performance and scalability measurements.

Cilkscale comprises three main components:

- Infrastructure in the OpenCilk compiler and runtime for work, span, and
  parallelism analysis.
- A C/C++ API for fine-grained analysis of program regions.
- A Python script for easy benchmarking and visualization of performance and
  scalability with multiple processing cores.

In this guide, we will go over the above components and show the basic steps
for profiling, exploring, and understanding the parallel performance and
scalability of your Cilk application with Cilkscale.  We will be using a
parallel divide-and-conquer
[quicksort](https://en.wikipedia.org/wiki/Quicksort) program as a running
example.

{% alert "info" %}

***Note:*** This guide assumes that OpenCilk is installed within
`/opt/opencilk/` and that the OpenCilk C++ compiler can be invoked from the
terminal as `/opt/opencilk/bin/clang++`, as shown in [this
example](/doc/users-guide/install/#example).

{% endalert %}


## Example program: parallel divide-and-conquer quicksort

The Cilk/C++ code for our simple parallel quicksort program, `qsort.cpp` is
shown below.  (This code is similar to the Cilk/C `qsort.c` code in the
[OpenCilk tutorial GitHub repo](https://github.com/OpenCilk/tutorial).)

```cpp#
#include <iostream>
#include <algorithm>
#include <cstddef>
#include <random>
#include <chrono>
#include <cilk/cilk.h>

constexpr std::ptrdiff_t BASE_CASE_LENGTH = 32;

template <typename T>
void sample_qsort(T* begin, T* end) {
    if (end - begin < BASE_CASE_LENGTH) { 
        std::sort(begin, end);
    } else {
        --end;  // exclude last element (pivot) from partition
        T* middle = std::partition(begin, end,
                                   [pivot = *end](T a) { return a < pivot; });
        std::swap(*end, *middle);  // move pivot to middle
        cilk_scope {
            cilk_spawn sample_qsort(begin, middle);
            sample_qsort(++middle, ++end);  // exclude pivot and restore end
        }
    }
}

int main(int argc, char* argv[]) {
    long n = 100 * 1000 * 1000;
    if (argc == 2)
        n = std::atoi(argv[1]);
    // no syntax checking for brevity

    // pseudorandom integer inputs
    std::random_device rd;
    std::mt19937 rng (rd());
    std::uniform_int_distribution<long> dist(0,n);
    long* a = new long[n];
    std::generate(a, a + n, [&]() { return dist(rng); });

    // sort
    std::cout << "Sorting " << n << " random integers\n";
    auto t_tic = std::chrono::steady_clock::now();
    sample_qsort(a, a + n);
    auto t_toc = std::chrono::steady_clock::now();

    // verify sorting
    bool pass = std::is_sorted(a, a + n);
    std::cout << "Sort " << ((pass) ? "succeeded" : "failed") << "\n";

    // print timing
    std::chrono::duration<double> t_elapsed = t_toc - t_tic;
    std::cout << "Time(sample_qsort) = " << t_elapsed.count() << " sec\n";

    delete [] a;
    return (pass) ? 0 : 1;
}
```

The parallel Quicksort computation is implemented as function `sample_qsort()`,
defined in lines 10–24.  The `sample_qsort()` function gets as input a
contiguous array of numbers (technically, any data type that supports the `<`
comparison operator) and works as follows.  First, let's look at the recursion
in lines 14–23.  In lines 15–18, it picks the last element in the array to be
the "pivot" and uses it to partition the array into left and right subarrays.
The left subarray contains the elements in the input array that are smaller
than the pivot, and the right subarray contains the remaining elements.  Then,
in lines 19–22, it recursively partitions the left and right subarrays in
parallel, excluding the pivot element.  The parallel recursion is {% defn
"coarsen", "coarsened" %} with lines 12–13, which terminate the parallel
recursion if a subarray is smaller than the `BASE_CASE_LENGTH` (defined as `32`
in line 8), in which case the subarray is sorted serially with `std::sort()`.

The `main()` function in lines 26–55 simply generates an array of random `long`
integers, sorts it using `sample_qsort()`,  times and verifies the sorting, and
prints the result.

We can compile and test our `qsort.cpp` program on an array of $100,\!000,\!000$
random numbers as follows.  The timing below is measured on a laptop with an
8-core CPU (Intel Core i7-10875H) and [simultaneous
multithreading](https://en.wikipedia.org/wiki/Simultaneous_multithreading) (aka
hyper-threading).

```shell-session
$ /opt/opencilk/bin/clang++ qsort.cpp -fopencilk -O3 -o qsort
$ ./qsort 100000000
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 1.36157 sec
```


## Work-span analysis with Cilkscale

Cilkscale instruments your Cilk program to measure the {% defn "work" %}, {%
defn "span" %}, and {% defn "parallelism" %} when running the instrumented
program.  These measurements depend on your program's input and {% defn
"logical parallelism" %} but not on the number of processors on which it is
run.  Cilkscale collects performance measurements during runtime and uses the
{% defn "parallel trace" %} of your program for its analysis.

In this section, we will see how to use OpenCilk to instrument a Cilk program
with Cilkscale and collect scalability analysis results, and we will discuss
the measurements reported by Cilkscale.

### Compile and run a Cilkscale-instrumented program

Instrumenting your Cilk program with Cilkscale and collecting parallel
performance scalability measurements for its execution is simple:

1. You add the `-fcilktool=cilkscale` flag when you compile and link your
   program.  The result is a Cilkscale-instrumented binary.
2. When you run the instrumented binary with some input, Cilkscale analyzes its
   parallel performance.  When your program finishes, Cilkscale prints its
   report to the standard output.

For example, let's see what happens when we instrument our `qsort.cpp` program
with Cilkscale and run the instrumented binary with the same setup as above.

```shell-session
$ /opt/opencilk/bin/clang++ qsort.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_cilkscale
$ ./qsort_cilkscale 100000000
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 2.0279 sec
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,24.2875,2.96416,8.19373,2.96449,8.19283
```

We observe two differences in the output of the instrumented binary
`qsort_cilkscale` compared to that of the non-instrumented `qsort`.

First, the Cilkscale-instrumented binary may be several times slower than its
non-instrumented counterpart.  The slowdown is due to internal computations by
Cilkscale for keeping track of the parallel trace and associated timing
measurements of the the computation.  In the example above, the
Cilkscale-instrumented binary is roughly $1.5\times$ slower than the
non-instrumented one.

{% alert "info" %}

***Note for users who build OpenCilk from source:*** By default, the
Cilkscale-instrumented binary runs in parallel.  If you see the message
`Forcing CILK_NWORKERS=1` when running a Cilkscale-instrumented binary, this
means Cilkscale was built as a serial tool.

{% endalert %}

Second, Cilkscale prints a two-line report summarizing the results of its
scalability analysis.  What do these terms and numbers mean?

### Understanding Cilkscale's work-span analysis report

Cilkscale outputs its report as a table in [CSV
format](https://en.wikipedia.org/wiki/Comma-separated_values) which contains
[work, span, and parallelism](/posts/2022-05-20-what-the-is-parallelism-anyhow)
measurements.  Specifically, the Cilkscale report table contains the following
columns:

- **Tag**  
  A string identifier for the analyzed computation.  By default, Cilkscale
  analyzes the entire program, which is tagged by the empty string.

- **Work**  
  The total {% defn "work" %} $(T_1)$ of the computation, measured as CPU time.
  The actual wall-clock time it takes to run the computation will generally be
  smaller.  In the `qsort_cilkscale` example above, the total work is about
  $15.74$s but the parallel program executes in about $1.65$s.

- **Span**  
  The {% defn "span" %} $(T_{\infty})$ of the computation, measured as CPU
  time.  The span is the maximum amount of work along any path in the {% defn
  "parallel trace" %} of the computation.  One way of understanding the span is
  as the fastest execution time we could expect if we had an infinite number of
  parallel cores.

- **Parallelism**  
  The {% defn "parallelism" %} of a computation is its work-to-span ratio $(T_1
  / T_{\infty})$.  Parallelism can be thought of as the maximum possible
  parallel speedup of the computation, or as the maximum number of cores that
  could theoretically yield perfect linear speedup.

- **Burdened span**  
  The burdened span is similar to the span after accounting for worst-case
  scheduling overhead.  The scheduling overhead burden is based on a heuristic
  estimate of the costs associated with migrating and synchronizing parallel
  tasks among processors.  (In practice, there are additional overheads that
  can slow down parallel execution, such as insufficient memory bandwidth,
  contention on parallel resources, false sharing, etc.)

- **Burdened parallelism**  
  The burdened parallelism is the ratio of work to burdened span.  It can be
  thought of as a lower bound for the parallelism of the computation assuming
  worst-case parallel scheduling.

### Deterministic measurements for work-span analysis

Cilkscale supports measuring work and span in seconds (the default) or in LLVM
"pseudo-instructions".  Pseudo-instructions measurements correspond to weighted
counts of architecture-independent instructions based on LLVM's internal
representation and cost model.

To measure the work and span of your Cilkscale-instrumented program in
pseudo-instructions, use the flag `-fcilktool=cilkscale-instructions` during
compilation and linking (instead of `-fcilktool=cilkscale`).

Pseudo-instruction measurements of work and span have the benefit that they are
deterministic as long as the instrumented computation is itself deterministic.
Keep in mind, however, that measuring work and span in pseudo-instructions may
be several times slower than measuring them in seconds.

### Export the Cilkscale report to a file

You can have Cilkscale store its work-span analysis report in a file instead of
printing it to `stdout`.  To do this, set the `CILKSCALE_OUT` environment
variable to the path of the desired output file.  For example:

```shell-session
$ CILKSCALE_OUT=qsort_cilkscale_report.csv ./qsort_cilkscale 100000000
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 2.06273 sec
$ cat qsort_cilkscale_report.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
sample_qsort,21.808,1.31625,16.5682,1.3166,16.5639
,23.3894,2.89761,8.07194,2.89796,8.07098
```

{% alert "info" %}

***Note:*** Cilkscale assumes that the path in `CILKSCALE_OUT` points to a file
in an existing directory.

- If the directory does not exist, the report is printed to the standard output
  instead.
- If the file already exists, the report will overwrite the file's contents.

{% endalert %}


## Cilkscale API for fine-grained analysis of parallel regions

Cilkscale provides a C/C++ API for analyzing specific regions in a program.
The Cilkscale API allows you to focus on and distinguish between specific
parallel regions of your computation when analyzing its parallel scalability.
Using the Cilkscale API is similar to adding calls to `clock_gettime()` around
regions of interest.  The steps for compiling and running the
Cilkscale-instrumented binary are the same whether or not your program uses the
Cilkscale API.

Let's see how we can use the Cilkscale API to analyze the `sample_qsort()`
function in `qsort.cpp`.  In this example, we care about the parallel
performance of only `sample_qsort()`.  That is, we want to exclude the
computations for initializing a random array of integers or verifying the sort
correctness, which are all executed serially anyway.  To achieve this, we make
the following three changes to our code and save the edited code as
`qsort_wsp.cpp`.

1. Include the Cilkscale API header file (e.g., after line 6 in `qsort.cpp`):
   
   ```cpp
   #include <cilk/cilkscale.h>
   ```

2. Create work-span snapshots using calls to `wsp_getworkspan()` around the
   region we want to analyze (e.g., around line 42 in `qsort.cpp`):
   
   ```cpp
   wsp_t wsp_tic = wsp_getworkspan();
   sample_qsort(a, a + n);
   wsp_t wsp_toc = wsp_getworkspan();
   ```

3. Evaluate the work and span between the relevant snapshots and print the
   analysis results with a descriptive tag (e.g., after line 51 in
   `qsort.cpp`):
   
   ```cpp
   wsp_t wsp_elapsed = wsp_sub(wsp_toc, wsp_tic);
   wsp_dump(wsp_elapsed, "qsort_sample");
   ```

Then, we compile and run our program:

```shell-session
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_wsp_cilkscale
$ ./qsort_wsp_cilkscale 100000000
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 2.04999 sec
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
sample_qsort,22.8958,1.4491,15.8,1.44941,15.7967
,24.562,3.11529,7.88433,3.1156,7.88355
```

The Cilkscale report table now contains an additional row with measurements for
the `sample_qsort()` function execution.  Every call to `wsp_dump()` prints a
new row with the measurements in its 1st argument and the tag in its 2nd
argument.  The last row in the Cilkscale report table is always untagged and
corresponds to the execution of the whole program.

{% alert "info" %}

***Note:*** Calls to the Cilkscale API are silently ignored with zero overhead
if a program is compiled *without* the `-fcilktool=cilkscale` flag.

{% endalert %}

### Accumulating work-span measurements

It is sometimes desirable to accumulate work-span measurements for disjoint
program regions into a single measurement.  For instance, your program may
perform an iterative computation where each iteration includes parallel
sub-computations alongside serial ones or I/O, and you may want to analyze the
scalability of your parallel sub-computations across all iterations.  This can
be achieved as follows:

1. Initialize a `wsp_t` accumulation variable using `wsp_zero()`.
2. Measure work and span in a sub-computation as before, using
   `wsp_getworkspan()` and `wsp_sub()`.
3. Add the evaluated work-span measurements to the accumulation variable using
   `wsp_add()`.

{% alert "primary" %}

***Example:***

```c
wsp_t wsp_iter_1 = wsp_zero();
wsp_t wsp_iter_2 = wsp_zero();
while (iteration_condition) {
    /* ...non-analyzed code... */
    wsp_t tic = wsp_getworkspan();
    /* ...PARALLEL SUB-COMPUTATION #1... */
    wsp_t toc = wsp_getworkspan();
    wsp_t elapsed = wsp_sub(toc, tic);
    wsp_iter_1 = wsp_add(wsp_iter_1, elapsed);
    /* ...more non-analyzed code... */
    tic = wsp_getworkspan();
    /* ...PARALLEL SUB-COMPUTATION #2... */
    toc = wsp_getworkspan();
    elapsed = wsp_sub(toc, tic);
    wsp_iter_2 = wsp_add(wsp_iter_2, elapsed);
    /* ...even more non-analyzed code... */
}
wsp_dump(wsp_iter_1, "iteration sub-computation 1");
wsp_dump(wsp_iter_2, "iteration sub-computation 2");
```

{% endalert %}


## Benchmarking and visualization with the Cilkscale Python script

Cilkscale includes a Python script for benchmarking the parallel performance
and scalability of your program and visualizing the benchmarking results.  The
Cilkscale benchmarking and visualization Python script is found at
`share/Cilkscale_vis/cilkscale.py` within the OpenCilk installation directory.
The Cilkscale Python script automates the process of running a Cilk program on
a different numbers of CPU cores, collating the benchmark timing data and
work-span analysis measurements, and storing everything into a single,
aggregate CSV file.  Then, the script processes the aggregate CSV file to
generate plots of execution time and parallel speedup for each row (i.e.,
analyzed program region) of the CSV file.

{% alert "info" %}

***Prerequisites:*** To use the Cilkscale benchmarking and visualization Python
script, you need:

- [Python](https://www.python.org/downloads/) 3.8 or later.
- (Optional) [matplotlib](https://pypi.org/project/matplotlib/) 3.5.0 or later;
  only required if producing graphical plots.

{% endalert %}

To benchmark your Cilk program with the `cilkscale.py` script, you need two
separate binaries that are built with Cilkscale instrumentation.  One is
compiled and linked with `-fcilktool=cilkscale` and measures work, span and
parallelism as described in the previous sections.  The other is compiled and
linked with `-fcilktool=cilkscale-benchmark` and measures the execution time of
the whole program and each region analyzed with the Cilkscale API.  (Strictly
speaking, the calls to the `std::chrono` library in `qsort.cpp` are unnecessary
since the Cilkscale API serves the same function when the program is compiled
with `-fcilktool=cilkscale-benchmark`.)  For example:

```shell-session
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_wsp_cilkscale
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale-benchmark -O3 -o qsort_wsp_cilkscale_bench
```

The `cilkscale.py` script takes as input the two Cilkscale-instrumented
binaries and a set of optional arguments.  The optional arguments specify which
CPU cores to use for benchmarking, options for outputting a table and plots of
the benchmarking and analysis report results, and any command-line arguments to
the program being benchmarked.

The following example shows how to benchmark `qsort_wsp.cpp` for sorting
$100,\!000,\!000$ integers using all physical cores of a laptop with an 8-core
Intel Core i7-10875H CPU:

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py \
    -c ./qsort_wsp_cilkscale -b ./qsort_wsp_cilkscale_bench \
    -ocsv qsort-bench.csv -oplot qsort-scalability-plots.pdf \
    --args 100000000
Namespace(args=['100000000'], cilkscale='./qsort_cilkscale', cilkscale_benchmark='./qsort_cilkscale_bench', cpu_counts=None, output_csv='qsort-bench.csv', output_plot='qsort-scalability-plots.pdf', rows_to_plot='all')

>> STDOUT (./qsort_cilkscale 100000000)
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 2.13294 sec
<< END STDOUT

>> STDERR (./qsort_cilkscale 100000000)
<< END STDERR

INFO:runner:Generating scalability data for 8 cpus.
INFO:runner:CILK_NWORKERS=1 taskset -c 0 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=2 taskset -c 0,2 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=3 taskset -c 0,2,4 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=4 taskset -c 0,2,4,6 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=5 taskset -c 0,2,4,6,8 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=6 taskset -c 0,2,4,6,8,10 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=7 taskset -c 0,2,4,6,8,10,12 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=8 taskset -c 0,2,4,6,8,10,12,14 ./qsort_cilkscale_bench 100000000
INFO:plotter:Generating plot (2 subplots)
```

The `cilkscale.py` script runs the program multiple times: once to obtain
work-span analysis measurements, and then once per CPU core-count to collect
timing information.  After the first run, the script also prints the `stdout`
and `stderr` streams for the execution of the program.  In this example, the
program is then benchmarked on up to 8 CPU cores with IDs 0, 2, 4, ….  This is
because `cilkscale.py` only uses distinct *physical* cores by default, and core
IDs 1, 3, 5, … correspond to sibling *logical* cores in the computer used for
the example.

After the analysis and benchmarking runs finish, `cilkscale.py` prints the
program output and produces a CSV table and a PDF collection of plots with the
benchmarking results.  Below are the work-span analysis and benchmarking
measurements in the CSV table `qsort-bench.csv`, followed by the corresponding
plots in `qsort-scalability-plots.pdf`.

```shell-session
$ cat qsort-bench.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism,1c time (seconds),2c time (seconds),3c time (seconds),4c time (seconds),5c time (seconds),6c time (seconds),7c time (seconds),8c time (seconds)
sample_qsort,22.8861,1.4662,15.6091,1.4665,15.6059,7.69462,4.36279,2.98716,2.53078,2.1376,2.06614,1.81863,1.71402
,24.5158,3.0959,7.9188,3.0962,7.91803,8.99369,5.66761,4.33015,3.8124,3.44797,3.44469,3.103,3.02143
```

{% img "/img/qsort-cilkscale-scalability-plots.png", "1200" %}

The graphical PDF output of `cilkscale.py` contains plots arranged in two
columns and as many rows as calls to the Cilkscale API `wsp_dump()` function
(plus one untagged row for the whole-program execution).

The left column plots show wall-clock execution time in seconds.  These plots
comprise four types of measurements:

- Magenta-colored dots show the observed timing measurements for the
  benchmarking runs.  (These are collected with the benchmark binary, which
  does not perform any work-span analysis computations.)
- A dark green line shows what the execution time would be if the computation
  exhibited perfect linear speedup, that is, if the time on $P$ processors were
  to be $P$ times smaller than the time it took on $1$ processor.
- A teal line shows the bound that corresponds to the burdened parallel trace,
  also referred to as the directed acyclic graph or "dag" of the computation.
  This burdened-dag bound shows the expected execution time if we assume that
  parallel tasks are always migrated across processors, with some fixed
  migration overhead.  In the absence of other sources of parallel slowdown
  (such as insufficient memory bandwidth, contention, etc), the burdened-dag
  bound serves as a heuristic lower bound for the execution time if the
  parallel computation does not exhibit sufficient parallelism or is too
  fine-grained.
- A mustard-yellow horizontal line shows the span bound, that is, the minimum
  possible execution time if the computation was run on infinitely many
  processors and there were no additional overheads for parallel scheduling,
  etc.

The right column plots contain the same information as those in the left
column, except that the $y$-axis shows parallel speedup.  That is, all
execution time measurements are divided by the execution time of the
computation on $1$ processor.  Notice that the parallelism line (serial
execution time divided by span) is not seen in the speedup plot for
`sample_qsort()` because its value ($15.606$) falls outside the range of the
$y$-axis ($0$–$8$).  Similarly to the span bound, the parallelism can be
thought of as the maximum number of processors that could speed up the
computation.

So what can we surmise about the parallel scalability of our `qsort.cpp`
example, specifically the `sample_qsort()` function?  We observe the following:

- Our program shows strongly sub-linear scalability.  With $8$ processor cores,
  the parallel speedup is only $4\times$.
- The observed speedup measurements closely follow the burdened-dag bound.
- The parallelism of `sample_qsort()` is small, only about twice as large as
  the amount of cores on the laptop where the experiments were run.

A main issue with our parallel `sample_qsort()` is that it does not exhibit
sufficient parallelism.  Computations with insufficient parallelism are
generally impacted significantly by scheduling and migration overheads.  As a
rule of thumb, the parallelism of a computation is sufficient if it is about
$10\times$ larger (or more) than the number of available processors.  On the
other hand, if the parallelism is *too* high — say, many orders of magnitude
higher than the number of processors — then the computation may be adversely
impacted by the overhead for spawning tasks that are too fine-grained.

If we want to improve the parallel performance of `sample_qsort()`, it appears
that our efforts are best spent increasing its parallelism.  We could do that
by un-coarsening (e.g., setting `BASE_CASE_LENGTH = 1`) but that would
certainly introduce unnecessary spawning overhead.  The one remaining candidate
then is the call to `std::partition()`, which is currently serial and whose
cost is linear with respect to the size of the input array.

We will not cover parallel partition algorithms for quicksort here, but warn
that their design is an interesting problem!
