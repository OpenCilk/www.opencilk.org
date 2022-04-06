---
title: Compile and run
---

To compile and run a program using OpenCilk, follow these two
steps:
1. [Compile](#compiling-a-cilk-program) the Cilk program using the
  OpenCilk compiler by passing the additional `-fopencilk` compiler
  flag, then
2. [Run](#running-a-cilk-program) the resulting executable.

This page provides details on how to compile and run a Cilk program
using OpenCilk.

## Compiling a Cilk program

You can compile a Cilk program similarly to a C or C++ program by
passing the additional `-fopencilk` flag to `clang` or `clang++`,
respectively:

```bash
$ clang -o fib fib.c -fopencilk -O3
```

### "Note" 
Pass the `-fopencilk` flag
to the compiler both when compiling and linking the Cilk program.
During compilation, the flag ensures that the Cilk keywords are
recognized and compiled.  During linking, the flag links ensures the
program is properly linked with the OpenCilk runtime library.

The OpenCilk compiler is based on a recent stable version of the clang
compiler.  It supports all compiler flags and features that the
ordinary clang compiler supports, including optimization-level flags,
debug-information flags, and target-dependent compilation options.
See the [Clang
documentation](https://clang.llvm.org/docs/ClangCommandLineReference.html)
for more information on the command-line arguments.

## Running a Cilk program

To run the Cilk program, simply invoke the compiled executable binary:

```bash
$ ./fib 42
```

You can use the `CILK_NWORKERS` environment variable to run the Cilk
program with a specific number of workers.  The following example runs
the `fib` executable using 8 Cilk workers:

```bash
$ CILK_NWORKERS=8 ./fib 42
```
