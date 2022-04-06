---
title: OpenCilk language specification
eleventyNavigation:
  key: Language specification
---

## Formatting

Here we would like to have the content from https://cilk.mit.edu/docs/OpenCilkLanguageExtensionSpecification.htm. I am hoping to convert that HTML to markdown (e.g. so that the TOC sidebar is generated) and I am discovering glitches in the transformation. So this is a work in progress.

## Introduction

This document is one of a set of technical specifications describing the
OpenCilk language and the run-time support for the language. Together,
these documents provide the detail needed to implement a compliant
compiler. At this time the following specifications are available:

-   The OpenCilk Language Specification, this document
-   The OpenCilk Application Binary Interface

This document defines the OpenCilk extension to C and C++. The language
extension is supported by a run-time user-mode work-stealing task
scheduler which is not directly exposed to the application programmer.
However, some of the semantics of the language and some of the
guarantees provided require specific behavior of the task scheduler. The
programmer visible parts of the language include the following
constructs:

1.  Three keywords (`_Cilk_spawn`, `_Cilk_sync` and `_Cilk_for`) to
    express tasking
2.  Hyperobjects, which provide local views to shared objects

An implementation of the language may take advantage of all parallelism
resources available in the hardware. On a typical CPU, these include at
least multiple cores and vector units. Some of the language constructs,
e.g. `_Cilk_spawn`, utilize only core parallelism; some, e.g. SIMD
loops, utilize only vector parallelism, and some, e.g. SIMD-enabled
functions, utilize both. The defined behavior of every deterministic
Cilk program is the same as the behavior of a similar C or C++ program
known as the "serialization." While execution of a C or C++ program may
be considered as a linear sequence of statements, execution of a tasking
program is in general a directed acyclic graph. Parallel control flow
may yield a new kind of undefined behavior, a "data race," whereby parts
of the program that may execute in parallel access the same memory
location in an indeterminate order, with at least one of the accesses
being a write access. In addition, ~~throwing~~ [if]{.underline} an
exception ~~may result in~~ [is thrown,]{.underline} code ~~being~~ [may
still be]{.underline} executed that would not have been executed in a
serial execution.

[The word "shall" is used in this specification to express a diagnosable
constraint on a Cilk Plus program.]{.underline}

## Related documents

1.  The OpenCilk Application Binary Interface
2.  ISO/IEC 9899:2011, Information Technology -- Programming languages
    -- C
3.  ISO/IEC 14882:2011, Information Technology -- Programming languages
    -- C++
4.  [OpenMP Application Program Interface, Version 4.0 - July
    2013]{.underline}

## Keywords for Tasking

OpenCilk adds the following new keywords:

-   `_Cilk_sync`
-   `_Cilk_spawn`
-   `_Cilk_for`

A program that uses these keywords other than as defined in the grammar
extension below is ill-formed.

### Keyword Aliases

The header `<cilk/cilk.h>` defines the following aliases for the Cilk
keywords:

    #define cilk_spawn _Cilk_spawn
    #define cilk_sync  _Cilk_sync
    #define cilk_for   _Cilk_for

### Grammar

The three keywords are used in the following new productions:

jump-statement:
:   `_Cilk_sync ;`

The call production of the grammar is modified to permit the keyword
`_Cilk_spawn` before the expression denoting the function to be called:

postfix-expression:
:   `_Cilk_spawn`~opt~ postfix-expression `(` expression-list~opt~ `)`

Consecutive `_Cilk_spawn` tokens are not permitted. The
postfix-expression following `_Cilk_spawn` is called a spawned function.
~~The spawned function may be a normal function call, a member-function
call, or the function-call (parentheses) operator of a function object
(functor) or a call to a lambda expression.~~ Overloaded operators other
than the parentheses operator may be spawned only by using the
function-call notation (e.g., `operator+(arg1,arg2)`). There shall be no
more than one `_Cilk_spawn` within a full expression. A function that
contains a spawn statement is called a spawning function.

Note: The spawned function [call]{.underline} may be a normal function
call, a member-function call, the function-call (parentheses) operator
of a function object (functor), or a call to a lambda expression.

A program is ~~considered~~ ill formed if the `_Cilk_spawn` form of this
expression appears other than in one of the following contexts:

-   as the ~~entire body~~ [full-expression]{.underline} of an
    expression statement,
-   as the entire right hand side of an assignment expression that is
    the ~~entire body~~ [full-expression]{.underline} of an expression
    statement, or
-   as the entire initializer-clause in a simple declaration [for an
    object with automatic storage duration]{.underline}.

~~(A `_Cilk_spawn` expression may be permitted in more contexts in the
future.)~~ [The rank of a spawned function call shall be zero. (See [The
section expression](#array.sect).)]{.underline}

A statement with a `_Cilk_spawn` on the right hand side of an assignment
or declaration is called an assignment spawn or
initializer spawn, respectively and the object assigned or initialized
by the spawn is called the receiver.

The iteration-statement is extended by adding another form of `for`
loop:

grainsize-pragma:
:   `# pragma cilk grainsize =` expression new-line

<!-- -->

iteration-statement:
:   grainsize-pragma~opt~ `_Cilk_for (` expression `;` expression `;`
    expression `)` statement
:   grainsize-pragma~opt~ `_Cilk_for (` declaration expression `;`
    expression `)` statement

[The three items inside parentheses in the grammar, separated by
semicolons, are called the initialization, condition, and increment,
respectively. (A semicolon is included in the grammar of
declaration.)]{.underline}

### Semantics

#### Tasking Execution Model

A strand is a serially-executed sequence of instructions that does not
contain a spawn point or sync point (as defined below). At a spawn
point, one strand (the initial strand) ends and two strands (the new
strands) begin. The initial strand ~~runs in series with~~ [is sequenced
before]{.underline} each of the new strands but the new strands [are
unsequenced with respect to one another (i.e. they]{.underline} may run
in parallel with each other[)]{.underline}. At a sync point, one or more
strands (the initial strands) end and one strand (the new strand)
begins. The initial strands ~~may run in parallel with one another~~
[are unsequenced with respect to one another]{.underline} but each of
the initial strands ~~runs in series with~~ [is sequenced
before]{.underline} the new strand. A single strand can be subdivided
into a sequence of shorter strands in any manner that is convenient for
modeling the computation. A maximal strand is one that cannot be
included in a longer strand.

The strands in an execution of a program form a directed acyclic graph
(DAG) in which spawn points and sync points comprise the vertices and
the strands comprise the directed edges, with time defining the
direction of each edge. (In an alternative DAG representation, sometimes
seen in the literature, the strands comprise the vertices and the
dependencies between the strands comprise the edges.)

#### [Serialization rule]

The behavior of a deterministic OpenCilk program is defined in terms of
its serialization, as defined in this section. If the serialization has
undefined behavior, the OpenCilk program also has undefined behavior.

The strands in an execution of a program are ordered according to the
order of execution of the equivalent code in the program\'s
serialization. Given two strands, the earlier strand is defined as the
strand that would execute first in the serial execution of the same
program with the same inputs, even though the two strands may execute in
either order or concurrently in the actual parallel execution.
Similarly, the terms "earliest," "latest," and "later" are used to
designate strands according to their serial ordering. The terms "left,"
"leftmost," "right," and "rightmost" are equivalent to "earlier,"
"earliest," "later," and "latest," respectively.

**The serialization of a pure C or C++ program is itself.**

If a C or C++ program has defined behavior and does not use the tasking
keywords or library functions, it is an OpenCilk with the same defined
behavior.

**The serializations of `_Cilk_spawn` and `_Cilk_sync` are empty.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by removing all instances of the keywords
`_Cilk_spawn`, and `_Cilk_sync`.

**The serialization of `_Cilk_for` is `for`.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by replacing each instance of the `_Cilk_for` keyword
with `for`.
