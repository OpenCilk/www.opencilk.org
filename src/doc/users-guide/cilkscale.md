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
scalability of your Cilk application with Cilksacle.  We will be using the
`qsort` program in the [OpenCilk tutorial GitHub
repo](https://github.com/OpenCilk/tutorial) as a running example.

{% alert "info" %}

***Note:*** This guide assumes that OpenCilk is installed within
`/opt/opencilk/` and that the OpenCilk C compiler can be invoked from the
terminal as `clang`.  For more information on installing OpenCilk and
configuring your OpenCilk installation, see the [Install
page](/doc/users-guide/install).

{% endalert %}


## Work-span analysis with Cilkscale

Cilkscale instruments your Cilk program to measure the {% defn "work" %}, {%
defn "span" %}, and {% defn "parallelism" %} when running the instrumented
program.  These measurements depend on your program's input and {% defn
"logical parallelism" %} but not on the number of processors on which it is
run.  Cilkscale collects performance measurements during runtime and uses the
logically parallel structure of your program for its analysis.

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

For example, let's see how
[`qsort.c`](https://github.com/OpenCilk/tutorial/blob/main/qsort.c) performs
when sorting an array of $10,\!000,\!000$ random integers on a laptop with an
8-core CPU (Intel Core i7-10875H) and simultaneous multithreading (aka
hyper-threading):

```shell-session
$ clang -fopencilk -fcilktool=cilkscale -O3 -o qsort_cilkscale qsort.c
$ ./qsort_cilkscale
Sorting 10000000 integers
All sorts succeeded
Time(sort) = 1.379397400 sec
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,12.9965,0.166194,78.201,0.166444,78.0836
```

Running the Cilkscale-instrumented binary may be several times slower than its
non-instrumented counterpart.  For example, with the same setup as above:

```shell-session
$ clang -fopencilk -O3 -o qsort qsort.c
$ ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
Time(sort) = 0.139078500 sec
```

{% alert "info" %}

***Note for users who build OpenCilk from source:*** By default, the
Cilkscale-instrumented binary runs in parallel.  If you see the message
`Forcing CILK_NWORKERS=1` when running a Cilkscale-instrumented binary, this
means Cilkscale was built as a serial tool.

{% endalert %}

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
  The burdened span is similar to the span, except that it attempts to account
  for overhead associated with scheduling and coordinating parallel tasks.  (In
  practice, there are additional overheads that can slow down parallel
  execution, such as communication or memory latency, contention on parallel
  resources, false sharing, etc.)

- **Burdened parallelism**  
  The burdened parallelism is the ratio of work to burdened span.  It can be
  thought of roughly as the parallelism of the computation assuming worst-case
  parallel scheduling.

### Deterministic measurements for work-span analysis

Cilkscale supports measuring work and span in seconds (the default) or in LLVM
"pseudo-instructions".  Pseudo-instructions measurements correspond to weighted
counts of architecture-independent instructions based on LLVM's internal
representation and cost model.

To measure the work and span of your Cilkscale-instrumented program in
pseudo-instructions, use the flag `-fcilktool=cilkscale-instructions` during
compilation and linking (instead of `-fcilktool=cilkscale`).

The pseudo-instruction measurements have the benefit that they are
deterministic, as long as the instrumented computation is itself deterministic.
Keep in mind, however, that measuring work and span in pseudo-instructions may
be several times slower than measuring them in seconds.

### Export the Cilkscale report to a file

You can have Cilkscale store its work-span analysis report in a file instead of
printing it to `stdout`.  To do this, set the `CILKSCALE_OUT` environment
variable to the path of the desired output file.  For example:

```shell-session
$ CILKSCALE_OUT=qsort_cilkscale_report.csv ./qsort_cilkscale 10000000
Sorting 10000000 integers
All sorts succeeded
Time(sort) = 1.380098300 sec
$ cat qsort_cilkscale_report.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,13.023,0.163986,79.4152,0.16418,79.3215
```

{% alert "info" %}

***Note:*** Cilkscale assumes that the path in `CILKSCALE_OUT` points to a
non-existent file in an existing directory.

- If the directory does not exist, the report is printed to the standard output
  instead.
- If the file already exists, the report will _overwrite_ the file's contents.

{% endalert %}


## Cilkscale API for fine-grained analysis of parallel regions

Cilkscale provides a C/C++ API for analyzing specific regions in a program.
The Cilkscale API allows you to focus on and distinguish between specific
parallel regions of your computation when analyzing its parallel scalability.
Using the Cilskcale API is similar to adding calls to `clock_gettime()` around
regions of interest.  The steps for compiling and running the
Cilkscale-instrumented binary are the same whether or not your program uses the
Cilkscale API.

As a simple example, let's use the Cilkscale API to analyze the
`sample_qsort()` function in `qsort.c`.  In this example, we care about the
parallel performance of only `sample_qsort()` — we want to exclude the
computations for initializing a random array of integers or verifying the sort
correctness.  To achieve this, we make the following three changes to our
code and save the edited code as `qsort_wsp.c`.

1. Include the Cilkscale API header file:
   
   ```c
   #include <cilk/cilkscale.h>
   ```

2. Create work-span snapshots using calls to `wsp_getworkspan()` around the
   region we want to analyze:
   
   ```c
   wsp_t tic = wsp_getworkspan();
   sample_qsort(a, a + n);
   wsp_t toc = wsp_getworkspan();
   ```

3. Evaluate the work and span between the relevant snapshots and print the
   analysis results with a descriptive tag:
   
   ```c
   wsp_t elapsed = wsb_sub(toc, tic);
   wsp_dump(elapsed, "qsort_sample");
   ```

Then, we compile and run our program:

```shell-session
$ clang -fopencilk -fcilktool=cilkscale -O3 -o qsort_wsp_cilkscale qsort_wsp.c
$ ./qsort_wsp_cilkscale 10000000
Sorting 10000000 integers
All sorts succeeded
Time(sort) = 1.371030100 sec
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
sample_qsort,12.8709,0.127424,101.009,0.127798,100.713
,12.9192,0.175739,73.5137,0.176114,73.3573
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

TODO
