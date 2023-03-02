---
layout: layouts/page.njk
sidebar: toc
title: Open projects
eleventyNavigation:
  key: Open projects
  order: 1
---

We are looking for people to help us with the following projects with OpenCilk. If you see anything interesting, please [contact us](/contribute/contact/).

## Language server

Develop an **OpenCilk [language server](https://microsoft.github.io/language-server-protocol/)** that integrates with OpenCilk's tools.  For example, the language server would integrate with Cilksan to allow editors to mark locations in the program's source that are involved in a determinacy race.

## Cilksan reporting

Improve the output of Cilksan to syntax-highlight names of functions in the call stack, especially the namespaces and types in C++ function names.

## Debuggers

- Fix GDB to correctly identify stack frames in the cactus stack of a Cilk program.
- Fix the RR debugger's behavior to handle Cilk's stack switching when rewinding the parallel execution of a Cilk program.