---
layout: layouts/page.njk
title: Introduction to Cilk programming, Part 2
author: Bruce Hoppe
date: 2022-08-02T20:06:42.252Z
tags: []
---
In Part 1 of this introduction, we saw `cilk_spawn` and `cilk_scope`.
Next, we introduce the other two basic Cilk keywords.

## Parallel loops with `cilk_for`

A `cilk_for` loop is a replacement for the normal C/C++ `for` loop that permits loop iterations to run in parallel. The OpenCilk compiler converts a `cilk_for` loop into an efficient divide-and-conquer recursive traversal over the loop iterations.

Sample cilk_for loops are:
```c
cilk_for (int i = begin; i < end; i += 2) f(i);
```
```cpp
cilk_for (T::iterator i(vec.begin()); i != vec.end(); ++i) g(i);
```

If you replace `cilk_for` with `for`, you get the serial projection of the `cilk_for` loop; but `cilk_for` loops have several constraints compared to C/C++ for loops.
Since the loop body is executed in parallel, it must not modify the control variable nor should it modify a nonlocal variable, as that would cause a data race. 
The cilksan race detector will help detect these data races.

### Serial/parallel structure of `cilk_for`

Note that using `cilk_for` is not the same as spawning each loop iteration. In fact, the OpenCilk compiler converts the loop body to a function that is called recursively using a divide-and- conquer strategy allows the OpenCilk scheduler to provide significantly better performance. The difference can be seen clearly in the DAG for the two strategies.

...

## `cilk_sync`

The cilk_sync statement indicates that the current function cannot run in parallel with its spawned children. After the children all complete, the current function can continue.
The syntax is as follows:
cilk_sync;

cilk_sync only syncs with children spawned by this function. Children of other functions are not affected.
There is an implicit cilk_sync at the end of every function and every try block that contains a
cilk_spawn. The OpenCilk language is defined this way for several reasons:

- To ensure that program resource use does not grow out of proportion to the program's parallelism.
- To ensure that a race-free parallel program has the same behavior as the corresponding serial program. An ordinary non-spawn call to a function works the same regardless of whether the called function spawns internally.
- There will be no strands left running that might have side effects or fail to free resources.
- The called function will have completed all operations when it returns.
