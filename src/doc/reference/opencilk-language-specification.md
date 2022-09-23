---
layout: layouts/page.njk
title: OpenCilk language specification
date: 2022-07-14T21:37:03.433Z
eleventyNavigation:
  key: Language specification
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

Informally, `cilk_spawn` marks a point where the program can be forked
into two parts running on different processors and `cilk_sync` marks a
point where those forks must be joined.  Forking is permissive and
joining is mandatory.  This is a fundamentally different model
compared to older forms of parallelism using C's `pthread_create` and
Java's `Thread.start`.  These functions encourage writing programs
that do not work without multithreading.

The statements executed in a task parallel program form a %{ defn
"parallel trace", "directed acyclic graph" %} (DAG).  A spawn node has
one incoming edge and two outgoing edges.  A sync node has one
outgoing edge.  Two statements are said to be in parallel if neither
precedes the other in DAG order.

```cilkc
  int x = cilk_spawn f(); // the body of f()...
  int y = g();            // ...runs in parallel with the body of g()
  cilk_sync;              // wait for f() to complete
  return x + y;           // the return is in series after what comes before
```

## Grammar

### Spawn

The `cilk_spawn` keyword should appear at the start of an
expression-statement or after the `=` sign of an assignment
(or `+=`, `-=`, etc.).

```cilkc
int x = cilk_spawn f(0);
cilk_spawn y = f(1);
```

Although the compiler accepts spawns inside of expressions, they are
unlikely to have the expected semantics.

### Sync

A sync statement is the keyword `cilk_sync` followed by a semicolon.
It takes no arguments.

```cilkc
if (time_to_sync)
  cilk_sync;
```

A sync waits for previous spawns to complete before continuing.
Sync normally has function scope, meaning it waits for all spawns
in the same function.  A sync inside the body of a `cilk_for` or
`cilk_scope` only waits for spawns inside the same construct.

Sync scopes are disjoint, so a sync outside a `cilk_for` or
`cilk_scope` never waits for a spawn belonging to one of these
inner scopes.  This situation does not normally occur.
[This handles
```cilkc
cilk_spawn cilk_scope { cilk_spawn ... }
```
]

### Scope

`Cilk_scope` is followed by a statement, normally a compound
statement.  Any spawns within the statement are synced before
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

`Break` may not be used to exit the body of a `cilk_for` loop.

[what about exceptions thrown from the loop body?]

#### Grain size

The compiler often recognizes that the overhead of allowing
parallel execution can exceed the benefit.  In that case groups of
consecutive iterations run sequentially.  This behavior can be
manually overridden with a pragma:

```cilkc
 #pragma cilk grainsize 128
 cilk_for (int i = 0; i < n; ++i)
   array2[i] = f(i);
```

The pragma tells the compiler that groups of 128 consecutive
iterations should be executed as a serial loop.  If there are 1024
loop iterations in total, there are only 8 parallel tasks.

The argument to the grain size pragma must be an integer constant
in the range 1..2<sup>31</sup>-1.

## Execution of an OpenCilk program

If `cilk_for` is replaced by `for` and the other keywords are removed,
the result is a valid C or C++ program _with the same meaning_ called
the %{ defn "serial projection" %}.  So a program can be developed and
debugged serially and parallelism added later.

### Strand

A _strand_ is a series of instructions between one spawn or sync
and the next spawn or sync.  A strand executes on a single thread.

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

This syntax may be removed in a future version of OpenCilk.

### Implicit syncs

In addition to the sync statements in the code, there is an implicit sync
before exit from some scopes:

* Before returning from a function, after calculating the value to
  be returned.
* On exit from the body of a `try` block.
  [Is this always true, or only if the try block spawns?]
* On exit from a `cilk_scope` statement.
* On exit from the body of a `cilk_for`, i.e. once per iteration of the loop.
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
program goes directly to an exception handler.

When the parent function executes an implicit or explicit `cilk_sync`
the runtime checks whether the spawned child threw an exception.  If
it did, any exception thrown by the parent is discarded and the
exception thrown by the child is handled at the sync.  The compiler
inserts an implicit sync at the end of a try block if the try contains
a spawn.

### Left hand side side effects

[TB can explain this]

## Races and reducers

If the same object is accessed by two statements running in parallel,
and at least one of the accesses is a write, there is said to be a
_%{defn "data race" %}_.  Data races have undefined behavior.
[Do we want to clarify that atomic accesses are unspecified rather
than undefined?]

### Reducers

Hyperobjects are special variables that can be accessed in parallel
without data races.  The OpenCilk runtime gives each thread running
in parallel a separate copy of the variable and merges the values
as necessary.  The local copy of the variable is called a _view_.

The specific kind of hyperobject implemented by OpenCilk 2.0 is a
_reducer_.

A reducer is a variable that has a well-defined value in serial
code and an indeterminate value in parallel code.

monoid

value is unspecified; do read-modify-write operations and ignore the result

address is not constant (except when?)

[define view]

If the reduce callback does nothing the reducer is called a _holder_
and is essentially a form of thread-local storage.

#### Types

A declaration of a reducer requires a _%{defn "monoid" }_.  Aside from
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
