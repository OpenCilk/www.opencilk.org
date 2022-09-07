---
title: Cilkscale — scalability analysis & benchmarking tool
image: /img/qsort-cilkscale-scalability-plots-sample-qsort-only.png
tags:
  - cilkscale
  - tools
attribution: false
author: Alexandros-Stavros Iliopoulos
date: 2022-08-31
eleventyNavigation:
  order: 0
---

Cilkscale can help you reason about the parallel performance and scalability of
your Cilk program.  Cilkscale enables you to:

- Collect statistics of parallel performance for your application.
- Measure the {% defn "work" %}, {% defn "span" %}, and {% defn "parallelism"
  %} of your (sub-)computations and predict how their performance will scale on
  multiple processors.
- Automatically benchmark your program on different numbers of processors.
- Produce tables and graphical plots with the above performance and scalability
  measurements.

This guide will walk you through the basic steps of profiling the parallel
performance and scalability of your Cilk application with Cilkscale.  By the
end of this guide, you will know how to generate performance and scalability
tables and plots like the ones shown below and have a basic understanding of
how to use them to diagnose parallel performance limitations of your
application.  For details on the Cilkscale components, user options, and output
information, see the [Cilkscale reference manual](/doc/reference/cilkscale).

{% img "/img/qsort-cilkscale-scalability-plots-sample-qsort-only.png", "1000" %}

{% alert "info" %}

_**Note:**_ This guide assumes that OpenCilk is installed within
`/opt/opencilk/` and that the OpenCilk C++ compiler can be invoked from the
terminal as `/opt/opencilk/bin/clang++`, as shown in [this
example](/doc/users-guide/install/#example).

{% endalert %}

{% alert "info" %}

_**System setup for reported performance measurements:**_ All timings reported
in this page are measured on a laptop with an 8-core Intel Core i7-10875H CPU,
using OpenCilk 2.0.1 on Ubuntu 20.04 (via the Windows Subsystem for Linux v2 on
Windows 10).

{% endalert %}


## Example application: parallel divide-and-conquer quicksort

We shall illustrate how to use the various components of Cilkscale with a
Cilk/C++ application that implements a parallel divide-and-conquer
[quicksort](https://en.wikipedia.org/wiki/Quicksort).  The source code for our
simple program, `qsort.cpp`, is shown below.

```cilkcpp#
#include <iostream>
#include <algorithm>
#include <random>
#include <cilk/cilk.h>

constexpr std::ptrdiff_t BASE_CASE_LENGTH = 32;

template <typename T>
void sample_qsort(T* begin, T* end) {
  if (end - begin < BASE_CASE_LENGTH) {
    std::sort(begin, end);  // base case: serial sort
  } else {
    --end;  // exclude last element (pivot) from partition
    T* middle = std::partition(begin, end,
                               [pivot=*end](T a) { return a < pivot; });
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

  std::default_random_engine rng;
  std::uniform_int_distribution<long> dist(0,n);
  std::vector<long> a(n);
  std::generate(a.begin(), a.end(), [&]() { return dist(rng); });

  std::cout << "Sorting " << n << " random integers" << std::endl;
  sample_qsort(a.data(), a.data() + a.size());

  bool pass = std::is_sorted(a.cbegin(), a.cend());
  std::cout << "Sort " << ((pass) ? "succeeded" : "failed") << "\n";
  return (pass) ? 0 : 1;
}
```

The `qsort.cpp` program simply generates a vector of pseudorandom numbers,
sorts it with the `sample_qsort()` function, and verifies the result.  We can
compile and run it as follows.

```shell-session
$ /opt/opencilk/bin/clang++ qsort.cpp -fopencilk -O3 -o qsort
$ ./qsort 100000000
Sorting 100000000 random integers
Sort succeeded
```


## Benchmarking and work/span analysis instrumentation with Cilkscale

Cilkscale instruments your Cilk program to collect performance measurements
during its execution.  Cilkscale instrumentation operates in one of two modes:
benchmarking or work/span analysis.  In either case, you can use Cilkscale with
two simple steps:

1. Pass a [Cilkscale instrumentation
   flag](/doc/reference/cilkscale/#compiler-options-for-cilkscale-instrumentation)
   to the OpenCilk compiler when you compile and link your program.  The result
   is a Cilkscale-instrumented binary.
2. When you run the instrumented binary, Cilkscale collects performance
   measurements and prints its report to the standard output.  (To output the
   report to a file, set the
   [`CILKSCALE_OUT`](/doc/reference/cilkscale/#cilkscale-report-output-file)
   environment variable.)  Your program otherwise runs as it normally would.

By default, Cilkscale only reports results for whole-program execution.  To
additionally report results for specific sub-computations of your program, use
the [Cilkscale C/C++
API](#cilkscale-api-for-fine-grained-analysis-of-parallel-regions), which we
will address shortly.

### Benchmarking instrumentation

To benchmark your application with Cilkscale, pass the
`-fcilktool=cilkscale-benchmark` flag to the OpenCilk compiler:

```shell-session
$ /opt/opencilk/bin/clang++ qsort.cpp -fopencilk -fcilktool=cilkscale-benchmark -O3 -o qsort_cilkscale_bench
```

In benchmarking mode, Cilkscale simply measures the wall-clock execution time
of your program.  Running the instrumented binary now produces the same output
as before, followed by two lines with the timing results in [CSV
format](https://en.wikipedia.org/wiki/Comma-separated_values):

```shell-session
$ ./qsort_cilkscale_bench 100000000
[...]
tag,time (seconds)
,2.29345
```

The reported time above is untagged and refers to whole-program execution.  The
formatting of the CSV report will become clearer shortly, when we see [how to
use the Cilkscale
API](#cilkscale-api-for-fine-grained-analysis-of-parallel-regions) to benchmark
and analyze specific code regions.

### Work/span analysis instrumentation

To analyze the parallel scalability of your application with Cilkscale, pass
the `-fcilktool=cilkscale` flag to the OpenCilk compiler:

```shell-session
$ /opt/opencilk/bin/clang++ qsort.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_cilkscale
```

In work/span analysis mode, Cilkscale measures the {% defn "work" %}, {% defn
"span" %}, and {% defn "parallelism" %} of the instrumented program.  These
measurements depend on your program's input and {% defn "logical parallelism"
%} but not on the number of processors on which it is run.  Cilkscale collects
performance measurements during runtime and uses the {% defn "parallel trace"
%} of your program for its analysis.  The [Cilkscale reference
manual](/doc/reference/cilkscale/#workspan-analysis-measurements-reported-by-cilkscale)
describes the specific quantities reported by Cilkscale.

The Cilkscale work/span analysis report is printed in CSV format, similarly to
the the Cilkscale benchmarking report but with different fields or columns:

```shell-session
$ ./qsort_cilkscale 100000000
[...]
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,23.661,2.19196,10.7944,2.19226,10.793
```

As before, the reported measurements above are untagged and refer to
whole-program execution.

{% alert "info" %}

_**Note:**_ The Cilkscale-instrumented binary in work/span analysis mode is
slower than its non-instrumented counterpart.  The slowdown is generally no
larger than $10\times$ and typically less than $2\times$.

In the example above, `qsort_cilkscale` was about $1.5\times$ slower than
`qsort` or `qsort_cilkscale_bench` ($3.4\,$s vs $2.3\,$s).

{% endalert %}


## Cilkscale API for fine-grained analysis of parallel regions

Cilkscale provides a C/C++ API for benchmarking or analyzing specific regions
in a program.  The Cilkscale API allows you to focus on and distinguish between
specific parallel regions of your computation when measuring its parallel
performance and scalability.  Using the Cilkscale API is similar to using
common C/C++ APIs for timing regions of interest (such as the C++ `std::chrono`
library or the POSIX `clock_gettime()` function).

The steps for [compiling and running the Cilkscale-instrumented
binary](#benchmarking-and-workspan-analysis-instrumentation-with-cilkscale) are
the same whether or not your program uses the Cilkscale API.

Let's see how we can use the Cilkscale API to analyze the execution of
`sample_qsort()` function in our example quicksort application.  That is, we
want to exclude the computations for initializing a random vector of integers
or verifying the sort correctness, which are all executed serially anyway.  To
achieve this, we make the following three changes to our code and save the
edited code as `qsort_wsp.cpp`.

1. Include the Cilkscale API header file.  E.g., after line 4 in `qsort.cpp`:
   
   ```cpp
   #include <cilk/cilkscale.h>
   ```

2. Create work-span snapshots using calls to `wsp_getworkspan()` around the
   region we want to analyze.  E.g., around the call to `sample_qsort()` in
   line 35 in `qsort.cpp`:
   
   ```cpp
   wsp_t wsp_tic = wsp_getworkspan();
   sample_qsort(a.data(), a.data() + a.size());
   wsp_t wsp_toc = wsp_getworkspan();
   ```

3. Evaluate the work and span between the relevant snapshots and print the
   analysis results with a descriptive tag.  E.g., just before the program
   terminates in line 39 in `qsort.cpp`:
   
   ```cpp
   wsp_t wsp_elapsed = wsp_sub(wsp_toc, wsp_tic);
   wsp_dump(wsp_elapsed, "qsort_sample");
   ```

Then, we compile and run our program as before:

```shell-session
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_wsp_cilkscale
$ ./qsort_wsp_cilkscale 100000000
[...]
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
sample_qsort,23.3376,1.01007,23.1049,1.01039,23.0976
,24.524,2.19645,11.1653,2.19676,11.1637
```

Notice that the Cilkscale report above now contains an additional row tagged
'sample_qsort', which was output by the corresponding call to `wsp_dump()`:

```shell-session
sample_qsort,23.3376,1.01007,23.1049,1.01039,23.097667
```

The last row in the Cilkscale report is always untagged and corresponds to
the execution of the whole program.

{% alert "info" %}

_**Note:**_ If you compile your code without a Cilkscale instrumentation flag,
calls to the Cilkscale API are effectively ignored with zero overhead.

{% endalert %}

For more detailed information on the Cilkscale API, as well as an example of
how to aggregate work/span analysis measurements from disjoint code regions,
see the relevant section of the [Cilkscale reference
manual](/doc/reference/cilkscale/#cc++-api-for-fine-grained-workspan-analysis).


## Benchmarking and visualization with the Cilkscale Python script

Cilkscale includes a Python script for benchmarking your program on multiple
cores and visualizing its performance and scalability analysis results.  The
Cilkscale benchmarking and visualization Python script is found at
`share/Cilkscale_vis/cilkscale.py` within the OpenCilk installation directory.
The Cilkscale Python script automates the process of running a Cilk program on
a different numbers of CPU cores, collating the benchmark timing data and
work-span analysis measurements, and storing everything into a single,
aggregate CSV file.  In addition, the script processes the aggregate CSV file
to generate plots of execution time and parallel speedup for each row (i.e.,
analyzed program region) of the CSV file.

{% alert "warning" %}

_**Prerequisites:**_ To use the Cilkscale benchmarking and visualization Python
script, you need:

- [Python](https://www.python.org/downloads/) 3.8 or later.
- (Optional) [matplotlib](https://pypi.org/project/matplotlib/) 3.5.0 or later;
  only required if producing graphical plots.

{% endalert %}

To use the `cilkscale.py` script, you must pass it two Cilkscale-instrumented
binaries of your program — one with `-fcilktool=cilkscale` and one with
`-fcilktool=cilkscale-benchmark` — along with a number of optional arguments.
For a description of the `cilkscale.py` script's arguments, see the [Cilkscale
reference manual](#running-the-cilkscale.py-script).

Let's now see an example of using the `cilkscale.py` script to analyze and
benchmark our `qsort_wsp.cpp` program which uses the Cilkscale API to profile
the `sample_qsort()` function.  First, we build the two Cilkscale-instrumented
binaries:

```shell-session
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale -O3 -o qsort_cs
$ /opt/opencilk/bin/clang++ qsort_wsp.cpp -fopencilk -fcilktool=cilkscale-benchmark -O3 -o qsort_cs_bench
```

Then, we run `cilkscale.py` with our instrumented binaries, a problem size of
$100,\!000,\!000$, and options to set the output paths for the resulting CSV table
and PDF document of visualization plots:

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py \
    -c ./qsort_wsp_cilkscale -b ./qsort_wsp_cilkscale_bench \
    -ocsv qsort-bench.csv -oplot qsort-scalability-plots.pdf \
    --args 100000000
```

The `cilkscale.py` script first echoes the values for all of its parameters,
including unspecified parameters with default values:

```shell-session
Namespace(args=['100000000'], cilkscale='./qsort_cilkscale', cilkscale_benchmark='./qsort_cilkscale_bench', cpu_counts=None, output_csv='qsort-bench.csv', output_plot='qsort-scalability-plots.pdf', rows_to_plot='all')
```

Then, it runs the instrumented binary for work/span analysis on all available
cores and prints its standard output and standard error streams.  You should
make sure that the program output is as expected.

```shell-session
>> STDOUT (./qsort_cilkscale 100000000)
Sorting 100000000 random integers
Sort succeeded
Time(sample_qsort) = 2.13294 sec
<< END STDOUT

>> STDERR (./qsort_cilkscale 100000000)
<< END STDERR
```

It then runs the instrumented binary for benchmarking on different numbers
of processors, per the `-cpus` argument passed to `cilkscale.py`.  (If this
argument is not specified, the program will run $P$ times, where $P$ is the
number of available physical cores in the system.)

```shell-session
INFO:runner:Generating scalability data for 8 cpus.
INFO:runner:CILK_NWORKERS=1 taskset -c 0 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=2 taskset -c 0,2 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=3 taskset -c 0,2,4 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=4 taskset -c 0,2,4,6 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=5 taskset -c 0,2,4,6,8 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=6 taskset -c 0,2,4,6,8,10 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=7 taskset -c 0,2,4,6,8,10,12 ./qsort_cilkscale_bench 100000000
INFO:runner:CILK_NWORKERS=8 taskset -c 0,2,4,6,8,10,12,14 ./qsort_cilkscale_bench 100000000
```

In this example, the program is benchmarked on up to 8 CPU cores with IDs 0, 2,
4, ….  This is because `cilkscale.py` only uses distinct *physical* cores by
default.  In the computer used for this example, core IDs 1, 3, 5, … correspond
to *logical* cores used in simultaneous multithreading or "hyper-threading".

Finally, `cilkscale.py` processes the collected benchmarking and work/span
analysis measurements and generates runtime and speedup plots for each analyzed
region (and the entire program).

```shell-session
INFO:plotter:Generating plot (2 subplots)
```

{% alert "warning" %}

_**TODO:**_ Editing pass over the rest of the page below.

{% endalert %}

After the analysis and benchmarking runs finish, `cilkscale.py` prints the
program output and produces a CSV table and a PDF collection of plots with the
benchmarking results.  For example, the above run produced the following CSV
table:

```shell-session
$ cat qsort-bench.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism,1c time (seconds),2c time (seconds),3c time (seconds),4c time (seconds),5c time (seconds),6c time (seconds),7c time (seconds),8c time (seconds)
sample_qsort,22.8861,1.4662,15.6091,1.4665,15.6059,7.69462,4.36279,2.98716,2.53078,2.1376,2.06614,1.81863,1.71402
,24.5158,3.0959,7.9188,3.0962,7.91803,8.99369,5.66761,4.33015,3.8124,3.44797,3.44469,3.103,3.02143
```

Below are the work-span analysis and benchmarking
measurements in the CSV table `qsort-bench.csv`, followed by the corresponding
plots in `qsort-scalability-plots.pdf`.


### The Cilkscale visualizations

The plots in the PDF file `qsort-scalability-plots.pdf` that was produced by
the above example run of `cilkscale.py` are shown below:

{% img "/img/qsort-cilkscale-scalability-plots.png", "1200" %}

These plots are arranged in two columns and as many rows as calls to the
Cilkscale API `wsp_dump()` function (plus one untagged row for the
whole-program execution).

The left-column figures show wall-clock execution time in seconds.
Specifically, these figures plot four types of measurements:

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


## Using Cilkscale to reason about parallel performance and scalability

So what can we surmise about the parallel scalability of our `qsort.cpp`
example, specifically the `sample_qsort()` function?  We observe the following:

- Our program shows strongly sub-linear scalability.  With $8$ processor cores,
  the parallel speedup is only $4\times$.
- The observed speedup measurements closely follow the burdened-dag bound.
- The parallelism of `sample_qsort()` is small, only about twice as large as
  the amount of cores on the laptop where the experiments were run.

A main issue with our parallel `sample_qsort()` is that it does not exhibit
sufficient parallelism.  As it is, we may only expect to see speedup with up to
about $15$ cores.  Moreover, computations with insufficient {% defn "parallel
slackness" %} are generally impacted significantly by scheduling and migration
overheads.  As a rule of thumb, the parallelism of a computation is sufficient
if it is about $10\times$ larger (or more) than the number of available
processors.  On the other hand, if the parallelism is too high — say, several
orders of magnitude higher than the number of processors — then it is often the
case that the computation is adversely impacted by the overhead for spawning
tasks that are too fine-grained.

If we want to improve the parallel performance of `sample_qsort()`, it appears
that our efforts, at least initially, are best spent increasing its
parallelism.  We could do that by un-coarsening (e.g., setting
`BASE_CASE_LENGTH = 1`) but that introduces unnecessary spawning overhead.  The
one remaining candidate then is the call to `std::partition()`, which is
currently serial and whose cost is linear with respect to the size of the input
array.

We will not cover parallel partition algorithms for quicksort here, but warn
that their design is an interesting problem!
