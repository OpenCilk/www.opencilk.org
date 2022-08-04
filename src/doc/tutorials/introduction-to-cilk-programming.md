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

{% defn "parallel algorithms", "Parallel programming" %} involves writing instructions that can be executed on different processors simultaneously.
Compared to serial programming, where instructions (logically) execute one-at-a-time on a single processor, parallel programming can reduce the runtime of a computation; but taking advantage of this opportunity can be difficult and error-prone.

OpenCilk is a {% defn "task-parallel-platforms-programming-and-algorithms", "task-parallel platform" %}: a layer of software that simplifies the development of correct and efficient parallel programs by coordinating, scheduling, and managing the multiple processors involved. OpenCilk automatically load-balances the tasks of the different processors and achieves performance that is provably close to optimal.

Using the OpenCilk platform, a developer writes code in Cilk, which extends C and C++ with a just few keywords to support task-parallel programming. Cilk supports {% defn "fork-join parallelism" %}, an especially simple form of task-parallelism that uses spawning and parallel loops. We'll introduce spawning here
and cover parallel loops in a later tutorial.

{% defn "Spawning" %} a function means running it in parallel with the caller. 
To indicate that a function may be spawned, put the `cilk_spawn` keyword before the call to the function.
The `cilk_spawn` keyword tells the OpenCilk runtime system that the function may (but is not required to) run in parallel with the caller.
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

A spawned function is called a {% defn "child" %} of the function that spawned it. Conversely, the function that executes the `cilk_spawn` statement is known as the {% defn "parent" %} of the spawned function.

A `cilk_spawn` statement has two forms, depending on whether it returns a value or not.
```c
var = cilk_spawn func(args);	// func() returns a value 
cilk_spawn func(args);			// func() returns void
```

`var` is a variable with the type returned by `func`. It is known as the *receiver* because it receives the function call result. The receiver must be omitted for `void` functions. `args` are the arguments to the function being spawned. 

{% alert %}
**Note:** A function can be spawned using any expression that is a function. For instance you could use a function pointer or member function pointer, as in:
```c
var = cilk_spawn (object.*pointer)(args);
```
{% endalert %}

## How OpenCilk runs your program

With Cilk, there are no tasks that *must* run in parallel; instead,
the programmer uses `cilk_spawn` to specify those which *may* run in parallel.
Every time a task-parallel program is executed, the OpenCilk runtime system uses this information to load-balance the tasks on the available processors.
For example, the picture below depicts a basic multicore architecture where each processor is a yellow circle with a "P" inside.

{% img "/img/fib-code-multicore-wide.png", "500" %}

The keyword `cilk_scope` complements `cilk_spawn` by defining a boundary that limits the extent to which tasks may run in parallel.
Whenever the program execution leaves a block of code delimited by `cilk_scope{...}` , it must wait as necessary for all spawned functions within the block to finish before proceeding.

If you spawn a function that returns a value, be sure the spawned function returns before using the value of the receiver variable.

{% alert "danger" %}
**Incorrect:**
```c
cilk_scope {
  x = cilk_spawn p_fib(n-1);  
  y = p_fib(n-2);
  return x + y;                     // Value of x is indeterminate
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
return x + y;                       // Value of x is p_fib(n-1)             
```
{% endalert %}

On a related note, if you spawn a function that returns a value, be sure to declare the receiver variable before the `cilk_scope` block that uses it. 
Otherwise, the receiver variable won't be defined after the completion of the `cilk_scope` block (which is where its value is defined).

{% alert "danger" %}
**Incorrect:**
```c
cilk_scope {
  int x = cilk_spawn p_fib(n-1);  
  int y = p_fib(n-2);             
}                             
return x + y;                     // x and y are not defined
```
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

Be careful to ensure that pass-by-reference and pass-by-address arguments to a spawned function do not expire within the function's `cilk_scope` block, or else the function may outlive the arguments and attempt to use them after they have been destroyed. (Note that this is an example of a {% defn "data race" %} which would be caught by Cilksan.)

## Serializing your parallel program

If you remove `cilk_spawn` and `cilk_scope` from our example program, the result is a traditional serial program, which we call `fib`.

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
For many computations, allowing tasks to run in parallel significantly reduces the runtime.
We will see this in a subsequent tutorial, when we analyze the performance of `p_fib` compared to `fib`.