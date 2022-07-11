---
title: Getting started
eleventyNavigation:
  order: -2
---
First, [install OpenCilk](/doc/users-guide/install).  Then, download the
[tutorial](https://github.com/OpenCilk/tutorial) code examples and enter the
cloned directory:

```shell-session
$ git clone https://github.com/OpenCilk/tutorial
$ cd tutorial
```

Let us walk through the steps of building, running, and testing a program with
OpenCilk.

{% alert "info" %}
***Note:*** The rest of this guide assumes that OpenCilk is installed within
`/opt/opencilk/` and that `clang` points to the OpenCilk C compiler at
`/opt/opencilk/bin/clang`.
{% endalert %}

## Using the compiler

To compile a Cilk program with OpenCilk, pass the `-fopencilk` flag to Clang
(or Clang++).  For example:

```shell-session
$ clang -fopencilk -O3 fib.c -o fib
```

{% alert "info" %}
***Note:*** Pass the `-fopencilk` flag to the compiler both when compiling
and linking the Cilk program.  During compilation, the flag ensures that the
Cilk keywords are recognized and compiled.  During linking, the flag links
ensures the program is properly linked with the OpenCilk runtime library.
(*Former users of Intel Cilk Plus with GCC:* make sure you do *not* include
the `-lcilkrts` flag when linking.)
{% endalert %}

The OpenCilk compiler is based on a recent stable version of the LLVM `clang`
compiler.  It supports all compiler flags and features that LLVM `clang`
supports, including optimization-level flags, debug-information flags, and
target-dependent compilation options. See the [Clang
documentation](https://releases.llvm.org/12.0.0/tools/clang/docs/ClangCommandLineReference.html)
for more information on the command-line arguments.

### macOS

On macOS, `clang` needs standard system libraries and headers which are provided by
[XCode](https://developer.apple.com/support/xcode/) or the [XCode Command Line
Tools](https://mac.install.guide/commandlinetools/index.html).  To run the
OpenCilk compiler with those libraries and headers, invoke the `clang` binary
with `xcrun`.  For example:

```shell-session
$ xcrun clang -fopencilk -O3 fib.c -o fib
```

## Running the program on multiple cores

The program will automatically execute in parallel, using all available cores.

```shell-session
$ ./fib 35
fib(35) = 9227465
```

To explicitly set the number of parallel Cilk workers for a program execution,
set the `CILK_NWORKERS` environment variable.  For example:

```shell-session
$ CILK_NWORKERS=2 ./fib 35
fib(35) = 9227465
```

## Using Cilksan

Use the OpenCilk Cilksan race detector to verify that your parallel Cilk
program is deterministic.  Cilksan instruments a program to detect determinacy
race bugs at runtime.  It is guaranteed to find any and all determinacy races
that arise in a given program execution.  If there are no races, Cilksan will
report that the execution was race-free.

To check for determinacy races with Cilksan, add the `-fsanitize=cilk` flag
during compilation and linking.  We also recommend the `-Og -g` flags for
debugging:

```shell-session
$ clang -fopencilk -fsanitize=cilk -Og -g nqueens.c -o nqueens
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

1.137000
Total number of solutions : 14200

Cilksan detected 1 distinct races.
Cilksan suppressed 781409 duplicate race reports.
```

Programs instrumented with Cilksan are always run serially, regardless of the
number of processors that are available or specified.  The instrumented program
is expected to run up to several times slower than its non-instrumented serial
counterpart.

{% alert "info" %}
***Note:*** On macOS, the compiled `nqueens.c` binary uses builtins that
Cilksan does not currently recognize.  To work around this behavior, add the
flag `–D_FORTIFY_SOURCE=0` when compiling:

```shell-session
$ clang -fopencilk -fsanitize=cilk -Og -g -D_FORTIFY_SOURCE=0 nqueens.c -o nqueens
```
{% endalert %}

## Using Cilkscale

Use the OpenCilk Cilkscale scalability analyzer and benchmarking script to
measure the [work,
span, and parallelism](../../../posts/2022-05-20-what-the-is-parallelism-anyhow/ "What the $#@! is parallelism, anyhow?") of your Cilk program, and to
benchmark parallel speedup on different numbers of cores.

To measure work and span with Cilkscale, add the `-fcilktool=cilkscale`
flag during compilation and linking:

```shell-session
$ clang -fopencilk -fcilktool=cilkscale -O3 qsort.c -o qsort
```

Running the Cilkscale-instrumented program will output work, span, and
parallelism measurements in CSV format at the end of the execution.  For
example:

```shell-session
$ ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,14.511,0.191245,75.8764,0.191514,75.7699
```

To output the Cilkscale measurements to a file, set the `CILKSCALE_OUT`
environment variable:

```shell-session
$ CILKSCALE_OUT=qsort_workspan.csv ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
$ cat qsort_workspan.csv
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
,13.9352,0.177858,78.35,0.178218,78.1917
```

### Analyzing a region

By default, Cilkscale will only analyze whole-program execution.  To analyze
specific regions of a program, annotate the code accordingly using the
Cilkscale API. 

For example, to measure the work and span of the core function `sample_qsort`
in the tutorial `qsort.c` code:

```c
…
#include <cilk/cilkscale.h>
…
int main(int argc, char **argv) {
  // …
  wsp_t start, end;
  start = wsp_getworkspan();
  sample_qsort(a, a + n); /* <-- analyze this */
  end = wsp_getworkspan(); 
  // …
  wsp_dump(wsp_sub(end, start), "sample_qsort");
  // …
}
```

Then, recompile with Cilkscale and rerun:

```shell-session
$ clang -fopencilk -fcilktool=cilkscale -O3 qsort.c -o qsort
$ ./qsort 10000000
Sorting 10000000 integers
All sorts succeeded
tag,work (seconds),span (seconds),parallelism,burdened_span (seconds),burdened_parallelism
sample_qsort,14.3595,0.13184,108.916,0.132084,108.715
,14.412,0.184341,78.181,0.184585,78.0777
```

Every analyzed region appears as a separate row in the Cilkscale CSV output,
tagged with the string that was passed in the corresponding call to `wsp_dump()`.

### Scalability benchmarking and visualization

Cilkscale can also be used to benchmark and plot the execution time of your
program (and each analyzed region) on different numbers of processors.

First, build your program twice,

* once with `-fcilktool=cilkscale`, and
* once with `-fcilktool=cilkscale-benchmark`:

```shell-session
$ clang -fopencilk -fcilktool=cilkscale -O3 qsort.c -o qsort
$ clang -fopencilk -fcilktool=cilkscale-benchmark -O3 qsort.c -o qsort-bench
```

Then, run the program with the Cilkscale benchmarking and visualizer Python
script, which is found at `share/Cilkscale_vis/cilkscale.py` within the
OpenCilk installation directory: 

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py \
    -c qsort -b qsort-bench --args 10000000
```

This will first measure work, span, and parallelism; run the program with $1$,
$2$, ..., $P$ Cilk workers (where $P$ is the number of available physical
cores) and time the execution; and output the results as a CSV table (`out.csv`) and as
plots in a PDF document (`plot.pdf`):

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py -c qsort -b qsort-bench --args 10000000
Namespace(args=['10000000'], cilkscale='./qsort', cilkscale_benchmark='./qsort_bench',
cpu_counts=None, output_csv='out.csv', output_plot='plot.pdf', rows_to_plot='all')

>> STDOUT (./qsort 10000000)
Sorting 10000000 integers
All sorts succeeded
<< END STDOUT

>> STDERR (./qsort 10000000)
<< END STDERR

INFO:runner:Generating scalability data for 8 cpus.
INFO:runner:CILK_NWORKERS=1 taskset -c 0 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=2 taskset -c 0,2 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=3 taskset -c 0,2,4 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=4 taskset -c 0,2,4,6 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=5 taskset -c 0,2,4,6,8 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=6 taskset -c 0,2,4,6,8,10 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=7 taskset -c 0,2,4,6,8,10,12 ./qsort_bench 10000000
INFO:runner:CILK_NWORKERS=8 taskset -c 0,2,4,6,8,10,12,14 ./qsort_bench 10000000
INFO:plotter:Generating plot
```

To see all options of the Cilkscale `cilkscale.py` script, pass it the `--help`
argument:

```shell-session
$ python3 /opt/opencilk/share/Cilkscale_vis/cilkscale.py --help
```