---
title: Convert a C++ program
---

Here is an overview of the sequence of steps to create a parallel
program using the OpenCilk++ SDK.

1. Typically, you will start with a serial C or C++ program that
implements the basic functions or algorithms that you want to
parallelize. You will likely be most successful if the serial program
is correct to begin with! Any bugs in the serial program will occur in
the parallel program, but they will be more difficult to identify and
fix.
1. Next, identify the program regions that will benefit from parallel
operation. Operations that are relatively long-running and which can
be performed independently are prime candidates.
1. Rename the source files, replacing the .cpp extension with .cilk.
1. Use the three Cilk++ keywords to identify tasks that can execute in
parallel:
    * `cilk_spawn` indicates a call to a function (a \"child\") that can
proceed in parallel with the caller (the \"parent\").
    * `cilk_sync` indicates that all spawned children must complete before
proceeding.
    * `cilk_for` identifies a loop for which all iterations can execute in
parallel.
1. Build the program.
1. Run the program. If there are no ***race conditions*** (Page
[87](#_bookmark82)), the parallel program will produce the same result
as the serial program.
1. Even if the parallel and serial program results are the same, there
may still be race conditions. Run the program under the ***cilksan
race detector*** (Page [96](#_bookmark92)) to identify possible race
conditions introduced by parallel operations.
1. ***Correct any race conditions*** (Page [89](#_bookmark86)) with
***reducers*** (Page [52](#_bookmark48)), locks, or recode to resolve
conflicts.
1. Note that a traditional debugger can debug the *serialization* (Page
[126](#_bookmark122)) of a parallel program, which you can create
easily with the OpenCilk SDK.

We will walk through this process in detail using a sort program as an
example.

We'll demonstrate how to use write an OpenCilk++ program by
parallelizing a simple implementation of ***Quicksort***
([[http://en.wikipedia.org/wiki/Quicksort]{.underline}](http://en.wikipedia.org/wiki/Quicksort)).

Note that the function name sample_qsort avoids confusion with the
Standard C Library

qsort function. Some lines in the example are removed here, but line
numbers are preserved.

```c
9 #include <algorithm>

11 #include <iostream>

12. #include <iterator>
13. #include <functional>
14
15. // Sort the range between begin and end.
16. // \"end\" is one past the final element in the range.
19 // This is pure C++ code before Cilk++ conversion. 20
21 void sample_qsort(int * begin, int * end) 22 {
23. if (begin != end) {
24. \--end; // Exclude last element (pivot)
25. int * middle = std::partition(begin, end,
26. std::bind2nd(std::less<int\(),*end));
28. std::swap(*end, *middle); // pivot to middle
29. sample_qsort(begin, middle);
30. sample_qsort(++middle, ++end); // Exclude pivot 31 }
32 }
33
34. // A simple test harness
35. int qmain(int n) 36 {
37 int *a = new int\[n\]; 38
39 for (int i = 0; i < n; ++i) 40 a\[i\] = i;
41
42. std::random_shuffle(a, a + n);
43. std::cout << \"Sorting \" << n << \" integers\"
<< std::endl;
45 sample_qsort(a, a + n); 48
49 // Confirm that a is sorted and that each element
// contains the index.
50 for (int i = 0; i < n-1; ++i) {
51 if ( a\[i\] \= a\[i+1\] \|\| a\[i\] != i ) {
52 std::cout << \"Sort failed at location i=\"
<< i << \" a\[i\] = \"
53 << a\[i\] << \" a\[i+1\] = \" << a\[i+1\]
<< std::endl;
delete[] a;
return 1;
}
}
std::cout << "Sort succeeded." << std::endl;
delete[] a;
return 0;

62
63 int main(int argc, char* argv\[\]) 64 {
65 int n = 10*1000*1000;
66. if (argc \1)
67. n = std::atoi(argv\[1\]); 68
69 return qmain(n); 
70 }
```

Converting the C++ code to OpenCilk C++ code is very simple.

- Rename the source file by changing the .cpp extension to .cilk.
- Add a `#include <cilk.h>` statement to the source. cilk.h
declares all the entry points to the OpenCilk runtime.
- Rename the main() function (Line 63) to cilk_main(). The OpenCilk
runtime system will setup the OpenCilk context, then call this entry
point instead of main().

The result is an OpenCilk program that has no parallelism yet.

Compile the program to ensure that the OpenCilk development
environment is setup correctly.

Typically, OpenCilk programs are built with optimized code for best
performance.

- **Windows command line:** cilkpp /Ox qsort.cilk
- **Windows Visual Studio*:** Specify the Release configuration
- **Linux* OS:** opencilk++ qsort.cilk -o qsort -O2

We are now ready to introduce parallelism into our qsort program.

The cilk_spawn keyword indicates that a function (the *child*) may be
executed in parallel with the code that follows the cilk_spawn
statement (the *parent*). Note that the keyword *allows* but does not
*require* parallel operation. The OpenCilk scheduler will dynamically
determine what actually gets executed in parallel when multiple
processors are available. The cilk_sync statement indicates that the
function may not continue until all cilk_spawn requests in the same
function have completed. cilk_sync does not affect parallel strands
spawned in other functions.

```c
21 void sample_qsort(int * begin, int * end) 
22 {
23. if (begin != end) {
24. \--end; // Exclude last element (pivot)
25. int * middle = std::partition(begin, end,
26. std::bind2nd(std::less<int\(),*end));
28. std::swap(*end, *middle); // pivot to middle
29. cilk_spawn sample_qsort(begin, middle);
30. sample_qsort(++middle, ++end); // Exclude pivot
31. cilk_sync;
32 }
33 }
```

In line 29, we spawn a recursive invocation of sample_qsort that can
execute asynchronously. Thus, when we call sample_qsort again in line
30, the call at line 29 might not have completed. The cilk_sync
statement at line 31 indicates that this function will not continue
until all cilk_spawn requests in the same function have completed.

There is an implicit cilk_sync at the end of every function that
waits until all tasks spawned in the function have returned, so the
cilk_sync at line 32 is redundant, but written here for clarity.

The above change implements a typical divide-and-conquer strategy for
parallelizing recursive algorithms. At each level of recursion, we
have two-way parallelism; the parent strand (line 30) continues
executing the current function, while a child strand executes the
other recursive call. This recursion can expose quite a lot of
parallelism.

With these changes, you can now build and execute the OpenCilk version
of the qsort program. Build and run the program exactly as we did with
the previous example:

##### Linux* OS:

opencilk++ qsort.cilk -o qsort

##### Windows* Command Line:

cilkpp qsort.cilk

##### Windows Visual Studio*:

build the Release configuration

##### Run qsort from the command line

\qsort

Sorting 10000000 integers

5.641 seconds Sort succeeded.

By default, an OpenCilk program will query the operating system and
use all available cores. You can control the number of workers using
the cilk_set_worker_count command line option to any Cilk++ program
that uses cilk_main().

##### Observe speedup on a multicore system

Run qsort using one and then two cores:

\qsort -cilk_set_worker_count=1 Sorting 10000000 integers

2.909 seconds Sort succeeded.

\qsort -cilk_set_worker_count=2 Sorting 10000000 integers

1.468 seconds Sort succeeded.

Alternately, run cilkscale to get a more detailed performance graph:

\cilkscale qsort
