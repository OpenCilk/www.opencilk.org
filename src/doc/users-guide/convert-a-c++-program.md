---
title: Convert a C++ program
author: Timothy Kaler
date: 2022-07-20T16:22:55.620Z
---
A common application of OpenCilk is the parallelization of existing serial code. Indeed, it is often advisable for programmers to prioritize writing correct and efficient serial code before attempting parallelization due to the notorious difficulty of writing correct parallel code. In this section, we shall walk through the process of converting an existing serial C or C++ code to an OpenCilk parallel program and show how OpenCilk's suite of tools can be used to debug race-conditions and scalability bottlenecks.

## General workflow

One typically begins with an existing serial C or C++ program that implements the functions or algorithms that are relevant to one's application. Ideally, the serial code you start with will be well tested to verify it is correct and be performance engineered to achieve good performance when run serially. Any correctness bugs in the serial code will result in correctness bugs in the parallel program, but they will be more difficult to identify and fix! Similarly, inefficiency in the original sequential code will translate to inefficiency in its parallel equivalent.

Next, one begins the process of introducing parallelism into the program.  Typically one starts by identifying the regions of the program that will most benefit from parallel execution. Operations that are relatively long-running and/or tasks that can be performed independently are prime candidates for parallelization. The programmer can identify tasks in their code that can execute in parallel using the three OpenCilk keywords:

* `cilk_spawn` indicates a call to a function (a "child") that can proceed in parallel with the caller (the "parent").
* `cilk_sync` indicates that all spawned children must complete before proceeding.
* `cilk_for` identifies a loop for which all iterations can execute in parallel.

The parallel version of the code can be compiled and tested using the OpenCilk compiler.  On **Linux* OS** one invokes the OpenCilk compiler using the `clang` or `clang++` commands. One compiled, the program can be run on the local machine to test for correctness and measure performance. If the parallelization of the original (correct) serial program contains no ***race conditions***, then the parallel program will produce the same result as the serial program. 

The OpenCilk tools can be used to debug race conditions and scalability bottlenecks in parallelized codes. Verifying the absence of race conditions is particularly important as such errors can lead to non-deterministic (and often buggy) behavior. Fortunately, OpenCilk provides the ***cilksan race detector*** which can identify all possible race conditions introduced by parallel operations when a program is run on a given input. With the help of OpenCilk's tools, one can identify and resolve race conditions through the use of **reducers**, locks, and recoding. 

## Example: Quicksort

Let us illustrate the process of parallelizing an existing serial code by walking through an example wherein we shall expose parallelism in a serial implementation of ***Quicksort*** ([<span class="underline">http://en.wikipedia.org/wiki/Quicksort</span>](http://en.wikipedia.org/wiki/Quicksort)).

Note that in this example we use the function name `sample_qsort` in order to avoid confusion with the Standard C Library `qsort` function.

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

### Compiling Quicksort with the OpenCilk compiler

This quicksort code can be compiled using the OpenCilk C++ compiler by adding `#include <cilk.h>` statement to the source file. The `cilk.h` header file contains declarations of the OpenCilk runtime API and the keywords used to specify parallel control flow. After adding the `cilk.h` header file, one can compile the quicksort program using the OpenCilk compiler.

##### Linux* OS

```shell
> clang++ qsort.cpp -o qsort –O3 -fopencilk
```

### Add parallelism using `cilk_spawn`

The next step is to actually introduce parallelism into our quicksort program. This can be accomplished through the judicious use of OpenCilk's three keywords for expressing parallelism: `cilk_spawn`, `cilk_sync`, and `cilk_for`. 

In this example, we shall make use of just the `cilk_spawn` and `cilk_sync` keywords. The `cilk_spawn` keyword indicates that a function (the *child*) may be executed in parallel with the code that follows the `cilk_spawn` statement (the *parent*). Note that the keyword *allows* but does not *require* parallel operation. The OpenCilk scheduler will dynamically determine what actually gets executed in parallel when multiple processors are available. The `cilk_sync` statement indicates that the function may not continue until all `cilk_spawn` requests in the same function have completed. The `cilk_sync` instruction does not affect parallel strands spawned in other functions.

Let us walk through a version of the quicksort code that has been parallelized using OpenCilk.

```c
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

In the example code above, the serial quicksort code has been converted into a parallel OpenCilk code by adding the `cilk_spawn` keyword on line 8, and the  `cilk_sync` keyword on line 10. The `cilk_spawn` keyword on line 8 indicates that the function call `sample_qsort(begin, middle)` is allowed to execute in-parallel with its ***continuation*** which includes the program instructions that are executed after the return of the function call on line 8 and the `cilk_sync` instruction on line 10. 

The `cilk_spawn` keyword can be thought of as allowing the recursive invocation of `sample_qsort` on line 8 to execute asynchronously. Thus, when we call `sample_qsort` again in line 9, the call at line 8 might not have completed. The `cilk_sync` statement at line 10 indicates that this function will not continue until all `cilk_spawn` requests in the same function have completed. There is an implicit `cilk_sync` at the end of every function that waits until all tasks spawned in the function have returned, so the `cilk_sync` here is redundant, but written explicitly for clarity.

The parallelization of quicksort provided in this example implements a typical divide-and-conquer strategy for parallelizing recursive algorithms. At each level of recursion, we have two-way parallelism; the parent strand (line 9) continues executing the current function, while a child strand executes the other recursive call. In general, recursive divide-and-conquer algorithms can expose significant parallelism. In the case of quicksort, however, parallelizing according to the standard recursive structure of the serial algorithm only exposes limited parallelism. The reason for this is due to the substantial amount of work performed by the serial `partition` function invoked on line 5. The partition algorithm may be parallelized for better scalability, but we shall leave this task as an exercise to the intrepid reader.

### Build, execute, and test

Now that you have introduced parallelism into the quicksort program, you can build and execute the OpenCilk version of the qsort program with the command shown below.

##### Linux* OS:

```shell
> clang++ qsort.cpp -o qsort –O3 -fopencilk
```

\
The quicksort code can be run from then command line as shown below to verify correctness and measure its runtime performance.

```shell
> qsort
Sorting 10000000 integers
5.641 seconds 
Sort succeeded.
```

By default, an OpenCilk program will execute in-parallel using all of the cores available on the machine. You can control the number of workers for a particular execution by setting the CILK_NWORKERS environment variable as shown below.

```shell
CILK_NWORKERS=8 ./qsort
```

Using the CILK_NWORKERS environment one can measure the parallel speedup achieved by quicksort when varying the number of utilized cores. Below we show the result of running the quicksort program using one and two cores.

```powershell
> CILK_NWORKERS=1 qsort
Sorting 10000000 integers
2.909 seconds Sort succeeded.

> CILK_NWORKERS=2 qsort
Sorting 10000000 integers
1.468 seconds Sort succeeded.
```

\
One can also use the cilkscale tool to generate more detailed performance graphs.