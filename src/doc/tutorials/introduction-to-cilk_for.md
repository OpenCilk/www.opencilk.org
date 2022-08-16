---
layout: layouts/page.njk
title: Introduction to cilk_for
tagline: The simplest way to write your first parallel program.
author: Bruce Hoppe
date: 2022-08-15T21:47:08.358Z
attribution: true
---
## Context

Below is a collection of content about `cilk_for` taken from
- https://www.intel.sg/content/dam/www/public/apac/xa/en/pdfs/ssg/Introduction_to_Intel_Cilk.pdf
- 6.172 Lecture 8 https://canvas.mit.edu/courses/11151/files/1723140?module_item_id=444341
- https://github.com/OpenCilk/documentation/tree/master/source_documents/Intel_Cilk%2B%2B_Programmers_Guide

See also
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

These general restrictions have numerous specific consequences, which you can read at the bottom of this tutorial.

### Serial/parallel structure of cilk_for

Note that using `cilk_for` is not the same as spawning each iteration of a `for` loop. In fact, the OpenCilk
compiler converts the loop body to a function that is called recursively using a divide-and-conquer strategy that allows the OpenCilk scheduler to provide significantly better performance. 
Here is a graphical depiction of how OpenCilk runs the eight iterations of the example `cilk_for` loop (above),
where the numbers indicate which loop iteration is being computed:

{% img "/img/divide-conquer-cilk_for-8-iter.png", "700" %}

Note that at each division of work, half of the remaining work is done in the child and half in the continuation. Importantly, the
overhead of both the loop itself and of spawning new work is divided evenly along with the cost
of the loop body.

Here is the DAG for a serial loop that spawns each iteration. In this case, the work is not well
balanced, because each child does the work of only one iteration before incurring the scheduling
overhead inherent in entering a sync. For a short loop, or a loop in which the work in the body is
much greater than the control and spawn overhead, there will be little measurable performance
difference. However, for a loop of many cheap iterations, the overhead cost will overwhelm any
advantage provided by parallelism.

{% img "/img/sequential-spawn-cilk_for-8-iter.png", "700" %}

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

### Specific restrictions on `cilk_for` loops

In order to parallelize a loop using the "divide-and-conquer" technique, the runtime system must
pre-compute the total number of iterations and must be able to pre-compute the value of the loop
control variable at every iteration. To enable this computation, the control variable must act as
an integer with respect to addition, subtraction, and comparison, even if it is a user-defined type.
Integers, pointers, and random access iterators from the standard template library all have
integer behavior and thus satisfy this requirement.

In addition, a `cilk_for` loop has the following limitations, which are not present for a standard
C/C++ `for` loop. The compiler will report an error or warning for most of these errors.

- There must be exactly one loop control variable, and the loop initialization clause must
assign the value. 
{% alert "danger" %}
Not supported:
```c
cilk_for (unsigned int i, j = 42; j < 1; i++, j++)
```
{% endalert %}
{% alert "success" %}
Supported:
```c
cilk_for (unsigned int j = 42; j < 101; j++)
```
{% endalert %}

- The control variable must be declared in the loop header, not outside the loop.
{% alert "danger" %}
Not supported:
```c
int i; 
cilk_for (i = 0; i < 100; i++)
```
{% endalert %}
{% alert "success" %}
Supported:
```c
cilk_for (int i = 0; i < 100; i++)
```
{% endalert %}

- The loop control variable must not be modified in the loop body.
{% alert "danger" %}
Not supported:
```c
cilk_for (unsigned int i = 1; i < 16; ++i) i = f();
```
{% endalert %}
{% alert "success" %}
Supported:
```c
unsigned int j;
cilk_for (unsigned int i = 1; i < 16; ++i) j = f();
```
{% endalert %}

- The termination and increment values are evaluated once before starting the loop and will
not be re-evaluated at each iteration. Thus, modifying either value within the loop body will
not add or remove iterations. 
{% alert "danger" %}
Not supported:
```c
cilk_for (unsigned int i = 1; i < x; ++i) x = f();
```
{% endalert %}
{% alert "success" %}
Supported:
```c
cilk_for (unsigned int i = 1; i < 16; ++i) x = f();
```
{% endalert %}

- A `break` or `return` statement will NOT work within the body of a `cilk_for` loop; the
compiler will generate an error message. `break` and `return` in this context are reserved for
future speculative parallelism support.
- A `goto` can only be used within the body of a `cilk_for` loop if the target is within the loop
body. The compiler will generate an error message if there is a `goto` transfer into or out of a
`cilk_for` loop body. Similarly, a `goto` cannot jump into the body of a `cilk_for` loop from
outside the loop.
- A `cilk_for` loop may not be used in a constructor or destructor. It may be used in a
function called from a constructor or destructor.
- A `cilk_for` loop may not "wrap around." For example, in C/C++ you can write
```c
for (unsigned int i = 0; i != 1; i += 3);
```
and this has well-defined, if surprising, behavior; it means execute the loop 2,863,311,531
times. Such a loop produces unpredictable results in OpenCilk when converted to a `cilk_for`.

- A `cilk_for` may not be an infinite loop.
{% alert "danger" %}
Not supported:
```c
cilk_for (unsigned int 1 = 0; i < 16; i += 0);
```
{% endalert %}
{% alert "success" %}
Supported:
```c
cilk_for (unsigned int 1 = 0; i < 16; i += 2);
```
{% endalert %}

## `cilk_for` grain size

The `cilk_for` statement divides the loop into chunks containing one or more loop iterations.
Each chunk is executed serially, and is spawned as a chunk during the execution of the loop.
The maximum number of iterations in each chunk is the grain size.
In a loop with many iterations, a relatively large grain size can significantly reduce overhead.
Alternately, with a loop that has few iterations, a small grain size can increase the parallelism of
the program and thus improve performance as the number of processors increases.

### Setting the Grain Size

Use the `cilk_grainsize` pragma to specify the grain size for one `cilk_for` loop:
```c
#pragma cilk_grainsize = expression
```
For example, you might write:
```c
#pragma cilk_grainsize = 1
cilk_for (int i=0; i<IMAX; ++i) { . . . }
```
If you do not specify a grain size, the system calculates a default that works well for most loops.
The default value is set as if the following pragma were in effect:
```c
#pragma cilk_grainsize = min(512, N / (8*p))
```
where $N$ is the number of loop iterations, and $p$ is the number of workers created during the
current program run. Note that this formula will generate parallelism of at least 8 and at most
512. For loops with few iterations (less than $8 * p$) the grain size will be set to 1, and each
loop iteration may run in parallel. For loops with more than $4096 * p$ iterations, the grain size
will be set to 512.

If you specify a grain size of zero, the default formula will be used. The result is undefined if you
specify a grain size less than zero.

Note that the expression in the pragma is evaluated at run time. For example, here is an
example that sets the grain size based on the number of workers:
```c
#pragma cilk_grainsize = n/(4*cilk::current_worker_count())
```

### Loop Partitioning at Run Time

The number of chunks that are executed is approximately the number of iterations $N$ divided by the grain size $K$.
The OpenCilk compiler generates a divide-and-conquer recursion to execute the loop. In pseudocode, the control structure looks like this:
```c
void run_loop(first, last)
{
  if (last - first) < grainsize)
  {
    for (int i=first; i<last ++i) LOOP_BODY;
  }
  else
  {
    int mid = (last-first)/2;
    cilk_scope {
      cilk_spawn run_loop(first, mid);
                 run_loop(mid, last);
    }
  }
}
```

In other words, the loop is split in half repeatedly until the chunk remaining is less than or equal
to the grain size. The actual number of iterations run as a chunk will often be less than the grain
size.
For example, consider a `cilk_for` loop of 16 iterations:
```c
cilk_for (int i=0; i<16; ++i) { ... }
```
With grain size of 4, this will execute exactly 4 chunks of 4 iterations each. However, if the grain
size is set to 5, the division will result in 4 unequal chunks consisting of 5, 3, 5 and 3 iterations.
If you work through the algorithm in detail, you will see that for the same loop of 16 iterations, a
grain size of 2 and 3 will both result in exactly the same partitioning of 8 chunks of 2 iterations
each.

### Selecting a Good Grain Size Value
The default grain size usually performs well. However, here are guidelines for selecting a
different value:

- If the amount of work per iteration varies widely and if the longer iterations are likely to be
unevenly distributed, it might make sense to reduce the grain size. This will decrease the
likelihood that there is a time-consuming chunk that continues after other chunks have
completed, which would result in idle workers with no work to steal.
- If the amount of work per iteration is uniformly small, then it might make sense to increase
the grain size. However, the default usually works well in these cases, and you don't want to
risk reducing parallelism.
- If you change the grain size, carry out performance testing to ensure that you've made the
loop faster, not slower.
- Use Cilkscope to estimate a program's work, span, and spawn overhead. 
This information can help determine the best granularity and whether it is
appropriate to override the default grain size.

Several examples (from Cilk Plus programmer's guide) use the grain size pragma:

- matrix-transpose
- cilk-for
- sum-cilk