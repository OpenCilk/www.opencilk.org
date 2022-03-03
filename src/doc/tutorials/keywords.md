---
title: OpenCilk keywords
---

The Cilk programming language provides a simple extension to the C and
C++ languages that allow programmers to expose logically parallel
tasks.  Cilk extends C and C++ with three keywords: `cilk_spawn`,
`cilk_sync`, and `cilk_for`.  This page describes the Cilk language
extension.

## Spawn and sync

Let us first examine the task-parallel keywords `cilk_spawn` and
`cilk_sync`.  Consider the following example code for a `fib` routine,
which uses these keywords to parallelize the computation of the
$$n$$th Fibonacci number.

```c linenos
int64_t fib(int64_t n) {
  if (n < 2)
    return n;
  int64_t x, y;
  x = cilk_spawn fib(n - 1);
  y = fib(n - 2);
  cilk_sync;
  return x + y;
}
```

### "Note to the algorithms police"
The example `fib` routine is a terribly inefficient code for
computing Fibonacci numbers.  This `fib` routine computes the $$n$$th
Fibonacci number using $$\Theta(\phi^n)$$ work, where $$\phi$$ denotes
the golden ratio, while in fact this number can be computed using
$$\Theta(\lg n)$$ work.  We use this example `fib` code simply for
didactic purposes.

In the simplest usage of `cilk_spawn`, parallel work is created when
`cilk_spawn` precedes the invocation of a function, thereby causing
the function to be ***spawned***.  The semantics of spawning differ from
a C/C++ function or method call only in that the parent
***continuation*** -- the code immediately following the spawn -- is
allowed to execute in parallel with the child, instead of waiting for
the child to complete as is done in C/C++.  In the example `fib`
function, the `cilk_spawn` spawns the recursive invocation of
`fib(n-1)`, allowing it to execute in parallel with its continuation,
which calls `fib(n-2)`.

A function cannot safely use the values returned by its spawned
children until it executes a `cilk_sync` statement, which suspends the
function until all of its spawned children return.  The `cilk_sync` is
a local "barrier," not a global one as, for example, is used in
message-passing programming.  In `fib`, the `cilk_sync` prevents the
execution of `fib` from continuing past the `cilk_sync` until the
spawned invocation of `fib(n-1)` has returned.

Together, a programmer can use the `cilk_spawn` and `cilk_sync`
keywords to expose logical fork-join parallelism within a program.
The `cilk_spawn` keyword creates a parallel ***task***, which is not
*required* to execute in parallel, but simply *allowed* to do so.  The
`fib` example also demonstrates that the `cilk_spawn` and `cilk_sync`
keywords are ***composable***: a spawned subcomputation can itself
spawn and sync child subcomputations.  The scheduler in the runtime
system takes the responsibility of scheduling parallel tasks on
individual processor cores of a multicore computer and synchronizing
their returns.

## Parallel loops

A `for` loop can be parallelized by replacing the `for` with the
`cilk_for` keyword, as demonstrated by the following code to compute
$$y = ax + y$$ from two given vectors $$x$$ and
$$y$$ and a given scalar value $$a$$:

```c linenos
void daxpy(int64_t n, double a, double *x, double *y) {
  cilk_for (int64_t i = 0; i < n; ++i) {
    y[i] = a * x[i] + y[i];
  }
}
```

The `cilk_for` parallel-loop construct indicates that all iterations
of the loop are allowed to execute in parallel.  At runtime, these
iterations can execute in any order, at the discretion of the runtime
scheduler.

The `cilk_for` construct is composable, allowing for simple
parallelization of nested loops.  The `mm` routine in the following
code example demonstrates how nested `cilk_for` loops can be used to
parallelize a simple code to compute the matrix product
$$C = A\cdot B$$ where $$A$$, $$B$$, and
$$C$$ are $$n\times n$$ matrices in row-major order:

```c linenos
void mm(const double *restrict A, const double *restrict B,
        double *restrict C, int64_t n) {
  cilk_for (int64_t i = 0; i < n; ++i) {
    cilk_for (int64_t j = 0; j < n; ++j) {
      for (int64_t k = 0; k < n; ++k) {
        C[i*n + j] += A[i*n + k] * B[k*n + j];
      }
    }
  }
}
```
