---
title: Features of OpenCilk
eleventyNavigation:
  order: -1
---

## Summary

- The `cilk_spawn`, `cilk_sync`, and `cilk_for` keywords are enabled by using
  the `-fopencilk` compiler flag and including `<cilk/cilk.h>`.
- The `cilk_scope` keyword specifies that all spawns within a given
  lexical scope are guaranteed to be synced upon exiting that lexical
  scope.  Like the other Cilk keywords, `cilk_scope` is available by
  using the `-fopencilk` compiler flag and including `<cilk/cilk.h>`.
- The compiler is based on [LLVM 12][llvm-12-doc] and supports the usual
  [`clang`][clang-12-doc] options.
- Both C and C++ are supported, including all standards supported by LLVM 12.
- Prototype support for C++ exceptions is included.
- Experimental support for pedigrees and built-in deterministic parallel 
  random-number generation is available.  To enable pedigree support, compile and
  link all Cilk code with the flag `-fopencilk-enable-pedigrees`.
- Reducer hyperobjects are supported using the Intel Cilk Plus reducer library
  — i.e., the hyperobject headers from Intel Cilk Plus — except that it is
  not valid to reference the view of a C reducer after calling
  `CILK_C_UNREGISTER_REDUCER`.
- Cilksan instrumentation for determinacy-race detection is enabled by using the
  `-fsanitize=cilk` compiler flag.  Cilksan supports reducers and Pthread mutex
  locks.  In addition, Cilksan offers an API for controlling race detection, which
  is available by including `<cilk/cilksan.h>`.
- Cilkscale instrumentation for scalability analysis and profiling is enabled by
  using the `-fcilktool=cilkscale` compiler flag.  Cilkscale offers an API for
  analyzing user-specified code regions, which is made available by including
  `<cilk/cilkscale.h>`, and includes facilities for benchmarking an application
  on different numbers of parallel cores and visualizing the results.

## Compatibility with Cilk Plus

OpenCilk 1.1 is largely compatible with Intel's latest release of Cilk
Plus.  Unsupported features include:

- Cilk Plus array-slice notation.
- Certain Cilk Plus API functions, such as `__cilkrts_set_param()`.

To port a Cilk Plus program to OpenCilk, once all uses of unsupported features 
have been updated, make the following changes to your build process:

- When compiling the program, replace any uses of `-fcilkplus` with `-fopencilk`.
- When linking the program, replace any uses of `-lcilkrts` with `-fopencilk`.

[llvm-12-doc]:  https://releases.llvm.org/12.0.0/docs/index.html
[clang-12-doc]: https://releases.llvm.org/12.0.0/tools/clang/docs/index.html
