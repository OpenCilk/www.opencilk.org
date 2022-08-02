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
---
## Task-parallel programming with `cilk_spawn` and `cilk_scope`

{% defn "parallel algorithms", "Parallel programming" %} involves writing instructions that can be executed on different processors simultaneously. Compared to serial programming, parallel programming offers opportunities to reduce the resources consumed (e.g., time, storage, energy, etc.), but taking advantage of these opportunities can be exceedingly complicated and error-prone &mdash; too much for developers to manage on their own. 

OpenCilk is a {% defn "task-parallel-platforms-programming-and-algorithms", "task-parallel platform" %}: a layer of software that coordinates, schedules, and manages the multiple processors of a parallel program. OpenCilk automatically load-balances the tasks of the different processors and achieves performance that is provably close to optimal.

Using the OpenCilk platform, a developer writes code in Cilk, which extends C and C++ with a just few keywords to support task-parallel programming. Cilk supports {% defn "fork-join parallelism" %}, an especially simple form of task-parallelism that uses spawning and parallel loops. We'll introduce spawning here
and cover parallel loops in a later tutorial.

{% defn "Spawning" %} allows a function to be “forked,” or executed like a function call. The `cilk_spawn` keyword modifies a function call statement to tell the OpenCilk runtime system that the function may (but is not required to) run in parallel with the caller.
A spawned function is called a {% defn "child" %} of the function that spawned it. Conversely, the function that executes the `cilk_spawn` statement is known as the {% defn "parent" %} of the spawned function.
For example, consider the fragment of C below. 
Spawning occurs in line 7, where the keyword `cilk_spawn` precedes the call to function `p_fib`.

```c#
int p_fib(int n)
{
  int x, y;
  if (n < 2) return n;
  else {
    cilk_scope {
      x = cilk_spawn p_fib(n-1);  // don't wait for function to return
      y = p_fib(n-2);             // run in parallel with spawned function
    }                             // wait for spawned function to finish
    return x + y;
  }
}
```

A `cilk_spawn` statement has two forms, depending on whether it returns a value or not.
```c
var = cilk_spawn func(args);	// func() returns a value 
cilk_spawn func(args);			// func() returns void
```

`var` is a variable with the type returned by `func`. It is known as the *receiver* because it receives the function call result. The receiver must be omitted for `void` functions.

`args` are the arguments to the function being spawned. Be careful to ensure that pass-by-reference and pass-by-address arguments have life spans that extend at least until the next `cilk_sync` or else the spawned function may outlive the variable and attempt to use it after it has been destroyed. Note that this is an example of a data race which would be caught by cilksan.

{% alert %}
**Note:** A function can be spawned using any expression that is a function. For instance you could use a function pointer or member function pointer, as in:
```c
var = cilk_spawn (object.*pointer)(args);
```
{% endalert %}

If you spawn a function that returns a value, the value should be assigned to a previously declared receiver variable before spawning. Otherwise, there will be a compiler error or warning. Here are three examples.

**Example 1:** Assign a function value to a variable constructed in the same statement.

Wrong: `int x = cilk_spawn f();`

The correct form is to declare the receiver variable in a separate statement.

```c
int x;
x = cilk_spawn f();
```

**Example 2:** Spawn the function without a receiver variable.

Wrong: `cilk_spawn f();`

The correct form is to declare the receiver variable in a separate statement, as in Example 1.

**Example 3:** Spawn a function used as an argument to another function.

Wrong: `g(cilk_spawn f());`

The correct syntax in this case is to declare the receiver variable in a separate statement, spawn, sync (see Part 2), and use the result as the argument to `g()`. However, there is no benefit to this as the parent strand must sync immediately and cannot run in parallel with `f()`.

```c
int x;
x = cilk_spawn f(); 
cilk_sync;
g(x);
```

## How OpenCilk runs your program

With Cilk, there are no tasks that *must* run in parallel; instead,
the programmer uses `cilk_spawn` to specify those which *may* run in parallel.
Every time a task-parallel program is executed, the OpenCilk runtime system uses this information to load-balance the tasks on the available processors.
For example, the picture below depicts a basic multicore architecture where each processor is a yellow circle with a "P" inside.

{% img "/img/fib-code-multicore.png" %}

The keyword `cilk_scope` complements `cilk_spawn` by defining a boundary that limits the extent to which tasks may run in parallel.
Whenever the program execution leaves a block of code delimited by `cilk_scope{...}` , it must wait as necessary for all spawned functions within the block to finish before proceeding.

If you remove `cilk_spawn` and `cilk_scope` from this example program, the result is a traditional serial program, which we call \`fib\`.

```c#
int fib(int n)
{
  int x, y;
  if (n < 2) return n;
  else {
    x = fib(n-1);
    y = fib(n-2);
    return x + y;
  }
}
```

Function `fib` is the {% defn "serial projection" %} of `p_fib`,
which means it computes exactly the same result but without running any tasks simultaneously.
So why bother with parallelism?
Because of the differences in *how* `fib` and `p_fib` compute their (identical) results.
For many computations, allowing tasks to run in parallel significantly reduces the resources required (e.g., time, storage, energy).
We will see this in a subsequent tutorial, when we analyze the performance of `p_fib` compared to `fib`.