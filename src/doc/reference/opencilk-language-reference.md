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

The `cilk_spawn` keyword should appear before an expression statement,
before a block statement, after the `=` sign of a variable
initialization, or after the `=` of an assignment that is the entire
body of an expression statement.

```cilkc
int x = cilk_spawn f(i++);
x = cilk_spawn f(i++);
cilk_spawn y[j++] = f(i++);
cilk_spawn { z[j++] = f(i++); }
```

A future version of OpenCilk may limit use of `cilk_spawn` to
these four contexts.

OpenCilk 2.0 allows other statements, except declarations, to be
spawned.  Although the compiler accepts `cilk_spawn` before almost any
expression, spawns inside of expressions are unlikely to have the
expected semantics.

OpenCilk 2.0 will also accept `cilk_spawn;` as a statement with no
effect.

### Sync

A sync statement, `cilk_sync;`, ends a region of potentially parallel
execution.  It takes no arguments.  It may be conditional and has
no effect if not executed.

```cilkc
for (int i = 0; i < n; i++) {
  cilk_spawn f(i);
  if (i % 4 == 3)
    cilk_sync;
}
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

The compiler also accepts `cilk_scope;` as a statement with no effect.

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
statement except that none of the three items in parentheses may be
omitted.  C++ "range for" is not supported with `cilk_for` in
OpenCilk 2.0.

The first statement inside parentheses must declare at least one
variable.

While the following constraints not required by syntax, the compiler
may not be able to parallelize the loop if they are not satisfied.

* The first expression must declare one variable, the _control variable_.
* In C the control variable must be an integer no larger than 64 bits or
  a pointer to a complete type.  In C++ it may be any random access iterator.
  Among other things, this implies that the difference between starting and
  ending values must be an integer computable by subtraction or `operator-`.
* The second expression must compare the control variable using one of the
  relational operators `<=`, `<`, `!=`, `>`, and `>=`.  The value to which
  it is compared is the _loop bound_.  (See below for the
  interpretation of this value.)
* The third expression must modify the control variable using `++`,
  `--`, `+=`, or `-=`.

The compiler will emit a warning if the loop can not be unrolled,
eliminated, or parallelized.

Because loop iterations may execute out of order there is no way to
predictably stop the loop in the middle.  The `break` statement may
not be used to exit the body of a `cilk_for` loop.  An exception
thrown out of a loop body is only guaranteed to terminate the current
iteration.

#### Grain size

If a single loop iteration does very little work, the overhead of
spawning it exceeds any benefit from parallelism.  In many cases the
compiler will recognize this situation and merge several consecutive
iterations into a single task that runs sequentially.  This behavior
can be manually overridden with a pragma:

```cilkc
 #pragma cilk grainsize 128
 cilk_for (int i = 0; i < n; ++i) {
   array1[i] = f(i);
   array2[i] = f(i);
 }
```

The pragma in the example tells the compiler that each group of 128
consecutive iterations should be executed as a serial loop.  If there
are 1024 loop iterations in total, there are only 8 parallel tasks.

In OpenCilk 2.0 the argument to the grain size pragma must be an
integer constant in the range 1..2<sup>31</sup>-1.

Without an explicit grainsize the runtime will choose a value from 1
to 2048.

### Reducers

A type may be suffixed with `cilk_reducer`.  Syntactically this
keyword appears where `*` may be used to declare a pointer type.  The
type to the left of `cilk_reducer` is the _view type_.

Two values appear in parentheses after `cilk_reducer`, separated by a
comma.  Both must be functions returning `void` or pointers to
functions returning void.  The first, the _identity callback_, takes
one argument of type `void *`.  The second, the _reduce callback_,
takes two arguments of type `void *`.

Two reducer types are the same if their view types are the same and
their corresponding callbacks are the same function mentioned by name.
Otherwise two reducer types are different and not compatible.  The
requirement that the corresponding arguments be manifestly the same
function is dictated by the impossibility of proving that two
different expressions are equivalent.

```
    extern void identity(void *), reduce(void *, void *);
    extern void (*idp)(void *);
    int cilk_reducer(identity, reduce) type1;
    int cilk_reducer(identity, reduce) type2; // same as type1
    int cilk_reducer(idp, reduce) type3;
    int cilk_reducer(idp, reduce) type4; // not the same as type3
```

In the OpenCilk 2.0 the callbacks may be omitted in contexts other
than definition of a variable.  This behavior may be removed in a
future version of OpenCilk.

In the current version of OpenCilk the arguments to `cilk_reducer` are
evaluated each time a reducer is created but not when a reducer is
accessed.  This behavior may change in a future version of OpenCilk.
For compatibility and predictable behavior the arguments to
`cilk_reducer` should not have side effects.

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
is in a spawn statement.  All code up to the point of spawning
executes in series.  The code that follows the spawn point is called
the _continuation_ of the spawn.  The spawn potentially executes in
parallel with the continuation, up to the next sync.

Contrary to the syntax, the spawn itself should be considered as
having a `void` value.  The return value of spawn is like a promise or
lazily evaluated value.  If it is consumed immediately the parallelism
is lost.  When `cilk_spawn` follows `=` the store to the left hand
side is made part of what is spawned.

These three statements assigning to an ordinary variable are equivalent:

```cilkc
x = cilk_spawn f();
cilk_spawn x = f();
cilk_spawn { x = f(); }
```

When there are side effects the situation is more complex.

When `cilk_spawn` appears after an assignment operator and before a
function call, the spawn is after all arguments are evaluated and
after the address of the left hand side is evaluated.  Side effects do
not race with the continuation.  The spawn is before the function call
and assignment of its return value.  The body of the called function
and the assignment do race with the continuation.  In C++, destructors
for function arguments also race with the continuation.

```cilkc
x[i++] = cilk_spawn f(a++, b++, c++);
// It is safe to access i, a, b, and c here (they have been incremented)
// but it is not safe to access the memory location being assigned.
```

When `cilk_spawn` appears at the start of a statement the entire
statement is spawned and everything in it races with the continuation.

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

In this case the compiler is unable to move the use of `i++` into the
spawned expression.

This syntax may be removed in a future version of OpenCilk and
`cilk_spawn` required to appear at the start of a statement or between
an assignment operator and an immediately following function call or
constructor call.

#### Sync

A sync operation waits for previous spawns to complete before
continuing.

##### Explicit sync

An explicit sync is the statement `cilk_sync;`.  This form normally
has function scope, meaning it waits for all spawns in the same
function.  A sync inside the body of a `try`, `cilk_for`, or
`cilk_scope` only waits for spawns inside the same construct.
A sync in the `catch` block of a `try ... catch` construct does
wait for spawns in the enclosing scope.

If spawns are nested as in
```cilkc
cilk_spawn cilk_scope { cilk_spawn ... }
...
cilk_sync;
```
a `cilk_sync` at top level waits for the top level spawn to complete, and
the top level spawn waits for everything spawned inside it to complete.

##### Implicit syncs

In addition to the sync statements in the code, there is an implicit sync
before exit from some scopes:

* Before returning from a function, after calculating the value to
  be returned.  This sync has function scope.
* On exit from a `cilk_scope` statement.  This sync has the scope of the
  `cilk_scope` statement.
* On exit from the body of a `cilk_for`, i.e. once per iteration of the loop.
  This sync has scope equal to the loop body.
* On exit from a `try` block, whether or not an exception is thrown.
  This sync has the scope of the try block.

When exiting from a scope with an implicit sync, destructors for
variables defined in that scope are called after the implicit sync.

## Differences between C++ and OpenCilk

There are three exceptions to the rule that serial and parallel
programs are the same.

### Exceptions

If a spawned function throws an exception, the parent function may
have continued straight line execution past the spawn.  The serial
program goes directly to an exception handler.  The difference is
observable if the continuation has side effects.

When the parent function executes an implicit or explicit `cilk_sync`
the runtime checks whether the spawned child threw an exception.  If
it did, any exception thrown by the parent is discarded and the
exception thrown by the child is handled as if thrown at the sync.
The compiler inserts an implicit sync at the end of a try block if the
try contains a spawn.

If an exception is thrown from the body of a `cilk_for` statement the
current loop iteration is aborted, consistent with the semantics of
`throw`.  Other loop iterations may or may not execute, depending on
scheduling.  An exception thrown by one iteration of the loop will not
prematurely terminate another iteration.

If more than one exception reaches a sync the earliest in serial
order is thrown by the sync.  The other exceptions are destructed.

### Left hand side side effects

When a function call is spawned in OpenCilk and the result is
assigned, the compiler evaluates the address of the left hand side of
the assignment before calling the function.  This conflicts with
C++17, which requires evaluation of the left hand side to follow
return from the function.

```cilkcpp
    extern int global;
    a[global++] = cilk_spawn f(); // f() sees incremented value of global
```

Occurring before the spawn, the evaluation of the left hand side is in
series with the continuation of the spawn.

### Loops

Parallel for loops are implemented by looping over an integer range.
This transformation requires that the loop count be known before
the loop begins execution and that the control variable be calculable
by adding an integer to the starting value.

The observable differences are

* The loop bound expression may be executed fewer times, likely only
once.

* In C++, `operator-` may be called to subtract the start value from
the loop bound (if the increment is positive) or the loop bound from
the initial value (if the increment is negative).

* The loop increment expression may not be executed or may be executed
fewer times than in the serial program.

* In C++, `operator+` may be called to add an integer to the starting
value of the control variable.

The program is not guaranteed to call `operator+` or `operator-` and
these operators not have side effects.  If the loop is not
parallelized it may be executed as written.  For example, the compiler
may decide to unroll the loop instead.  If a `cilk_for` loop is
compiled to a serial loop the compiler will emit a warning.

The control variable must not wrap around, even if the control
variable is an unsigned integer with well defined semantics.  As
consequence of this rule, if the loop condition uses `!=` the
difference between start and end must be an exact multiple of the
increment.  This can also be expressed as a requirement that the
difference between start and end fit in a signed integer.

## Races and reducers

Concurrency invites races.  If the same object is accessed by two
statements running in parallel, and at least one of the accesses is a
write, there is said to be a _{%defn "data race" %}_.  Data races have
undefined behavior.

Parallel atomic accesses do not yield undefined behavior, but the
order of parallel atomic operations is generally unspecified.

### Reducers

{% defn "hyperobject", "Hyperobjects" %} are special variables that
can be accessed in parallel without data races.  The OpenCilk runtime
gives each thread running in parallel a separate copy of the variable
and merges the values as necessary.  The local copy of the variable is
called a _view_.

Because each thread may operate on a separate copy, the address of a
view is not constant.  This is also true of thread local variables,
but reducers do not follow the same rules as thread local variables.

Also because each thread operates on a separate copy, a view of a
reducer only has a well-defined value in serial code.  Within any
strand the value does not change except due to that strand's actions.
At a strand boundary the value of a view may change even if its
address does not.

The specific kind of hyperobject implemented by OpenCilk 2.0 is a
_reducer_.  Reducers are intended for operations like accumulation and
list concatenation.  OpenCilk guarantees that if a reducer is operated
on as a _{% defn "monoid" %}_, the final value in otherwise race-free
parallel code will be the same as in serial code.

A monoid is a combination of a data type (the view type), an
_identity_ value, and a binary associative operation.  If either
operand of the associative operation is the identity value, the result
is the other operand.  For example, `(double, 0.0, +)` is a monoid
(ignoring non-finite values).  In a reducer type the identity value is
provided by a function; the function takes a pointer to a view (cast
to `void *`) and should store the identity value there.  The reduction
operation takes two pointers to views (cast to `void *`) and should
combine the two views and deposit the result in the first view.  The
first view is often called the _left_ view and program execution is
considered to go left to right.

If the view type is a C++ object with a non-trivial constructor the
identity function should use placement new to construct a new view.
If the view type is a C++ object with a non-trivial destructor the
reduce function should explicitly call the destructor on the second
(right) argument.  The storage will be freed by the runtime; use
the `->~T()` syntax instead of `delete`.

```
void identity(void *view) {
    new(view) View();
}
void reduce(void *left, void *right) {
    static_cast<View *>(left)->merge(static_cast<View *>(right));
    static_cast<View *>(right)->~View();
}
```

If the reduce callback does nothing the reducer is called a _holder_
and is essentially a form of thread-local storage.

When declaring a type the `cilk_reducer` keyword is used in the same
contexts as `*` or (in C++) `&`.  It follows a type, which is referred
to as the view type of the reducer.

```cilkc
int cilk_reducer(zero, plus) sum = 0;
int cilk_reducer(zero, plus) *sum_pointer = 0;
```

#### Values

At any point in execution the value in a reducer is based on a
contiguous subset of prior modifications performed in the serial
order of the program.  The subset may be empty.

When all spawns since the initialization of the variable have been
synced, the variable has the serially correct value.


#### Handles

Taking the address of a reducer gives a pointer to the current view.
To pass a reducer by reference to reducer-aware code, use the
function `__builtin_addressof`.

```cilkc
    extern void f_reducer(double reducer(zero, add) *);
    extern void f_view(double *);
    double reducer(zero, add) x = 0.0;
    f_reducer(__builtin_addressof(x));
    f_view(&x);
```
