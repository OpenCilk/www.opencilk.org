---
title: Convert a C++ program
---

## Overview

Here is the sequence of steps to create a parallel program using OpenCilk.

- Typically, you will start with a serial C or C++ program that implements the basic
functions or algorithms that you want to parallelize. You will likely
be most successful if the serial program is correct to begin with!
Any bugs in the serial program will occur in the parallel program, but
they will be more difficult to identify and fix.
- Next, identify the program regions that will benefit from parallel
operation. Operations that are relatively long-running and which can
be performed independently are prime candidates.
- Use the three OpenCilk keywords to identify tasks that can execute in
parallel:
    * `cilk_spawn` indicates a call to a function (a "child") that can proceed in parallel with the caller (the "parent").
    * `cilk_sync` indicates that all spawned children must complete before proceeding.
    * `cilk_for` identifies a loop for which all iterations can execute in parallel.
- Build the program:
    - **Linux* OS:** Use the `clang` or `clang++` compiler command.
- Run the program. If there are no ***race conditions***, the parallel program will produce the same result
as the serial program.
- Even if the parallel and serial program results are the same, there
may still be race conditions. Run the program under the ***cilksan
race detector*** to identify possible race
conditions introduced by parallel operations.
- ***Correct any race conditions*** with ***reducers***, locks, or recode to resolve
conflicts.
- Note that a traditional debugger can debug the *serialization* of a parallel program, which you can create
easily with OpenCilk.

We will walk through this process in detail using a sort program as an example.

## Start with a serial program

We'll demonstrate how to use write an OpenCilk program by parallelizing
a simple implementation of ***Quicksort***
([<span class="underline">http://en.wikipedia.org/wiki/Quicksort</span>](http://en.wikipedia.org/wiki/Quicksort)).

Note that the function name `sample_qsort` avoids confusion with the
Standard C Library `qsort` function.

```c
#include <algorithm>
#include <iostream>
#include <iterator>
#include <functional>

// Sort the range between begin and end.
// "end" is one past the final element in the range.
// This is pure C++ code before Cilk++ conversion.
void sample_qsort(int * begin, int * end)
{
    if (begin != end) {
        --end; // Exclude last element (pivot)
        int * middle = std::partition(begin, end,
                    std::bind2nd(std::less<int(),*end));
        std::swap(*end, *middle); // pivot to middle
        sample_qsort(begin, middle);
        sample_qsort(++middle, ++end); // Exclude pivot
    }
}

// A simple test harness
int qmain(int n)
{
    int *a = new int[n];
    for (int i = 0; i < n; ++i) 
        a[i] = i;
    std::random_shuffle(a, a + n);
    std::cout << "Sorting " << n << " integers"
            << std::endl;
    sample_qsort(a, a + n);
    // Confirm that a is sorted and that each element
    // contains the index.
    for (int i = 0; i < n-1; ++i) {
        if ( a[i] = a[i+1] || a[i] != i ) {
            std::cout << "Sort failed at location i=" << i << " a[i] = "
                    << a[i] << " a[i+1] = " << a[i+1] << std::endl;
            delete[] a;
            return 1;
        }
    }
    std::cout << "Sort succeeded." << std::endl;
    delete[] a;
    return 0;
}

int main(int argc, char* argv[])
{
    int n = 10*1000*1000;
    if (argc 1)
        n = std::atoi(argv[1]);
    return qmain(n); 
}
```

## Convert to an OpenCilk program

Converting the C++ code to OpenCilk C++ code is very simple.

- Add a "`#include <cilk.h>`" statement to the source. `cilk.h`
declares all the entry points to the OpenCilk runtime.

The result is an OpenCilk program that has no parallelism yet.

Compile the program to ensure that the OpenCilk SDK development
environment is setup correctly.

Typically, OpenCilk programs are built with optimized code for best
performance.

##### Linux* OS

```bash
> clang++ qsort.cpp -o qsort –O3 -fopencilk
```

## Add parallelism using `cilk_spawn`

We are now ready to introduce parallelism into our `qsort` program.

The `cilk_spawn` keyword indicates that a function (the *child*) may be
executed in parallel with the code that follows the `cilk_spawn`
statement (the *parent*). Note that the keyword *allows* but does not
*require* parallel operation. The OpenCilk scheduler will dynamically
determine what actually gets executed in parallel when multiple
processors are available. The `cilk_sync` statement indicates that the
function may not continue until all `cilk_spawn` requests in the same
function have completed. `cilk_sync` does not affect parallel strands
spawned in other functions.

```c#
void sample_qsort(int * begin, int * end)
{
    if (begin != end) {
        --end; // Exclude last element (pivot)
        int * middle = std::partition(begin, end,
                    std::bind2nd(std::less<int>(),*end));        
        std::swap(*end, *middle); // pivot to middle
        cilk_spawn sample_qsort(begin, middle);
        sample_qsort(++middle, ++end); // Exclude pivot
        cilk_sync;
    }
}
```

In line 8, we spawn a recursive invocation of `sample_qsort` that can
execute asynchronously. Thus, when we call `sample_qsort` again in line 9, the call at line 8 might not have completed. The `cilk_sync`
statement at line 10 indicates that this function will not continue
until all `cilk_spawn` requests in the same function have completed.

There is an implicit `cilk_sync` at the end of every function that waits
until all tasks spawned in the function have returned, so the `cilk_sync` here is redundant, but written explicitly for clarity.

The above change implements a typical divide-and-conquer strategy for
parallelizing recursive algorithms. At each level of recursion, we have
two-way parallelism; the parent strand (line 9) continues executing the
current function, while a child strand executes the other recursive
call. This recursion can expose quite a lot of parallelism.

## Build, execute, and test

With these changes, you can now build and execute the OpenCilk version
of the qsort program. Build and run the program exactly as we did with
the previous example:

##### Linux* OS:
```bash
> clang++ qsort.cpp -o qsort –O3 -fopencilk
```

### Run qsort from the command line

```bash
> qsort
Sorting 10000000 integers
5.641 seconds 
Sort succeeded.
```

By default, an OpenCilk program will query the operating system and use
all available cores. You can control the number of workers by setting
the CILK_NWORKERS environment variable:

```bash
CILK_NWORKERS=8 ./qsort
```

### Observe speedup on a multicore system

Run qsort using one and then two cores:

```bash 
> CILK_NWORKERS=1 qsort
Sorting 10000000 integers
2.909 seconds Sort succeeded.

> CILK_NWORKERS=2 qsort
Sorting 10000000 integers
1.468 seconds Sort succeeded.
```

Alternately, run cilkscale to get a more detailed performance graph.