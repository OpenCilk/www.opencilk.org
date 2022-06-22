---
title: OpenCilk 1.1 released
excerpt: OpenCilk 1.1 features the new `cilk_scope` keyword, interactive debugging of determinacy races, and many bug fixes and performance improvements.
date: 2021-10-22
author: TB Schardl
featured: true
tags: 
 - news
 - release
thumbnail: /img/super-mario.png # relative to /src/static/img/
---

OpenCilk 1.1, which includes with numerous features, fixes, and performance improvements, is now available.
Go to [Install](/doc/users-guide/install/) to download the right package for your system.

## Major changes in Version 1.1

- **[New]** OpenCilk now supports the `cilk_scope` keyword for specifying
  a lexical scope in which all spawns are guaranteed to be synced upon
  exiting that scope.
- **[Beta]** Cilksan now integrates with a [custom
  version](https://github.com/OpenCilk/rr) of the RR reverse debugger
  to enable interactive debugging of determinacy races.
- AddressSanitizer can now check OpenCilk programs for memory errors.
- The OpenCilk compiler has been upgraded to be based on
  [LLVM 12](https://releases.llvm.org/12.0.0/docs/index.html).
- Cilkscale now links correctly when building shared libraries with
  the `-fcilktool=cilkscale` flag.
- OCaml bindings to Tapir in the compiler have been updated, thanks to
  [@Willtor](https://github.com/Willtor).
- Version 1.1 includes many bug fixes and performance improvements
  over version 1.0, including performance improvements to the runtime
  system.

## Known issues

- We are preparing complete documentation for OpenCilk, including the 
Cilkscale and Cilksan APIs.  Stay tuned!
- The OpenCilk runtime system limits the number of active reducers to 1024.
- Similarly to C/C++ programs, large stack allocations can cause memory
errores due to overflowing OpenCilk's cactus stack.
- There are some library and LLVM intrinsic functions that Cilksan
does not recognize.  When Cilksan fails to recognize such a function, it may
produce a link-time error of the form, `undefined reference to '__csan_FUNC'`
for some function name `__csan_FUNC`.
  - Please [report](https://github.com/OpenCilk/opencilk-project/issues)
these missing functions to us as bug reports when you encounter them.
  - While we prepare a fix for the issue, you can work around the issue
by adding the following code to your program, replacing `__csan_FUNC` with
the name of the function in the error message:
```c
#ifdef __cilksan__
#ifdef __cplusplus
extern "C" {
#endif
void __csan_default_libhook(uint64_t call_id, uint64_t func_id, unsigned count);
void __csan_FUNC(uint64_t call_id, uint64_t func_id, unsigned count) {
  __csan_default_libhook(call_id, func_id, count);
}
#ifdef __cplusplus
}
#endif
#endif
```
