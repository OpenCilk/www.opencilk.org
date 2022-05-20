---
title: Getting started
eleventyNavigation:
  order: -1
---

First, [install OpenCilk](/doc/users-guide/install) and download the tutorial code examples.

- https://github.com/OpenCilk/tutorial

```bash
git clone https://github.com/OpenCilk/tutorial
```

Then we will walk you through the steps of building, running, and testing a program with OpenCilk.

## Using the compiler

To compile a program with OpenCilk, pass the `–fopencilk` flag to Clang (or Clang++):

```bash
$ clang fib.c –o fib -O3 –fopencilk
$ ./fib 35
```

***Note:*** Pass the `-fopencilk` flag to the compiler both when compiling and linking the Cilk program. During compilation, the flag ensures that the Cilk keywords are recognized and compiled. During linking, the flag links ensures the program is properly linked with the OpenCilk runtime library.

The OpenCilk compiler is based on a recent stable version of the clang compiler. It supports all compiler flags and features that the ordinary clang compiler supports, including optimization-level flags, debug-information flags, and target-dependent compilation options. See the [Clang documentation](https://clang.llvm.org/docs/ClangCommandLineReference.html) for more information on the command-line arguments.

## Using Cilksan

Use the OpenCilk Cilksan race detector (Cilksan) to verify that there are no data races in the code. Note that any races will be exposed
using a small data set. Race conditions are
always analyzed with a single-processor run, regardless of the number of processors available or specified.

To test for determinacy races with Cilksan,
add the `–fsanitize=cilk` compiler flag.
We recommend the `-Og -g` flags for debugging:

```bash
$ clang nqueens.c –o nqueens –fopencilk –fsanitize=cilk –Og -g
$ ./nqueens 12
```

***Note:*** On MacOSX, the compiler compiles `nqueens.c`
using builtins that Cilksan does not currently
recognize. You can work around this behavior using
the flag `–D_FORTIFY_SOURCE=0` :

```bash
$ clang nqueens.c –o nqueens –fopencilk –fsanitize=cilk –Og –g \
> -D_FORTIFY_SOURCE=0
```

## Using Cilkscale

Use the OpenCilk Cilkscale scalability and performance analyzer (Cilkscale) to run your OpenCilk program on multiple processors and plot the speedup. 

To measure work and span with Cilkscale,
add the `–fcilktool=cilkscale` compiler flag:

```bash
$ clang qsort.c –o qsort –fopencilk –fcilktool=cilkscale –O3
$ ./qsort 10000000
```

### Analyzing a region

To analyze a region, annotate the `qsort.c` code using the Cilkscale API:

```c
#include <cilk/cilkscale.h>
int main(int argc, char **argv) {
  …
  wsp_t start, end;
  start = wsp_getworkspan();
  sample_qsort(a, a + n);
  end = wsp_getworkspan(); 
  …
  wsp_dump(wsp_sub(end, start), "sample_qsort");
  …
}
```

Then recompile and rerun using Cilkscale:

```bash
$ clang qsort.c –o qsort –fopencilk –fcilktool=cilkscale –O3
$ ./qsort 10000000
```

### Visualizing with Cilkscale

If it didn't come with your installation, download OpenCilk productivity-tools repository:

- https://github.com/OpenCilk/productivity-tools

```bash
$ git clone https://github.com/OpenCilk/productivity-tools.git
```


Compile the `qsort.c` program twice,

- once with `–fcilktool=cilkscale`, and
- once with `–fcilktool=cilkscale-benchmark`:

```bash
$ clang qsort.c –o qsort –fopencilk –fcilktool=cilkscale –O3
$ clang qsort.c –o qsort-bench –fopencilk –O3 \
> -fcilktool=cilkscale-benchmark
```

Run the program with the visualizer:

```bash
$ cd productivity-tools/Cilkscale_vis
$ python3 cilkscale.py –c ../../qsort –b ../../qsort-bench \
> --args 10000000 -rplot 0,1
```

Open plot.pdf to view the performance plot.


