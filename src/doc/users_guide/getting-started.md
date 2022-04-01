---
title: Getting started
eleventyNavigation:
  order: -1
---

First, [install OpenCilk](/doc/howto/install). Then we will walk you through the steps of building,
running and testing a sample OpenCilk program. 

## Overview of the OpenCilk C/C++ languages

The OpenCilk languages extend C and C++ to simplify writing parallel
applications that efficiently exploit multiple processors.

The OpenCilk languages are particularly well suited for, but not
limited to, *divide and conquer* algorithms. This strategy solves
problems by breaking them into sub-problems (tasks) that can be solved
independently, then combining the results. Recursive functions are
often used for divide and conquer algorithms, and are well supported
by the OpenCilk languages.

The tasks may be implemented in separate functions or in iterations of
a loop. The OpenCilk keywords identify function calls and loops that
can run in parallel. The OpenCilk runtime system, Cheetah, schedules
these tasks to run efficiently on the available processors. We will
use the term *worker* to mean an operating system thread that the
OpenCilk scheduler uses to execute a task in anOpenCilk program.

## Using OpenCilk

We assume that you have
more than one processor core available. If you have a single-core
system, you can still build and test the example, but you should not
expect to see any performance improvements.

### Building qsort

Detailed build options are described in the "***Building,
Running, and Debugging*** (Page [17](#_bookmark12))" chapter. For
now, use the default settings.

- Change to the qsort directory (e.g. `cd INSTALLDIR/examples/qsort`)
- Issue the `make` command.
- The executable qsort will be built in the current directory.
- If make fails, check to be sure that the PATH environment variable
is set to find cilk++ from `INSTALLDIR/bin`.


### Running qsort

Ensure that qsort runs correctly. With no arguments, the
program will create and sort an array of 10,000,000 integers. For
example:

```bash
>qsort
Sorting 10000000 integers
5.641 seconds Sort succeeded.
```

By default, an OpenCilk program will query the operating system and
use as many cores as it finds. You can control the number of workers
using the cilk_set_worker_count command line option to any OpenCilk
program. This option is intercepted by the OpenCilk runtime system;
the OpenCilk program does not see this argument.

### Observe speedup on a multicore system

Here are some results on an 8-core system, where the speedup is
limited by the application's parallelism and the core count.

```bash
>qsort -cilk_set_worker_count=1 
Sorting 10000000 integers
2.909 seconds 
Sort succeeded.

>qsort -cilk_set_worker_count=2 
Sorting 10000000 integers
1.468 seconds 
Sort succeeded.

>qsort -cilk_set_worker_count 4
Sorting 10000000 integers
0.798 seconds 
Sort succeeded.

>qsort -cilk_set_worker_count 8
Sorting 10000000 integers
0.438 seconds 
Sort succeeded.
```

### Check for data races

Use the OpenCilk cilksan race detector (cilksan) to verify that there
are no data races in the code. Note that any races will be exposed
using a small data set. In this example, we sort an array of only
1,000 elements for the race detection analysis. Race conditions are
always analyzed with a single-processor run, regardless of the number
of processors available or specified. On Windows systems, cilksan can
also be invoked from within Visual Studio.

```bash
>cilksan qsort 1000 
Sorting 1000 integers
0.078 seconds 
Sort succeeded.
No errors found by Cilksan
```

### Measure scalability and parallel metrics

Use the OpenCilk cilkscale scalability and performance analyzer
(cilkscale) to run your OpenCilk program on multiple processors and
plot the speedup. As described in the cilkscale chapter, the qsort
example creates a cilk::cilkscale object and calls the start(), stop()
and dump() methods to generate performance measurements. By default,
cilkscale will run the program N times, using 1 to N cores. Use the
-workers option to specify the maximum number of workers to measure.
cilkscale will run the program one additional time using the Parallel
Performance Analyzer option to predict how performance will scale.
Here, we run with 1 and 2 workers, plus one additional run. You will
see the output of qsort each time it runs. After a set of runs,
cilkscale will display a graph showing the measured and predicted
performance. The graph, screen and file output are explained in detail
in the cilkscale chapter. (On Linux* systems, the graph is only
displayed if gnuplot is installed.)

```bash
>cilkscale -trials all 2 -verbose qsort.exe 
cilkscale: CILK_NPROC=2 qsort.exe
Sorting 10000000 integers
5.125 seconds 
Sort succeeded.

cilkscale: CILK_NPROC=1 qsort.exe 
Sorting 10000000 integers
9.671 seconds 
Sort succeeded.
cilkscale: cilksan -w qsort.exe 
Sorting 10000000 integers
38.25 seconds 
Sort succeeded.

Cilkscale Scalability Analyzer V1.1.0, Build 7684
1)  Parallelism Profile
Work : 17,518,013,236
instructions
Span : 1,617,957,937
instructions
Burdened span : 1,618,359,785 instructions
Parallelism : 10.83
Burdened parallelism : 10.82
Number of spawns/syncs : 10,000,000
Average instructions / strand : 583
Strands along span : 95
Average instructions / strand on span : 17,031,136 Total number of
atomic instructions : 10,000,000

2)  Speedup Estimate
2 processors: 1.73 - 2.00
4 processors: 2.72 - 4.00
8 processors: 3.81 - 8.00
16 processors: 4.77 - 10.83
32 processors: 5.45 - 10.83
```

![qsort](/static/img/qsort-results.jpg)

