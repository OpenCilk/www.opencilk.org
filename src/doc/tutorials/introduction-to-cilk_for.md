---
layout: layouts/page.njk
title: Introduction to cilk_for
tagline: The simplest way to write your first parallel program.
author: Bruce Hoppe
date: 2022-08-15T21:47:08.358Z
attribution: true
---
## Context

Below is a rough collection of content about `cilk_for` taken from
- https://www.intel.sg/content/dam/www/public/apac/xa/en/pdfs/ssg/Introduction_to_Intel_Cilk.pdf
- 6.172 Lecture 8 https://canvas.mit.edu/courses/11151/files/1723140?module_item_id=444341

It includes a slide snapshot that I haven't yet redone. See also
- https://www.smcm.iqfr.csic.es/docs/intel/compiler_c/main_cls/index.htm#cref_cls/common/cilk_for.htm 
- https://cilk.mit.edu/programming/

## `cilk_for` 

A `cilk_for` loop is a replacement for the normal C/C++ `for` loop that permits any or all loop iterations to
run in parallel with each other. All iterations must complete before the program continues.
The OpenCilk compiler converts a `cilk_for` loop into an efficient divide-and-conquer recursive traversal over the loop iterations.

Here is an example `cilk_for` loop:
```c
cilk_for (int i=0; i<8; ++i)
  f(i);
```

A `cilk_for` loop must be a valid C/C++ `for` loop, but `cilk_for` loops have
several additional constraints compared to `for` loops.
- There can only be one control variable (e.g., `i`).
- Each iteration of a `cilk_for` loop must be independent of the others.
- Since the loop body is executed in parallel, it must not modify the control variable nor should it
modify a nonlocal variable, as that would cause a data race. (You can use Cilksan to detect races.)

### Serial/parallel structure of cilk_for

Note that using `cilk_for` is not the same as spawning each iteration of a `for` loop. In fact, the OpenCilk
compiler converts the loop body to a function that is called recursively using a divide-and-conquer strategy that allows the OpenCilk scheduler to provide significantly better performance. 
Here is a graphical depiction of how OpenCilk runs the eight iterations of the example `cilk_for` loop (above),
where the numbers indicate which loop iteration is being computed:

{% img "/img/divide-conquer-cilk_for.png", "600" %}

Note that at each division of work, half of the remaining work is done in the child and half in the continuation. Importantly, the
overhead of both the loop itself and of spawning new work is divided evenly along with the cost
of the loop body.

## In-place matrix transpose

Let's look at in-place matrix transpose as an example of parallel loop computation.
The picture below shows the idea: to swap each element of a square matrix with its symmetric partner across the diagonal.

{% img "/img/matrix-transpose-concept.png", "400" %}

Here is a `cilk_for` loop that performs this computation in parallel:

```c#
// indices run from 0, not 1
cilk_for (int i=1; i<n; ++i) {
  for (int j=0; j<i; ++j) {
    double temp = A[i][j];
    A[i][j] = A[j][i];
    A[j][i] = temp;
  }
}
```

To divide and conquer the iterations of this loop, the OpenCilk compiler generates the following code:

```c#
void p_loop(int lo, int hi) // half open
{
  if (hi > lo + 1) {
    int mid = lo + (hi - lo)/2;
    cilk_scope {
      cilk_spawn p_loop(lo, mid);
                 p_loop(mid, hi);
    }
    return;
  }
  int i = lo;
  for (int j=0; j<i; ++j) {
    double temp = A[i][j];
    A[i][j] = A[j][i];
    A[j][i] = temp;
  }
}
⋮
p_loop(1, n);
```

What happens if you use nested `cilk_for` loops?

```c#
// indices run from 0, not 1
cilk_for (int i=1; i<n; ++i) {
  cilk_for (int j=0; j<i; ++j) {
    double temp = A[i][j];
    A[i][j] = A[j][i];
    A[j][i] = temp;
  }
}
```