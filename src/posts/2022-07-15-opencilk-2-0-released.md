---
layout: layouts/post.njk
title: OpenCilk 2.0 released
tagline: OpenCilk 2.0 features a new syntax and implementation for reducer
  hyperobjects, an upgraded compiler, improved support for pedigrees, and more.
author: Tao B. Schardl
date: 2022-07-20T19:08:51.844Z
tags:
  - news
  - release
---
OpenCilk 2.0 is now available.  See the [Install](/doc/users-guide/install) page for instructions on how to download and install.

## Major changes

OpenCilk 2.0 features the following major changes from OpenCilk 1.1:
- **[Beta]** Cilk reducer hyperobjects (a.k.a., reducers) are now supported through a new language syntax and implementation.  A local or global variable in C or C++ can be made into a reducer by adding `cilk_reducer(I,R)` to its type, where `I` and `R` designate the identity and reduce functions for the reducer.  See the [Reducer documentation](/doc/reference/reducers) for details.

- The compiler has been upgraded to be based on LLVM 14.0.6.
- Support for pedigrees and built-in deterministic parallel random-number generation has been improved and optimized.  In particular, pedigrees are now correctly updated at both spawns and syncs.
- Support for pedigrees has been streamlined.  To enable pedigree support, simply link the Cilk program with the pedigree library, `-lopencilk-pedigrees`.
- Many bug fixes and performance improvements have been included compared to the previous version.

## Known limitations
- Reducers must be global variables and local variables.  In particular, OpenCilk 2.0 does not support reducers as struct or class members or as heap-allocated objects.  See the [Reducer documentation](/doc/reference/reducers) for details.
- Support for the Intel Cilk Plus reducer library has been removed.
- With the compiler now based on LLVM 14, the default DWARF version is now DWARFv5.  If you encounter an error when using a tool such as `unhandled dwarf2 abbrev form code 0x25`, then the tool does not support DWARFv5.  You can opt back into using the old DWARF version by passing either `-gdwarf-4` or `-fdebug-default-version=4` to `clang` when you compile the program.
- The default setting of floating-point contraction is now `-ffp-contract=on`.  As a result, floating-point computation may behave differently with this version of OpenCilk.  You can opt back into the old floating-point-contraction behavior by passing the compiler flag `-ffp-contract=off`.  See [here](https://releases.llvm.org/14.0.0/tools/clang/docs/ReleaseNotes.html#floating-point-support-in-clang) for more details.
- There are some standard library functions and LLVM intrinsic functions that Cilksan does not recognize.  When Cilksan fails to recognize such a function, it may produce a link-time error of the form, `undefined reference to '__csan_FUNC'` for some function name `__csan_FUNC`.
  - Please report these missing functions as issues on the [OpenCilk issue tracker](https://github.com/OpenCilk/opencilk-project/issues).
  - **[Beta]** You can work around this issue by passing the additional flag ``-mllvm -cilksan-bc-path=`find /path/to/opencilk/ -name "libcilksan.bc"` `` when compiling the Cilk program.

## Acknowledgments

Thanks to everyone who contributed to the development of OpenCilk 2.0, via code contributions, testing, or in other ways.  In particular, we would like to thank the following external contributors:
- Brian Wheatman
- Teo Collin
- William Luo