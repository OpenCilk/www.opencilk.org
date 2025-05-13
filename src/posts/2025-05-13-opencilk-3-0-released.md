---
layout: layouts/post.njk
title: OpenCilk 3.0 released
tagline: Making it easier for you to write fast programs in your favorite IDE
author: Tao B. Schardl
date: 2025-05-13T19:08:51.844Z
image: /img/vscode-heart-opencilk.png
tags:
  - news
  - release
featured: true
---

We are excited to release [OpenCilk 3.0](https://github.com/OpenCilk/opencilk-project/releases/tag/opencilk%2Fv3.0). Among its many improvements, we’re especially excited that this version makes it easier for you to write fast programs in VS Code or the [LSP-based IDE](https://microsoft.github.io/language-server-protocol/implementors/tools/) of your choice.

{% img "/img/vscode-heart-opencilk.png", "160px" %}

### Your help wanted
We will upload precompiled OpenCilk binaries for select systems to [this release page](https://github.com/OpenCilk/opencilk-project/releases/tag/opencilk%2Fv3.0) once they are built and tested. If you would like to volunteer to provide OpenCilk binaries or other OpenCilk packaging for your system, please let us know by leaving a comment [here](https://github.com/OpenCilk/opencilk-project/discussions/336).

## New features and improvements

OpenCilk 3.0 includes the following new features and high-level improvements.

- [Beta feature] Add support for range `cilk_for` loops, a parallel version of [C++ range-for loops](https://en.cppreference.com/w/cpp/language/range-for), over containers that support [random-access iteration](https://en.cppreference.com/w/cpp/named_req/RandomAccessIterator).  For example, one can now write the following parallel loop over a `std::vector<T> v`:

    ```cpp
    cilk_for (auto x : v)
        do_stuff(x);
    ```

- Add support to VS Code and other [LSP](https://microsoft.github.io/language-server-protocol/)-based IDE's for `cilk_spawn`, `cilk_scope`, `cilk_for`, and `cilk_sync` keywords by extending a custom version of `clangd`.
  - See [here](https://github.com/neboat/vscode-opencilk) for a draft VS Code extension for OpenCilk and guidance on setting up VS Code to use OpenCilk's `clangd`.
- [Beta feature] Add support for Android, to allow Android apps to use Cilk for task-parallel C/C++.
  - See [here](https://github.com/OpenCilk/cheetah/blob/dev/android/README.md) for instructions on how to use OpenCilk on Android.
  - See [here](https://github.com/neboat/AndroidCilkHeatDemo/) for an example Android app that uses OpenCilk.
- Add support for C++ struct and class members to be Cilk reducer hyperobjects.
- Remove the need for user programs to include the `cilk/cilk.h` header file to use Cilk keywords.
- Upgrade the OpenCilk compiler to be based on [LLVM 19.1.7](https://releases.llvm.org/19.1.0/docs/ReleaseNotes.html).
- Fix many bugs and improve performance.

## Infrastructure improvements

Alongside this release are several improvements to the OpenCilk software ecosystem.

- GitHub actions are now available for building OpenCilk as part of a GitHub workflow: https://github.com/OpenCilk/actions.
- A repository of Cilk-5 benchmarks and Intel Cilk Plus benchmarks have been ported to OpenCilk and are publicly available: https://github.com/OpenCilk/smallapps.

## Acknowledgments

Thanks to @eliecuevas, @sualehasif, and @arvid220u, for contributing range-`cilk_for` loops to OpenCilk.

Thanks to everyone who helped us test this new OpenCilk release, including @wheatman, @DanielDeLayo, @MangoShip, and @Akatsukis.