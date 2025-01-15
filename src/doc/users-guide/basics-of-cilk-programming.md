---
title: Basics of Cilk programming
eleventyNavigation:
  order: -1
---

OpenCilk extends C and C++ with a few keywords for parallel programming.  Programmers use these keywords to allow computations, called ***tasks***, to be executed in parallel.  The OpenCilk system efficiently executes the parallel tasks in a program on whatever parallel processors are available at runtime.  This guide overviews the basic Cilk keywords — `cilk_spawn`, `cilk_scope`, `cilk_for`, and `cilk_sync` — and their basic usage.

To use the Cilk keywords, include the `cilk/cilk.h` header file in your source code and compile and link your program with the `-fopencilk` flag.

## Spawning and synchronizing tasks

The `cilk_spawn` and `cilk_scope` keywords allow programmers to spawn and synchronize parallel tasks.

A `cilk_spawn` can be inserted before a function call to ***spawn*** that function call, which allows that call to execute in parallel with its ***continuation***, that is, the statements after the call.

The `cilk_scope` keyword defines a [block scope](https://en.cppreference.com/w/c/language/scope) that ***synchronizes*** spawned tasks.  All tasks spawned within the scope must complete before the program execution leaves the scope.

The following example shows how `cilk_spawn` and `cilk_scope` are used together to spawn and synchronize parallel tasks.

```cilkc#
#include <cilk/cilk.h>

int fib(int n) {
  if (n < 2)
    return n;
  int x, y;
  cilk_scope {
    x = cilk_spawn fib(n - 1);
    y = fib(n - 2);
  }
  return x + y;
}
```

In this example, line 8 uses `cilk_spawn` to spawn a task to compute `x = fib(n-1)`.  The spawn allows this task to execute in parallel with the continuation of the spawn statement, which, in this example, consists only of the statement `y = fib(n-2)` on line 9.  The `cilk_scope` on lines 7-10 ensures that the spawned computation of `x = fib(n-1)` completes before the `return` statement on line 11 reads the values of `x` and `y`.

In this example, if `n` is sufficiently large, then the parallel computations of `fib(n-1)` and `fib(n-2)` can recursively spawn and synchronize their own tasks.  As a result, this example `fib` routine can spawn a large number of parallel tasks.  OpenCilk takes advantage of these numerous parallel tasks to automatically schedule the computation efficiently on parallel computing hardware.

## Parallel loops

The `cilk_for` keyword provides a parallel loop construct.  A `cilk_for` keyword can be used in place of an ordinary `for` in C/C++ to allow all of the iterations of the loop to execute in parallel.

The following example shows how `cilk_for` can be used to parallelize a SAXPY computation.

```cilkc#
#include <cilk/cilk.h>

void saxpy(int n, float *z, const float a, const float *x, const float *y) {
  cilk_for (int i = 0; i < n; ++i)
    z[i] = a * x[i] + y[i];
}
```

In this example, the `cilk_for` loop, on lines 4-5, allows for the parallel execution of all `n` iterations of the loop over `i`.  This loop thus allows each entry `z[i]` to be computed in parallel.

Cilk allows, and generally encourages, nesting of `cilk_for` loops, as in the following example.

```cilkc#
#include <cilk/cilk.h>

void square_matmul(double *C, const double *A, const double *B, size_t n) {
  cilk_for (size_t i = 0; i < n; ++i) {
    cilk_for (size_t j = 0; j < n; ++j) {
      double sum = 0.0;
      for (size_t k = 0; k < n; ++k)
        sum += A[i * n + k] * B[k * n + j];
      C[i * n + j] = sum;
    }
  }
}
```

The outer `cilk_for` loop, on lines 4-11, allows the `n` iterations over `i` to execute in parallel.  For each outer-loop-iteration `i`, the inner `cilk_for` loop, on lines 5-10, allows the `n` iterations over `j` to execute in parallel.  Together, these two nested `cilk_for` loops allow all `n`$^2$ entries `C[i * n + j]` to be computed in parallel.

## Mixing Cilk keywords and C/C++ code

The Cilk keywords can be combined flexibly with each other and with standard C/C++ code.  The following synthetic example, inspired by real Cilk programs, demonstrates some of this flexibility.

```cilkc#
#include <cilk/cilk.h>

// Tree-node structure where each node contains two arrays of size `n` and up
// to two children.
struct node {
  struct node *left_child;   // Might be NULL
  struct node *right_child;  // Might be NULL
  float *array_A, *array_B;
  int n;
};

// Recursively walk the tree rooted at `root` to count the number of nodes in
// the tree and to process all arrays at all nodes. 
int count_and_process_tree(struct node *root) {
  int left_count = 0;
  int right_count = 0;
  cilk_scope {
    // Traverse the left and right children in parallel.
    if (root->left_child)
      left_count = cilk_spawn count_and_process_tree(root->left_child);
    if (root->right_child)
      right_count = cilk_spawn count_and_process_tree(root->right_child);

    // Process the arrays at this node.
    cilk_for (int i = 0; i < root->n; ++i) {
      cilk_scope {
        cilk_spawn process_A(root->array_A[i]);
        process_B(root->array_B[i]);
      }
      combine(root->array_A[i], root->array_B[i]);
    }
  }
  return left_count + right_count + 1;
}
```

In this example, the `count_and_process_tree()` function traverses a binary tree in parallel and processes arrays of elements at each node of that tree.  This example uses the Cilk keywords in several notable ways.

- The recursive spawns of `count_and_process_tree()`, on lines 20 and 22, process the left and right children of a node, respectively, in parallel, if those children exist.  These `cilk_spawn` statements are placed inside conditionals, on lines 19 and 21, to ensure that the recursive spawns are performed only when the left and right children are not null.
- The recursive spawns of `count_and_process_tree()` allow these children to be processed in parallel with the `cilk_for` loop, on lines 25-31, that processes the arrays attached to the current node.
- The `cilk_for` loop processes all `n` elements in the arrays `array_A` and `array_B` in parallel.
- Each iteration `i` of the `cilk_for` loop uses a `cilk_spawn`, on line 27, to processes `array_A[i]` and `array_B[i]` separately in parallel, and a `cilk_scope`, on lines 26-29, to synchronize that spawned task before the results are combined on line 30.
- Each recursive spawn of `count_and_process_tree()` returns the number of nodes in the subtree rooted at that child node.  The outer `cilk_scope`, on lines 17-32, ensures that both of these recursive spawns have completed before returning 1 plus the sum of those counts.

## Dynamic synchronization

OpenCilk also supports the `cilk_sync` statement for synchronizing spawned tasks within a function, `cilk_scope`, or `cilk_for` loop iteration.  Although it is generally better programming practice to use `cilk_scope` for synchronization, the `cilk_sync` statement can be convenient in some situations.  In addition, the `cilk_sync` statement supports dynamic synchronization of spawned tasks, as the following snippet from an all-pairs-shortest-paths Cilk program demonstrates.

```cilkc#
cilk_scope {
  cilk_spawn recur(A, lda, im, i1, j0, j1, k0, k1);
  if (overlaps(im, i1, k0, k1))
    cilk_sync;
  recur(A, lda, i0, im, j0, j1, k0, k1);
}
```

In this example, the `cilk_spawn`, on line 2, allows the call to `recur()` to execute in parallel with the continuation, which starts at the call to `overlaps()` on line 3.  If this call returns true, then the `cilk_sync` statement, on line 4, will synchronize the spawned call to `recur()` before the second call to `recur()`, on line 5, ensuring that these two calls execute sequentially.  Otherwise, the second call to `recur()` will be allowed to execute in parallel with the first.  Finally, the `cilk_scope`, on lines 1-6, ensures that both calls to `recur()` return before program execution leaves the scope.
