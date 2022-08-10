---
layout: layouts/page.njk
title: Introduction to Cilk programming, Part 1
tagline: With a few Cilk keywords, OpenCilk extends C/C++ to support fork-join
  parallel programming, a simple and efficient model for writing fast code for
  multicore computers.
author: Bruce Hoppe
date: 2022-07-15T18:13:01.322Z
image: /img/fib-code-multicore.png
tags:
  - task-parallelism
  - spawn
attribution: true
---

{% defn "parallel algorithms", "Parallel programming" %} involves writing
instructions that can be executed on different processors simultaneously.
Compared to serial programs, whose instructions (logically) execute
one-at-a-time on a single processor, parallel programs can utilize multiple
processing units to reduce the runtime of a computation.  Historically,
parallel programming has been considered substantially more difficult and
error-prone than serial programming — OpenCilk aims to bridge this gap, making
it easy to write parallel programs that are both correct and fast.

OpenCilk is a {% defn "task-parallel-platforms-programming-and-algorithms",
"task-parallel platform" %}: a layer of software that simplifies the
development of parallel programs by coordinating, scheduling, and managing
multiple processors.  To achieve good performance during execution, OpenCilk
automatically load-balances the work among different processors by scheduling
the parallel tasks in a way that is provably close to optimal.

Using the OpenCilk platform, a developer writes code in the Cilk language,
which extends C and C++ with a just few keywords to support task-parallel
programming.  Cilk supports {% defn "fork-join parallelism" %}, an especially
simple form of task-parallelism that uses spawning and parallel loops.  We'll
introduce spawning here and cover parallel loops in a later tutorial.

## Task-parallel programming with `cilk_scope` and `cilk_spawn`

You may think of a task or computation as a piece of code which contains serial
and parallel regions.  A serial region contains no parallelism and its tasks
are executed as usual.  A parallel region has two distinguishing
characteristics:

1. Within the parallel region, functions may be {% defn "spawning", "spawned"
   %}, i.e., they may be run in parallel with the caller.
2. At the end of the parallel region, all functions that were spawned within it
   are {% defn "syncing", "synced" %}, i.e., they have finished executing.
   
Functions within either a serial or parallel region may themselves contain
serial and parallel regions, allowing for {% defn "nested parallelism" %}.

To indicate that a function may be spawned, put the `cilk_spawn` keyword before
the function call.  The `cilk_spawn` keyword tells the OpenCilk runtime system
that the function may (but is not required to) run in parallel with the caller.
To delineate a parallel region, use the `cilk_scope` keyword before a [block
scope](https://en.cppreference.com/w/c/language/scope).  Execution may continue
past the `cilk_scope` only after all computations that were spawned within it
have finished.

For example, consider the C code below, which shows a parallel implementation
for recursive computation of Fibonacci numbers.  The `cilk_scope` creates a
parallel region spanning lines 6–7.  In line 6 the `cilk_spawn` keyword
indicates that `p_fib(n-1)` may be executed at the same time as the rest of the
parallel region (that is, the call to `p_fib(n-2)` in line 7).  The end of the
`cilk_scope` in line 8 guarantees that the spawned function has finished before
the return statement in line 9 is executed.

```c#
int p_fib(int n) {
  if (n < 2)
    return n;                   // base case
  int x, y;
  cilk_scope {                  // begin lexical scope of parallel region
    x = cilk_spawn p_fib(n-1);  // don't wait for function to return
    y = p_fib(n-2);             // may run in parallel with spawned function
  }                             // wait for spawned function if needed
  return x + y;
}
```

A spawned function is called a {% defn "child" %} of the function that spawned
it.  Conversely, the function that executes the `cilk_spawn` statement is known
as the {% defn "parent" %} of the spawned function.  The code in the parent
function that follows a spawn statement in a parallel region is called the
parent {% defn "continuation" %} of the spawn.

A `cilk_spawn` statement has two forms, depending on whether it returns a value
or not.

```c
var = cilk_spawn func(arg1, arg2);  // func() returns a value 
cilk_spawn func(arg1, arg2);        // func() returns void
```

The output `var` is a variable with the type returned by `func`.  It is known
as the *receiver* because it receives the function call result.  The receiver
must be omitted for `void` functions.  Input arguments (`arg1, arg2, ...`) to
the spawned function are passed as they normally would in serial code.

{% alert %}

**Note:** Any expression that is or can be converted to a function can be
spawned.  For instance, you can spawn a computation using a function pointer or
member function pointer, as in:

```c
var = cilk_spawn (object.*pointer)(arg1, arg2);
```

Similarly, you can spawn a block of instructions without explicitly wrapping it
in a function, as in:

```c
cilk_spawn {
  int x = f();
  g(x);
}
```

{% endalert %}

## How OpenCilk runs your program

With Cilk, there are no tasks that *must* run in parallel; the `cilk_scope` and
`cilk_spawn` keywords only specify which tasks *may* run in parallel.  That is,
you are only responsible for expressing the {% defn "logical parallelism" %}
that is available in a computation.  The actual execution on a shared-memory
multicore or multiprocessor system, illustrated in the picture below, is up to
the OpenCilk runtime system.

{% img "/img/fib-code-multicore-wide.png", "500" %}

Whenever a task-parallel Cilk program is executed, the OpenCilk runtime system
determines how spawned tasks are assigned to processors (depicted above as
yellow circles labeled "P") as the computation unfolds, dynamically
load-balancing their execution.  The OpenCilk runtime is also responsible for
ensuring that all spawned tasks have completed when exiting the scope of a
parallel region, waiting for outstanding tasks as necessary.

Details of the OpenCilk runtime system are beyond the scope of this
introductory guide.  Very roughly, the OpenCilk runtime takes advantage of
available parallelism to ensure that the available processing cores are kept
busy while also minimizing task migrations across cores, thus guaranteeing
near-optimal parallel scheduling.

## Common pitfalls and how to avoid them

If you spawn a function that returns a value, make sure the spawned function
has returned before using the value of the receiver variable.

{% alert "danger" %}

**Incorrect:**

```c
cilk_scope {
  x = cilk_spawn p_fib(n-1);
  y = p_fib(n-2);
  return x + y;                     // value of x is indeterminate
}
```

{% endalert %}

{% alert "success" %}

**Correct:**

```c
cilk_scope {
  x = cilk_spawn p_fib(n-1);
  y = p_fib(n-2);
}
return x + y;                       // value of x is p_fib(n-1)
```

{% endalert %}

On a related note, if you spawn a function that returns a value, be sure to
declare the receiver variable before the `cilk_scope` block that uses it.
Otherwise, the receiver variable won't be defined outside the `cilk_scope`
block (which is where it is assigned its value).

{% alert "danger" %}

**Incorrect:**

```c
cilk_scope {
  int x = cilk_spawn p_fib(n-1);
  int y = p_fib(n-2);
}
return x + y;                       // x and y are not defined
```

This pitfall may seem benign as it would typically lead to a compilation error,
but note that it may introduce a subtle logical bug if the `cilk_scope` is
nested within another scope that also uses `x` and `y` identifiers.

{% endalert %}

{% alert "success" %}

**Correct:**

```c
int x, y;
cilk_scope {
  x = cilk_spawn p_fib(n-1);
  y = p_fib(n-2);
}
return x + y;                     // x and y are defined
```

{% endalert %}

Be careful to ensure that pass-by-reference and pass-by-address arguments to a
spawned function do not expire within the function's `cilk_scope` block, or
else the function may outlive the arguments and attempt to use them after they
have been destroyed. (Note that this is an example of a {% defn "data race" %}
which would be caught by Cilksan.)

## Serializing your parallel program

If you remove the `cilk_spawn` and `cilk_scope` keywords from a correct Cilk
program, the result is a valid and correct serial program.  For example, if you
do this with the `p_fib()` function code above, you end up with the following
function, which we call `fib()`:

```c#
int fib(int n) {
  if (n < 2)
    return n;
  int x, y;
  {
    x = fib(n-1);
    y = fib(n-2);
  }
  return x + y;
}
```

Function `fib()` is the {% defn "serial projection" %} of `p_fib()`, which
means it computes exactly the same result but without running any tasks
simultaneously.  So why bother with parallelism?  Because of the difference in
*how* `fib()` and `p_fib()` compute their (identical) results.  For many
computations, allowing tasks to run in parallel significantly reduces the
runtime.  We will see this in an upcoming tutorial, where we will analyze the
performance of `p_fib()` compared to `fib()`.
