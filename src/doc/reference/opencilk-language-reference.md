---
layout: layouts/page.njk
title: OpenCilk language reference
date: 2022-10-03T13:42:05.188Z
eleventyNavigation:
  key: Language specification
author: John Carr
attribution: false
---

OpenCilk is an extension to the C and C++ programming language adding
support for {% defn "task-parallel programming" %}.  It uses a
modified version of [clang](https://clang.llvm.org) (the C compiler
from the LLVM project) and a user-mode work-stealing scheduler.  At
the source level, OpenCilk has five additional keywords compared to C:

* `cilk_spawn`
* `cilk_sync`
* `cilk_scope`
* `cilk_for`
* `cilk_reducer`

This document describes the syntax and semantics of OpenCilk
constructs.  It is not meant to be an introduction or tutorial.

Informally, `cilk_spawn` marks a point where the program can be forked
into two parts running on different processors and `cilk_sync` marks a
point where those forks must be joined.  Forking is permissive and
joining is mandatory.  This is a fundamentally different model
compared to older forms of parallelism using C's `pthread_create` and
Java's `Thread.start`.  These functions encourage writing programs
that do not work without multithreading.

The statements executed in a task parallel program form a directed
acyclic graph (DAG).  A spawn node has one incoming edge and two
outgoing edges.  A sync node has one outgoing edge.  Two statements
are said to be logically parallel if neither precedes the other in DAG
order.  Whether they actually run in parallel (at the same time)
depends on scheduling.

```cilkc
  int x = cilk_spawn f(); // the body of f()...
  int y = g();            // ...runs in parallel with the body of g()
  cilk_sync;              // wait for f() to complete
  return x + y;           // the return is in series after what comes before
```

## Grammar

This section describes how the syntax of an OpenCilk program
differs from a C or C++ program.

All OpenCilk keywords and runtime functions require that the header
`<cilk/cilk.h>` be included.  The header `<cilk/cilk_stub.h>` can be
included to disable Cilk while still allowing the keywords.  If
neither header is included the Cilk keywords are treated as ordinary
identifiers.

### Spawn

A statement using `cilk_spawn` is the start of a potentially parallel
region of code.

The `cilk_spawn` keyword should appear at the start of a statement or
after the `=` sign of an assignment (or `+=`, `-=`, etc.).

```cilkc
int x = cilk_spawn f(0);
cilk_spawn y = f(1); // [TB says this is not the same as the previous]
cilk_spawn { z = f(2); }
```

[Only if cilk_spawn precedes the function call are the arguments
evaluated before the spawn.]

[Test op= forms and add an example or remove the allegation that
they are allowed.]

Although the compiler accepts spawns inside of expressions, they are
unlikely to have the expected semantics.  A future version of the
language may explicitly limit `cilk_spawn` to the contexts above,
at or near the top of the parse tree of a statement.

### Sync

A sync statement, `cilk_sync;`, ends a region of potentially parallel
execution.  It takes no arguments.

[Find a real example with a conditional sync.  Or have some spawns
to be synced.  Matteo Frigo's all pairs shortest path code has
conditional sync, says TB.]

```cilkc
if (time_to_sync)
  cilk_sync;
```

### Scope

The keyword `cilk_scope` is followed by a statement, normally a
compound statement.  Any spawns within the statement are synced before
exit from the statment.  Syncs within the statement, including the
implicit sync before exit, do not wait for spawns outside the
statement.

```cilkc
int w, x, y, z;
w = cilk_spawn f(0);
cilk_scope {
  x = cilk_spawn f(1);
  y = cilk_spawn f(2);
  z = f(3); // no need to spawn the last statement in a cilk_scope
}
// unsafe to access w because the spawn has not been synced
// x, y, and z are usable here because of the implicit sync
```

### For

A loop written using `cilk_for` executes each iteration of its body in
parallel.

```cilkc
cilk_for (int i = 0; i < n; ++i)
  sum += array1[i]; // sum needs to be a reducer
cilk_for (int i = 0; i < n; ++i)
  array2[i] = f(i);
```

The syntax of a `cilk_for` statement is very similar to a C `for`
statement.  It is followed by three expressions, the first of which
may declare variables.  Unlike in C all three expressions are
mandatory.  C++ range `for` constructs are not allowed.

For the loop to be parallelized, several conditions must be met:

* The first expression must declare a variable (the "loop variable").
* The second expression must compare the loop variable using one of the
  relational operators `<=`, `<`, `!=`, `>`, and `>=`.
* The value compared to must be [...]
* The third expression must modify the loop variable using `++`,
  `--`, `+=`, or `-=`.

The `break` statement may not be used to exit the body of a `cilk_for` loop.

[In the section on behavior, to be written,
discuss exceptions thrown from the loop body.
An exception probably aborts an unpredictable amount of
later work.]

#### Grain size

The compiler often recognizes that the overhead of allowing parallel
execution can exceed the benefit.  If the body of a loop does little
work the compiler will arrange for groups of consecutive iterations to
run sequentially.  This behavior can be manually overridden with a
pragma:

```cilkc
 #pragma cilk grainsize 128
 cilk_for (int i = 0; i < n; ++i) {
   array1[i] = f(i);
   array2[i] = f(i);
 }
```

The pragma in the example tells the compiler that groups of 128
consecutive iterations should be executed as a serial loop.  If there
are 1024 loop iterations in total, there are only 8 parallel tasks.

The argument to the grain size pragma must be an integer constant
in the range 1..2<sup>31</sup>-1.  [Do we want to deprecate this
range in favor of a smaller range, or in the other direction
up to a `size_t`?]


### Reducers

A type may be suffixed with `cilk_reducer`.  Syntactically it appears
where `*` may be used to declare a pointer type.  The type to the left
of `cilk_reducer` is the _view type_.

Two values appear in parentheses after `cilk_reducer`.  Both must be
function types returning `void`.  The first, the _identity callback_,
takes one argument of type `void *`.  The second, the _reduce callback_,
takes two arguments of type `void *`.

Two reducer types are the same if their view types are the same and
their callbacks are the same function mentioned by name.  Otherwise
two reducer types are different and not compatible.  This rule arises
from the impossibility of proving that two different functions are
identical.

```
    extern void identity(void *), reduce(void *, void *);
    extern void (*idp)(void *);
    int cilk_reducer(identity, reduce) type1;
    int cilk_reducer(identity, reduce) type2; // same as type1
    int cilk_reducer(idp, reduce) type3;
    int cilk_reducer(idp, reduce) type4; // not the same as type3
```

In the current version of OpenCilk the callbacks may be omitted.
This behavior may be removed in a future version of OpenCilk.

## Execution of an OpenCilk program

This section describes how the keywords added above may affect
execution.  A basic principle of Cilk is that the new keywords do not
necessarily change execution.  If `cilk_for` is replaced by `for` and
the other keywords are removed, the result is a valid C or C++ program
_with the same meaning_ called the {% defn "serial projection" %}.  A
program can be developed and debugged serially and parallelism added
later.

### Strand

A _{%defn "strand" %}_ is a series of instructions between one spawn
or sync and the next spawn or sync.  A strand executes on a single
thread.

#### Spawn

In some cases it is necessary to specify exactly where the spawn point
is in a spawn statement.

Contrary to the syntax, the spawn itself should be considered as
having a `void` value.  The compiler internally rewrites an expression
like

```cilkc
x = cilk_spawn f();
```

into

```cilkc
cilk_spawn { x = f(); }
```

In the current implementation all side effects other than
assignment of a function return value happen before the spawn.
The outermost function call of the spawned statement can be
considered the point of the spawn.
[The previous sentence was difficult for TB.]
[Probably rewrite the whole previous part.]

```cilkc
x[i++] = cilk_spawn f(a++, b++, c++);
// It is safe to access i, a, b, and c here (they have been incremented)
// but it is not safe to access the memory location being assigned.
```

While syntactically valid, code like

```cilkc
f(cilk_spawn i++);
```

does not work as expected:

```
nonsense.c:4:18: warning: Failed to emit spawn
  g(cilk_spawn i++);
                ^
1 warning generated.
```

The return value of spawn is like a promise or lazily evaluated value.
If it is consumed immediately the parallelism is lost.

As noted above, this syntax may be removed in a future version of
OpenCilk.

The code that follows the spawn point is called the _continuation_ of
the spawn.

#### Sync

A sync operation waits for previous spawns to complete before
continuing.

##### Explicit sync

An explicit sync is a statement using `cilk_sync`.  This form normally
has function scope, meaning it waits for all spawns in the same
function.  A sync inside the body of a `cilk_for` or `cilk_scope` only
waits for spawns inside the same construct.

Sync scopes are disjoint, so a sync outside a `cilk_for` or
`cilk_scope` never waits for a spawn belonging to one of these
inner scopes.  This situation does not normally occur.
[This handles
```cilkc
cilk_spawn cilk_scope { cilk_spawn ... }
```
]

##### Implicit syncs

In addition to the sync statements in the code, there is an implicit sync
before exit from some scopes:

* Before returning from a function, after calculating the value to
  be returned.  This sync has function scope.
* On exit from the body of a `try` block.  This sync has function scope.
  [Is this true?  Is it true only if the try block spawns?]
* On exit from a `cilk_scope` statement.  This sync has the scope of the
  `cilk_scope` statement.
* On exit from the body of a `cilk_for`, i.e. once per iteration of the loop.
  This sync has scope equal to the loop body.
  [Does grain size change this?]

[What about on entry to a try block?]

When exiting from a block scope, destructors for block scope variables
are run after the implicit sync.

## Differences between C++ and OpenCilk

In C++ code there are two exceptions to the rule that serial and
parallel programs are the same.

### Exceptions

If a spawned function throws an exception, the parent function may
have continued straight line execution past the spawn.  The serial
program goes directly to an exception handler.  The difference is
observable if the continuation has side effects.

When the parent function executes an implicit or explicit `cilk_sync`
the runtime checks whether the spawned child threw an exception.  If
it did, any exception thrown by the parent is discarded and the
exception thrown by the child is handled at the sync.  The compiler
inserts an implicit sync at the end of a try block if the try contains
a spawn.  [Make sure this is consistent with the wording in the implicit
syncs section.]

### Left hand side side effects

[TB can explain this]

## Races and reducers

Concurrency invites races.  If the same object is accessed by two
statements running in parallel, and at least one of the accesses is a
write, there is said to be a _{%defn "data race" %}_.  Data races have
undefined behavior.

[Do we want to clarify that atomic accesses are unspecified rather than undefined?]

### Reducers

{% defn "hyperobject", "Hyperobjects" %} are special variables that
can be accessed in parallel without data races.  The OpenCilk runtime
gives each thread running in parallel a separate copy of the variable
and merges the values as necessary.  The local copy of the variable is
called a _view_.

Because each thread may operate on a separate copy, the address of a
view is not constant.  This is also true of thread local variables,
but reducers do not follow the same rules as thread local variables.

The specific kind of hyperobject implemented by OpenCilk 2.0 is a
_reducer_.

A view of a reducer has a well-defined value in serial code and an
indeterminate value in parallel code.

monoid

value is unspecified; do read-modify-write operations and ignore the result

If the reduce callback does nothing the reducer is called a _holder_
and is essentially a form of thread-local storage.

#### Types

A declaration of a reducer requires a _{% defn "monoid" %}_.  Aside from
the view type, a reducer monoid includes two callback functions.

When declaring a type the `cilk_reducer` keyword is used in the same
contexts as `*` or (in C++) `&`.  It follows a type, which is referred
to as the _view type_ of the reducer.

```cilkc
int cilk_reducer(zero, plus) sum = 0;
int cilk_reducer(zero, plus) *sum_pointer = 0;
```

#### Values

At any point in execution the value in a reducer is based on a
contiguous subset of all prior modifications performed in the serial
order of the program.  The subset may be empty.

When all spawns since the initialization of the variable have been
synced, the variable has the serially correct value.


#### Handles

`__builtin_addressof`
