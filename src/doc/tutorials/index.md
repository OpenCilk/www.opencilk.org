---
title: Tutorials
eleventyNavigation:
  key: Tutorials
  parent: Documentation
  order: 1
permalink: /doc/tutorials/
---

## Getting started

The text below was taken from the Intel CilkPlus Programmer's Guide and converted from docx to markdown with pandoc.
I made just a few preliminary edits.

Introduction
------------

**Chapter 1**

*Version 1.10 (October 2009).*

This programmer\'s guide describes the OpenCilk SDK. The software
described in this guide is provided under license from Intel
Corporation. See the End User License Agreement (EULA) and the Release
Notes for license details.

The OpenCilk SDK provides tools, libraries, documentation and samples
that enable developers to use the OpenCilk language to add parallelism
to new or existing C and/or C++ programs. This release of the SDK
provides support for building IA-32 architecture programs (32-bit)
that run on the Microsoft Windows\* Operating System (OS) and IA-32
and Intel 64 architecture programs (32-bit and 64-bit) that run on the
Linux OS\*.

Most of the information in this guide pertains to all platforms;
differences are marked in the text.

##### Target audience

This programmer\'s guide is designed for application developers who
will use the OpenCilk SDK to improve performance by adding parallelism
to new and existing C and/or C++ applications. We assume that the
reader has a working knowledge of C and/or C++ programming.
Expert-level knowledge of C and/or C++ will be helpful.

##### Getting started

We recommend that the reader first install the OpenCilk Distribution,
then build and run at least one of the example programs in order to
validate the installation and to begin to get familiar with the
compiler and tools. See ***Getting Started*** (Page
[8](#getting-started-1)) for details.

The ***OpenCilk Concepts*** (Page [31](#_bookmark25)) and ***OpenCilk
Language*** (Page [35](#_bookmark28)) sections provide a good
conceptual framework to understand the OpenCilk model of parallelism.

Next, read about ***Race Conditions*** (Page [87](#_bookmark82)),
learn how to use the ***OpenCilk cilkscan race detector*** (Page
[96](#_bookmark92)) to identify race bugs, and how ***Reducers***
(Page [52](#_bookmark48)) can be used to eliminate many common race
problems.

If you are planning to convert legacy serial applications, read the
***Mixing C++ and OpenCilk C++ Code*** (Page [81](#_bookmark76))
chapter.

##### Typographic conventions

We use a monospaced font for commands, code, keywords and program
output.

Pathnames are separated with back slash (\"\\\") for Windows OS and
forward slash (\"/\") for Linux OS. When the environment could be
either Windows OS or Linux OS, we use the Linux OS forward slash
convention.

We want you to be successful using the OpenCilk SDK. If you have
feedback, questions, or problems, please use the support forums at
[[http://whatif.intel.com]{.underline}](http://whatif.intel.com/).

With problem reports, please include the following information:

- Version of OpenCilk (for example, OpenCilk Release 1.0 for Linux\*
OS, 64-bit edition, build 7982)
- Operating system and version (for example, Windows Vista\* with
Service Pack 1, Ubuntu 9.04)
- On Windows systems, please specify the compiler version (for
example, Microsoft Visual Studio\* 2005 with Service Pack 1)
- A detailed description of the question, problem or suggestion
- Source code whenever possible
- Warning or error messages

The Release Notes list the system requirements, installation notes,
and major changes from the previous release, such as new features, bug
fixes, and examples.

The release notes are available online from the
[[http://whatif.intel.com]{.underline}](http://whatif.intel.com/) web
site.

There is a wealth of additional and supplementary information
available about the OpenCilk language at
[[http://whatif.intel.com]{.underline}](http://whatif.intel.com/).

The OpenCilk C and C++ languages are based on concepts developed and
implemented for the Cilk language at MIT. To learn more about the
history of the Cilk language, visit the following links:

- The ***Cilk Implementation Project site***
([[http://supertech.csail.mit.edu/cilkImp.html]{.underline}](http://supertech.csail.mit.edu/cilkImp.html))
is a gateway to the MIT Cilk project. A ***project overview***
([[http://supertech.csail.mit.edu/cilk/]{.underline}](http://supertech.csail.mit.edu/cilk/))
with links to a set of three lecture notes provides extensive
historical, practical, and theoretical background information.
- ***\"The Implementation of the Cilk-5 Multithreaded Language\"***
([[http://supertech.csail.mit.edu/papers/cilk5.pdf]{.underline}](http://supertech.csail.mit.edu/papers/cilk5.pdf))
by Matteo Frigo, Charles E. Leiserson, and Keith H. Randall, won the
***Most Influential 1998 PLDI Paper award***
([[http://software.intel.com/en-us/articles/Cilk-Wins-Most-Influential-PLDI-Paper-Award]{.underline}](http://software.intel.com/en-us/articles/Cilk-Wins-Most-Influential-PLDI-Paper-Award))
at the 2008 ACM SIGPLAN Conference on Programming Language Design and
Implementation.

Getting Started
---------------

**Chapter 2**

NOTE: For system requirements and installation instructions, see the
Release Notes.

##### Overview of the OpenCilk C/C++ languages

The OpenCilk languages extend C and C++ to simplify writing parallel
applications that efficiently exploit multiple processors.

The OpenCilk languages are particularly well suited for, but not
limited to, *divide and conquer* algorithms. This strategy solves
problems by breaking them into sub-problems (tasks) that can be solved
independently, then combining the results. Recursive functions are
often used for divide and conquer algorithms, and are well supported
by the OpenCilk languages.

The tasks may be implemented in separate functions or in iterations of
a loop. The OpenCilk keywords identify function calls and loops that
can run in parallel. The OpenCil runtime system, Cheetah, schedules
these tasks to run efficiently on the available processors. We will
use the term *worker* to mean an operating system thread that the
OpenCilk scheduler uses to execute a task in anOpenCilk program.

##### Using the OpenCilk SDK

In this chapter, we first walk you through the steps of building,
running and testing a sample program OpenCilk program.

Next, we describe how to convert a simple C++ program into an OpenCilk
program.

After walking through the source code conversion, we show you how to
build the program, test it for race conditions, and measure its
parallel performance.

When using the OpenCilk SDK, the compiler command names are cilkpp on
Windows\* systems and cilk++ (or g++) on Linux\* systems.

Each example is installed in an individual folder, as described in the
Release Notes. In this section, we will walk through the qsort
example.

We assume that you have installed the OpenCilk SDK, and that you have
more than one processor core available. If you have a single-core
system, you can still build and test the example, but you should not
expect to see any performance improvements.

##### Building qsort

Full, detailed build options are described in the \"***Building,
Running, and Debugging*** (Page [17](#_bookmark12))\" chapter. For
now, use the default settings.

##### - Linux\* Systems

- Change to the qsort directory (e.g. cd INSTALLDIR/examples/qsort)
- Issue the make command.
- The executable qsort will be built in the current directory.
- If make fails, check to be sure that the PATH environment variable
is set to find cilk++ from INSTALLDIR/bin.


##### Running qsort

First, ensure that qsort runs correctly. With no arguments, the
program will create and sort an array of 10,000,000 integers. For
example:

```bash
\qsort
Sorting 10000000 integers
5.641 seconds Sort succeeded.
```

By default, an OpenCilk program will query the operating system and
use as many cores as it finds. You can control the number of workers
using the cilk\_set\_worker\_count command line option to any OpenCilk
program. This option is intercepted by the OpenCilk runtime system;
the OpenCilk program does not see this argument.

##### Observe speedup on a multicore system

Here are some results on an 8-core system, where the speedup is
limited by the application\'s parallelism and the core count.

```bash
\qsort -cilk\_set\_worker\_count=1 Sorting 10000000 integers
2.909 seconds Sort succeeded.
\qsort -cilk\_set\_worker\_count=2 Sorting 10000000 integers
1.468 seconds Sort succeeded.
\qsort -cilk\_set\_worker\_count 4
Sorting 10000000 integers
0.798 seconds Sort succeeded.
\qsort -cilk\_set\_worker\_count 8
Sorting 10000000 integers
0.438 seconds Sort succeeded.
```

##### Check for data races

Use the OpenCilk cilksan race detector (cilksan) to verify that there
are no data races in the code. Note that any races will be exposed
using a small data set. In this example, we sort an array of only
1,000 elements for the race detection analysis. Race conditions are
always analyzed with a single-processor run, regardless of the number
of processors available or specified. On Windows systems, cilksan can
also be invoked from within Visual Studio\*.

\cilksan qsort 1000 (qsort.exe on Windows systems) Sorting 1000
integers

0.078 seconds Sort succeeded.

No errors found by Cilksan

##### Measure scalability and parallel metrics

Use the OpenCilk cilkscale scalability and performance analyzer
(cilkscale) to run your OpenCilk program on multiple processors and
plot the speedup. As described in the cilkscale chapter, the qsort
example creates a cilk::cilkscale object and calls the start(), stop()
and dump() methods to generate performance measurements. By default,
cilkscale will run the program N times, using 1 to N cores. Use the
-workers option to specify the maximum number of workers to measure.
cilkscale will run the program one additional time using the Parallel
Performance Analyzer option to predict how performance will scale.
Here, we run with 1 and 2 workers, plus one additional run. You will
see the output of qsort each time it runs. After a set of runs,
cilkscale will display a graph showing the measured and predicted
performance. The graph, screen and file output are explained in detail
in the cilkscale chapter. (On Linux\* systems, the graph is only
displayed if gnuplot is installed.)

\cilkscale -trials all 2 -verbose qsort.exe cilkscale: CILK\_NPROC=2
qsort.exe

Sorting 10000000 integers

5.125 seconds Sort succeeded.

cilkscale: CILK\_NPROC=1 qsort.exe Sorting 10000000 integers

9.671 seconds Sort succeeded.

cilkscale: cilksan -w qsort.exe Sorting 10000000 integers

38.25 seconds Sort succeeded.

Cilkscale Scalability Analyzer V1.1.0, Build 7684

1)  Parallelism Profile

Work : 17,518,013,236

instructions

Span : 1,617,957,937

instructions

Burdened span : 1,618,359,785 instructions

Parallelism : 10.83

Burdened parallelism : 10.82

Number of spawns/syncs : 10,000,000

Average instructions / strand : 583

Strands along span : 95

Average instructions / strand on span : 17,031,136 Total number of
atomic instructions : 10,000,000

2)  Speedup Estimate

2 processors: 1.73 - 2.00

4 processors: 2.72 - 4.00

8 processors: 3.81 - 8.00

16 processors: 4.77 - 10.83

32 processors: 5.45 - 10.83

![](media/image1.png){width="5.197222222222222in" height="4.0625in"}

Here is an overview of the sequence of steps to create a parallel
program using the OpenCilk++ SDK.

- Typically, you will start with a serial C or C++ program that
implements the basic functions or algorithms that you want to
parallelize. You will likely be most successful if the serial program
is correct to begin with! Any bugs in the serial program will occur in
the parallel program, but they will be more difficult to identify and
fix.

- Next, identify the program regions that will benefit from parallel
operation. Operations that are relatively long-running and which can
be performed independently are prime candidates.

- Rename the source files, replacing the .cpp extension with .cilk.

- **Windows\* OS:** Within Visual Studio\*, use the \"Convert to
Cilk\" context menu.

- Use the three Cilk++ keywords to identify tasks that can execute in
parallel:

- cilk\_spawn indicates a call to a function (a \"child\") that can
proceed in parallel with the caller (the \"parent\").

- cilk\_sync indicates that all spawned children must complete before
proceeding.

- cilk\_for identifies a loop for which all iterations can execute in
parallel.

- Build the program:

- **Windows OS:** Use either the cilkpp command-line tool or compile
within Visual Studio\*.

- **Linux\* OS:** Use the cilk++ compiler command.

- Run the program. If there are no ***race conditions*** (Page
[87](#_bookmark82)), the parallel program will produce the same result
as the serial program.

- Even if the parallel and serial program results are the same, there
may still be race conditions. Run the program under the ***cilksan
race detector*** (Page [96](#_bookmark92)) to identify possible race
conditions introduced by parallel operations.

- ***Correct any race conditions*** (Page [89](#_bookmark86)) with
***reducers*** (Page [52](#_bookmark48)), locks, or recode to resolve
conflicts.

- Note that a traditional debugger can debug the *serialization* (Page
[126](#_bookmark122)) of a parallel program, which you can create
easily with the OpenCilk SDK.

We will walk through this process in detail using a sort program as an
example.

We\'ll demonstrate how to use write an OpenCilk++ program by
parallelizing a simple implementation of ***Quicksort***
([[http://en.wikipedia.org/wiki/Quicksort]{.underline}](http://en.wikipedia.org/wiki/Quicksort)).

Note that the function name sample\_qsort avoids confusion with the
Standard C Library

qsort function. Some lines in the example are removed here, but line
numbers are preserved.

9 \#include \<algorithm\

11 \#include \<iostream\

12. \#include \<iterator\

13. \#include \<functional\14



15. // Sort the range between begin and end.

16. // \"end\" is one past the final element in the range.

19 // This is pure C++ code before Cilk++ conversion. 20

21 void sample\_qsort(int \* begin, int \* end) 22 {

23. if (begin != end) {

24. \--end; // Exclude last element (pivot)

25. int \* middle = std::partition(begin, end,

26. std::bind2nd(std::less\<int\(),\*end));



28. std::swap(\*end, \*middle); // pivot to middle

29. sample\_qsort(begin, middle);

30. sample\_qsort(++middle, ++end); // Exclude pivot 31 }

32 }

33

34. // A simple test harness

35. int qmain(int n) 36 {

37 int \*a = new int\[n\]; 38

39 for (int i = 0; i \< n; ++i) 40 a\[i\] = i;

41

42. std::random\_shuffle(a, a + n);

43. std::cout \<\< \"Sorting \" \<\< n \<\< \" integers\"

\<\< std::endl;

45 sample\_qsort(a, a + n); 48

49 // Confirm that a is sorted and that each element

// contains the index.

50 for (int i = 0; i \< n-1; ++i) {

51 if ( a\[i\] \= a\[i+1\] \|\| a\[i\] != i ) {

52 std::cout \<\< \"Sort failed at location i=\"

\<\< i \<\< \" a\[i\] = \"

53 \<\< a\[i\] \<\< \" a\[i+1\] = \" \<\< a\[i+1\]

\<\< std::endl;

+------+-----+------------------------------------------------------+
| 54 |     | delete\[\] a;                                      |
+======+=====+======================================================+
| 55 |     | return 1;                                          |
+------+-----+------------------------------------------------------+
| 56 |     | }                                                  |
+------+-----+------------------------------------------------------+
| 57 |     | }                                                  |
+------+-----+------------------------------------------------------+
| 58 |     | std::cout \<\< \"Sort succeeded.\" \<\< std::endl; |
+------+-----+------------------------------------------------------+
| 59 |     | delete\[\] a;                                      |
+------+-----+------------------------------------------------------+
| 60 |     | return 0;                                          |
+------+-----+------------------------------------------------------+
| 61 | } |                                                      |
+------+-----+------------------------------------------------------+

62

63 int main(int argc, char\* argv\[\]) 64 {

65 int n = 10\*1000\*1000;

66. if (argc \1)

67. n = std::atoi(argv\[1\]); 68

69 return qmain(n); 70 }

Converting the C++ code to OpenCilk C++ code is very simple.

- Rename the source file by changing the .cpp extension to .cilk.

- **Windows\* OS:** Use the \"Convert to Cilk\" context menu within
Visual Studio\*.

- Add a \"\#include \<cilk.h\\" statement to the source. cilk.h
declares all the entry points to the OpenCilk runtime.

- Rename the main() function (Line 63) to cilk\_main(). The OpenCilk
runtime system will setup the OpenCilk context, then call this entry
point instead of main().

The result is an OpenCilk program that has no parallelism yet.

Compile the program to ensure that the OpenCilk SDK development
environment is setup correctly.

Typically, OpenCilk programs are built with optimized code for best
performance.

- **Windows command line:** cilkpp /Ox qsort.cilk

- **Windows Visual Studio\*:** Specify the Release configuration

- **Linux\* OS:** opencilk++ qsort.cilk -o qsort -O2

We are now ready to introduce parallelism into our qsort program.

The cilk\_spawn keyword indicates that a function (the *child*) may be
executed in parallel with the code that follows the cilk\_spawn
statement (the *parent*). Note that the keyword *allows* but does not
*require* parallel operation. The OpenCilk scheduler will dynamically
determine what actually gets executed in parallel when multiple
processors are available. The cilk\_sync statement indicates that the
function may not continue until all cilk\_spawn requests in the same
function have completed. cilk\_sync does not affect parallel strands
spawned in other functions.

21 void sample\_qsort(int \* begin, int \* end) 22 {

23. if (begin != end) {

24. \--end; // Exclude last element (pivot)

25. int \* middle = std::partition(begin, end,

26. std::bind2nd(std::less\<int\(),\*end));



28. std::swap(\*end, \*middle); // pivot to middle

29. ##### cilk\_spawn sample\_qsort(begin, middle);

30. sample\_qsort(++middle, ++end); // Exclude pivot

31. ##### cilk\_sync;

32 }

33 }

In line 29, we spawn a recursive invocation of sample\_qsort that can
execute asynchronously. Thus, when we call sample\_qsort again in line
30, the call at line 29 might not have completed. The cilk\_sync
statement at line 31 indicates that this function will not continue
until all cilk\_spawn requests in the same function have completed.

There is an implicit cilk\_sync at the end of every function that
waits until all tasks spawned in the function have returned, so the
cilk\_sync at line 32 is redundant, but written here for clarity.

The above change implements a typical divide-and-conquer strategy for
parallelizing recursive algorithms. At each level of recursion, we
have two-way parallelism; the parent strand (line 30) continues
executing the current function, while a child strand executes the
other recursive call. This recursion can expose quite a lot of
parallelism.

With these changes, you can now build and execute the OpenCilk version
of the qsort program. Build and run the program exactly as we did with
the previous example:

##### Linux\* OS:

opencilk++ qsort.cilk -o qsort

##### Windows\* Command Line:

cilkpp qsort.cilk

##### Windows Visual Studio\*:

build the Release configuration

##### Run qsort from the command line

\qsort

Sorting 10000000 integers

5.641 seconds Sort succeeded.

By default, an OpenCilk program will query the operating system and
use all available cores. You can control the number of workers using
the cilk\_set\_worker\_count command line option to any Cilk++ program
that uses cilk\_main().

##### Observe speedup on a multicore system

Run qsort using one and then two cores:

\qsort -cilk\_set\_worker\_count=1 Sorting 10000000 integers

2.909 seconds Sort succeeded.

\qsort -cilk\_set\_worker\_count=2 Sorting 10000000 integers

1.468 seconds Sort succeeded.

Alternately, run cilkscale to get a more detailed performance graph:

\cilkscale qsort
