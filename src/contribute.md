---
layout: layouts/page.njk
stylesheet: users-guide.css
background: bg-white
sidebar: toc
title: Contribute to OpenCilk
eleventyNavigation:
  key: Contribute
  parent: Home
  order: 7
---

The OpenCilk project welcomes your expertise and enthusiasm. A few specific opportunities are listed below. If you see anything interesting, or have ideas that we haven't thought of, please [contact us](/contribute/contact/).


## Teaching

{% imgLeft "/img/owl.png", 60 %}
Are you teaching with OpenCilk?

We hope you'll join our [community of educators](/community/teach-performance) who are developing resources for teaching topics in software performance engineering.

## Documenting
Are you doing something with performance engineering that you want people to hear about? Are you writing how-tos or tutorials to help students with OpenCilk? We would love to hear! Have you prepared a presentation, video, or other educational materials about OpenCilk? Let us know! If you’re unsure where to start or how your skills fit in, [reach out](/contribute/contact/)! 

## Open projects
We are looking for people to help us with several OpenCilk projects, including develping an OpenCilk language server, improving Cilksan reporting, and fixing relevant debuggers to interface properly with the OpenCilk runtime system. See [open projects](./open-projects) for more.

## Testing
We are interested in your experiences or issues in installing and writing code and running OpenCilk programs.
We are also interested in collecting performance figures for different computer systems.
- Please report compiler bugs at https://github.com/OpenCilk/opencilk-project/issues
- Please report runtime bugs at https://github.com/OpenCilk/cheetah/issues
- Please report website and documentation bugs at https://github.com/OpenCilk/www.opencilk.org/issues

## Porting and scripting
You can help by porting OpenCilk to other platforms, and writing scripts to automate release testing.

## Coding
Want to customize your own compiler or runtime environment? Check out OpenCilk code that's maintained in these GitHub repositories:

- [Infrastructure](https://github.com/OpenCilk/infrastructure): OpenCilk build scripts and instructions reside here. (See also the [Build from source](/doc/users-guide/build-opencilk-from-source/) page.)
- [OpenCilk project](https://github.com/OpenCilk/opencilk-project): Forked from [LLVM](https://github.com/llvm/llvm-project), the compiler code resides here.
- [Cheetah](https://github.com/OpenCilk/cheetah): Code for the runtime system resides here.
- [Productivity tools](https://github.com/OpenCilk/productivity-tools): Code for Cilksan, Cilkscale, and other tools lives here.

In addition to developing the OpenCilk codebase, we need your help extending existing code libraries to run in parallel with OpenCilk. Notable opportunities include the C++ Standard Template Library (STL) and the [GraphBLAS](https://graphblas.org/) Graph Linear Algebra API.  Also improving the productivity tools.

## Postdoc Positions

The Supertech research group in the MIT Computer Science and Artificial Intelligence Laboratory seeks multiyear Postdoctoral Associates to join the OpenCilk development team led by Professor Charles E. Leiserson, Dr. Tao B. Schardl, and Research Scientist Dorothy Curtis. The open-source OpenCilk software platform, a new implementation of the Cilk parallelprogramming platform, will feature a superior compiler based on the Tapir/LLVM compiler (Best Paper, PPoPP 2017), a new work-stealing runtime system, and a suite of parallelprogramming productivity tools. Candidates should be recent Ph.D. graduates in computer science and engineering with excellent C/C++ programming skills and publications in one or more of the following areas:
- parallel computing (particularly multicore);
- language runtime systems and compilers (especially LLVM);
- software productivity tools;
- user interface design and implementation;
- software performance engineering (writing fast code);
- lgorithms and data structures;
- software engineering, testing, benchmarking, and/or release management;
- cloud environments and operating systems.

Please see additional details here:
[PostdocFlyer.pdf](https://github.com/OpenCilk/www.opencilk.org/files/8886546/PostdocFlyer.pdf)

