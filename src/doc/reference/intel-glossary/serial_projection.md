---
title: Serial projection
tags: serial projection
---
The C or C++ program that results from
stubbing out the keywords of a Cilk
program, where `cilk_spawn`, `cilk_scope`, and
`cilk_sync` are elided and `cilk_for` is
replaced with an ordinary `for`. The
serial projection can be used for debugging
and, in the case of a converted C/C++
program, will behave exactly as the
original C/C++ program. The terms "*serialization*" and "*serial elision*" are used in some of the literature.
Also, see "{% defn "serial semantics" %}".