---
title: Getting started
tagline: This guide overviews the components of OpenCilk and walks through the basic steps of building, running, and testing a Cilk program with OpenCilk.
eleventyNavigation:
  order: -2
---

## Prerequisites

### OpenCilk installation

See the [install page](/doc/users-guide/install) for detailed instructions on
installing the latest version of OpenCilk.
We assume you have installed OpenCilk as shown in [this example](/doc/users-guide/install/#example),
so that the OpenCilk files are in `/opt/opencilk`,
and the OpenCilk C/C++ compiler can be invoked from the terminal as `/opt/opencilk/bin/clang` or `/opt/opencilk/bin/clang++`.

### Example Cilk programs

Download the example Cilk codes in the [OpenCilk
tutorial](https://github.com/OpenCilk/tutorial) GitHub repository and enter the
cloned directory:

```shell-session
$ git clone https://github.com/OpenCilk/tutorial
$ cd tutorial
```


## Using the compiler

To compile a Cilk program with OpenCilk, pass the `-fopencilk` flag to the
compiler.  For example:

```shell-session
$ /opt/opencilk/bin/clang -fopencilk -O3 fib.c -o fib
```

{% alert "info" %}

***Note:*** Pass the `-fopencilk` flag to the compiler both when compiling and
linking the Cilk program.  During compilation, the flag ensures that the Cilk
keywords are recognized and compiled.  During linking, it ensures the program
is properly linked with the OpenCilk runtime library.

{% alert "danger" %}

Former users of Intel Cilk Plus with GCC: Do **not** include the
`-lcilkrts` flag when linking.

{% endalert %}

{% endalert %}

{% alert "info" %}

***macOS users:*** On macOS, `clang` needs the standard system libraries and
headers that are provided by
[XCode](https://developer.apple.com/support/xcode/) or the [XCode Command Line
Tools](https://mac.install.guide/commandlinetools/index.html).  To run the
OpenCilk compiler with those libraries and headers, invoke `clang` with
`xcrun`.  For example:

```shell-session
$ xcrun /opt/opencilk/bin/clang -fopencilk -O3 fib.c -o fib
```

{% endalert %}

The OpenCilk compiler is based on a recent stable version of the LLVM `clang`
compiler.  In addition to OpenCilk-specific options, the OpenCilk compiler
supports all flags and features of LLVM `clang`, including optimization-level
flags, debug-information flags, and target-dependent compilation options.  See
the [LLVM Clang
documentation](https://releases.llvm.org/14.0.0/tools/clang/docs/ClangCommandLineReference.html)
for more information on the command-line arguments.


## Running the program on multiple cores

A Cilk program compiled with OpenCilk will automatically execute in parallel,
using all available cores.  For example, on a laptop with an 8-core Intel Core
i7-10875H CPU:

```shell-session
$ ./fib 40 
fib(40) = 102334155
Time(fib) = 0.368499700 sec
```

To explicitly set the number of parallel Cilk workers for a program execution,
set the `CILK_NWORKERS` environment variable.  For example, to execute `fib`
using only 2 parallel cores:

```shell-session
$ CILK_NWORKERS=2 ./fib 40
fib(40) = 102334155
Time(fib) = 1.459649400 sec
```


## Using Cilksan

Use the OpenCilk Cilksan race detector to verify that your
parallel Cilk program is deterministic.  Cilksan instruments a program to
detect {% defn "determinacy race" %} bugs at runtime.  Cilksan is guaranteed to
find any and all determinacy races that arise in a given program execution.  If
there are no races, Cilksan will report that the execution was race-free.

To check for determinacy races with Cilksan, add the `-fsanitize=cilk` flag
during compilation and linking.  We also recommend the `-Og -g` flags for
debugging:

```shell-session
$ /opt/opencilk/bin/clang -fopencilk -fsanitize=cilk -Og -g nqueens.c -o nqueens
```

The `nqueens.c` code in this example contains a subtle determinacy race bug.
Running the Cilksan-instrumented `nqueens` program produces the following
output which shows us how two parallel strands attempt to read from and write
to the same memory address (through variables `a` and `b`, respectively).

```shell-session
$ ./nqueens 12
Running Cilksan race detector.
Running ./nqueens with n = 12.
Race detected on location 7f515c3f34f6
*     Read 4994b3 nqueens /home/user/opencilk/tutorial/nqueens.c:62:3
|        `-to variable a (declared at /home/user/opencilk/tutorial/nqueens.c:48)
+     Call 499da5 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
+    Spawn 4995b3 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
|*   Write 499586 nqueens /home/user/opencilk/tutorial/nqueens.c:65:10
||       `-to variable b (declared at /home/user/opencilk/tutorial/nqueens.c:50)
\| Common calling context
 +    Call 499da5 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
 +   Spawn 4995b3 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
[...output truncated...]
   Allocation context
    Stack object b (declared at /home/user/opencilk/tutorial/nqueens.c:50)
     Alloc 499493 in nqueens /home/user/opencilk/tutorial/nqueens.c:61:16
      Call 499da5 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
     Spawn 4995b3 nqueens /home/user/opencilk/tutorial/nqueens.c:67:29
[...output truncated...]

Time(nqueens) = 2.325475944 sec
Total number of solutions : 14200

Cilksan detected 1 distinct races.
Cilksan suppressed 3479367 duplicate race reports.
```

Programs instrumented with Cilksan are always run serially, regardless of the
number of processors that are available or specified.  The instrumented program
is expected to run up to several times slower than its non-instrumented serial
counterpart.

{% alert "info" %}
***macOS users:*** On macOS, the compiled `nqueens.c` binary uses builtins that
Cilksan does not currently recognize.  To work around this behavior, add the
flag `–D_FORTIFY_SOURCE=0` when compiling:

```shell-session
$ xcrun /opt/opencilk/bin/clang -fopencilk -fsanitize=cilk -Og -g -D_FORTIFY_SOURCE=0 nqueens.c -o nqueens
```
{% endalert %}


## Using Cilkscale

Use the OpenCilk [Cilkscale scalability analyzer](/doc/users-guide/cilkscale) script to measure
the work, span, and parallelism of your Cilk program, and to benchmark
its parallel speedup on different numbers of cores.

To measure work and span with Cilkscale, add the `-fcilktool=cilkscale`
flag during compilation and linking:

```shell-session
$ /opt/opencilk/bin/clang -fopencilk -fcilktool=cilkscale -O3 qsort.c -o qsort
```

Running the Cilkscale-instrumented program will output work, span, and
parallelism measurements in CSV format at the end of the execution.  For
example:

```shell-session
$ ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
Time(sample_qsort) = 0.721748768 sec
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,7.32019,0.168512,43.4402,0.168877,43.3462
```

To output the Cilkscale measurements to a file, set the `CILKSCALE_OUT`
environment variable:

```shell-session
$ CILKSCALE_OUT=qsort_workspan.csv ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
Time(sample_qsort) = 0.711326910 sec
$ cat qsort_workspan.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,7.15883,0.168538,42.4761,0.168909,42.3828
```

{% alert "info" %}

***Work-span analysis of specific program regions:*** By default, Cilkscale
will only analyze whole-program execution.  To analyze specific regions of your
Cilk program, use the [Cilkscale work-span API](/doc/reference/cilkscale/#cc++-api-for-fine-grained-analysis).

{% alert "primary" %}

***Example:*** The tutorial program `qsort_wsp.c` shows how to modify the code
of `qsort.c` to measure the work and span of the core function
`sample_qsort()`.  Compiling `qsort_wsp.c` with Cilkscale and running the
instrumented binary will output an additional row in Cilkscale's CSV table with
the analysis results for `sample_qsort()`.

{% endalert %}

{% endalert %}

### Scalability benchmarking and visualization

Cilkscale also provides facilities to benchmark and plot the execution time of
your program (and each analyzed region) on different numbers of processors.

First, build your program twice, once with `-fcilktool=cilkscale` and once with
`-fcilktool=cilkscale-benchmark`:

```shell-session
$ /opt/opencilk/bin/clang -fopencilk -fcilktool=cilkscale -O3 qsort_wsp.c -o qsort_wsp
$ /opt/opencilk/bin/clang -fopencilk -fcilktool=cilkscale-benchmark -O3 qsort_wsp.c -o qsort_wsp_bench
```

Then, run the program with the Cilkscale benchmarking and visualizer Python
script, which is found at `share/Cilkscale_vis/cilkscale.py` within the
OpenCilk installation directory.  For example:

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py -c ./qsort_wsp -b ./qsort_wsp_bench --args 10000000
Namespace(args=['10000000'], cilkscale='./qsort_wsp', cilkscale_benchmark='./qsort_wsp_bench',
cpu_counts=None, output_csv='out.csv', output_plot='plot.pdf', rows_to_plot='all')

>> STDOUT (./qsort_wsp 10000000)
Sorting 10000000 integers
All sorts succeeded
Time(sample_qsort) = 0.713108289 sec
<< END STDOUT

>> STDERR (./qsort_wsp 10000000)
<< END STDERR

INFO:runner:Generating scalability data for 8 cpus.
INFO:runner:CILK_NWORKERS=1 taskset -c 0 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=2 taskset -c 0,2 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=3 taskset -c 0,2,4 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=4 taskset -c 0,2,4,6 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=5 taskset -c 0,2,4,6,8 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=6 taskset -c 0,2,4,6,8,10 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=7 taskset -c 0,2,4,6,8,10,12 ./qsort_wsp_bench 10000000
INFO:runner:CILK_NWORKERS=8 taskset -c 0,2,4,6,8,10,12,14 ./qsort_wsp_bench 10000000
INFO:plotter:Generating plot
```

Running the `cilkscale.py` script as above does the following:

1. Measures the work, span, and parallelism of `qsort_wsp` with argument
   `10000000`.
2. Runs and times the program with $1$, $2$, ..., $P$ parallel Cilk workers,
   where $P$ is the number of available physical cores (in this case, $P = 8$)
3. Outputs the analysis and benchmarking results as a CSV table (`out.csv`) and
   as plots in a PDF document (`plot.pdf`).

For more information on the Cilkscale scalability analysis and visualization
script, see the [Cilkscale documentation page](/doc/users-guide/cilkscale).