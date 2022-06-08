---
title: The folly of do-it-yourself multithreading
excerpt: For scalability, code simplicity, and modularity, use a concurrency platform.
date: 2022-03-02
author: Charles Leiserson
draft: true
tags:
 - multicore programming
 - performance
 - reliability
 - productivity
---

Many engineering organizations struggle with NIH ("not invented here") attitudes within their company, since most engineers would rather build than buy. Doing it yourself is more fun - or at least it seems that way when the project kicks off. In the arena of multithreaded software, the attraction of do-it-yourself (DIY) multithreading may sound compelling to some. If you're a top-flight developer, you may well be familiar with POSIX threads (pthreads) or WinAPI threads, and the challenge of building a multicore application from scratch using the primitives provided by these libraries may tantalize your salivary glands. Besides, in the words of Longfellow, won't doing it yourself ensure that it is well done? 

The alternative is to program atop a concurrency platform  — an abstraction layer of software that coordinates, schedules, and manages the multicore resources.  Concurrency platforms include any of various thread-pool libraries, such as .NET’s ThreadPool class; message-passing environments, such as MPI; data-parallel programming environments, such as NESL, RapidMind, or ZPL; task-parallel environments, such as Intel’s Threading Building Blocks (TBB) or Microsoft’s Task Parallel Library (TPL); dynamic multithreading environments, such as Cilk or Cilk++; or combinations, such as OpenMP.  Some concurrency platforms provide linguistic abstractions, some augment languages using pragmas, while others are simply implemented as library functions. 

## Three desirable properties 

Although a concurrency platform may provide benefits over DIY multithreading with respect to application performance and software reliability, a strong case against DIY can be made purely on the basis of development time.  (In a previous blog post, I called the three requirements of application performance, software reliability, and development time the multicore-software triad .)  Indeed, as a rule, one can generally develop robust multithreaded software faster using a concurrency platform than doing it yourself with native threads.  The reason is that the DIY strategy makes it hard to obtain three desirable properties of multicore software:

  -  Scalability
  -  Code simplicity
  -  Modularity 

## A tiny example 

To illustrate the folly of DIY multithreading and its adverse impact on development time, let’s look at the simple example of parallelizing a recursive Fibonacci calculation.  The ith Fibonacci number is the ith number (indexed from 0) in the sequence 0, 1, 1, 2, 3, 5, 8, 13, 21,…, where each number is the sum of the previous two. 

Although this example is tiny and artificial, it illustrates the key issues.  Here’s the original code in C/C+:

```c
1	#include 
2	#include 
3	#include 
  	  	 
4	int fib(int n)
5 	  	{
6 	  	  if (n < 2) return n;
7 	  	  else {
8 	  	    int x = cilk_spawn fib(n-1);
9 	  	    int y = fib(n-2);
10 	  	    cilk_sync;
11 	  	    return x + y;
12 	  	  }
13 	  	}
  	  	 
14	int cilk_main(int argc, char *argv[])
15 	  	{
16 	  	  int n = atoi(argv[1]);
17 	  	  int result = fib(n);
18 	  	  printf("Fibonacci of %d is %d.\n", n, result);
19 	  	  return 0;
20 	  	}
```

Incidentally, this algorithm is a terrible way to calculate Fibonacci numbers, since it continually recalculates already computed values and runs in exponential time.  Didactically, however, it’s short and good enough for our purposes.  Just remember that our goal is to parallelize this particular algorithm, not to replace it with a more efficient algorithm for computing Fibonacci numbers.
A version using native threads 

Below is a pthreaded version designed to run on 2 processor cores.  A WinAPI-threaded implementation would follow similar logic, only differing in the names of library functions.  I’m not going to argue that this is the simplest possible threaded code, but it is fairly typical of what you must do to parallelize the application for 2 processor cores.  Anyway, here's the code:

```c
1	#include 
2	#include 
3	#include 
  	  	 
4	int fib(int n)
5		{
6 	  	  if (n < 2) return n;
7 	  	  else {
8 	  	    int x = fib(n-1);
9 	  	    int y = fib(n-2);
10 	  	    return x + y;
11 	  	  }
12		}
  	  	 
13	typedef struct {
14 	  	  int input;
15 	  	  int output;
16 	  	} thread_args;
  	  	 
17 	  	void *thread_func ( void *ptr )
18 	  	{
19 	  	  int i = ((thread_args *) ptr)->input;
20 	  	  ((thread_args *) ptr)->output = fib(i);
21 	  	  return NULL;
22 	  	}
23 	  	 
24	int main(int argc, char *argv[])
25 	  	{
26 	  	  pthread_t thread;
27 	  	  thread_args args;
28 	  	  int status;
29 	  	  int result;
30 	  	  int thread_result;
31 	  	  if (argc < 2) return 1;
32 	  	  int n = atoi(argv[1]);
33 	  	  if (n < 30) result = fib(n);
34 	  	  else {
35 	  	    args.input = n-1;
36 	  	    status = pthread_create(&thread,
						NULL,	thread_func,
						(void*) &args );
  	  	    // main can continue executing while the thread executes.
37 	  	    result = fib(n-2);
  	  	    // Wait for the thread to terminate.
38 	  	    pthread_join(thread, NULL);
39 	  	    result += args.output;
40 	  	  }
41	printf("Fibonacci of %d is %d.\n", n, result);
42	return 0;
43	}
```

The program computes fib(n) by handing off the calculation of fib(n-1) to a subsidiary thread.  As it turns out, on my dual-core laptop, the cost of starting up a subsidiary thread is sufficiently great that it’s actually slower to use two threads if n isn’t big enough.  A little experimentation led to hardcoding in a threshold of 30 in line 33 for when it’s worth creating the subsidiary thread, which leads to about a 1.5 times speedup for computing fib(40). 

Please bear with me through some details of the implementation while we examine the logic of this code, because it will reveal what DIY programming with native threads is all about.  Assuming it is worthwhile to use two threads, we can create the subsidiary thread using the pthread library function pthread_create().  This function takes as arguments a pointer to the function the thread will run after it’s created and a pointer to the function’s single argument — in this case to thread_func() and the struct args, respectively.  Thus, line 35 marshals the argument n-1 by storing it into the input field of args, and line 36 creates the subsidiary thread which calls the wrapper function thread_func() on argument args.  While the subsidiary thread is executing, the main thread goes on to compute fib(n-2) in parallel line 37.  The subsidiary thread unpacks its argument in line 19, and line 20 stores the result of computing fib(n-1) into the output field of args.  When the subsidiary thread completes, as tested for by pthread_join() in line 38, the main thread adds the two results together in line 39.

## The impact on development time 

We’re now in a position to evaluate how development time might be impacted by coding in a DIY multithreading style.

**Scalability.**  The first thing to note is the lack of scalability.  The native-threaded code offers speedup only on a dual-core processor, and it doesn’t even attain a factor of 2, because the load isn’t balanced between the two threads.  Additional coding will be needed to scale to quad-core, and as each generation of silicon doubles the number of cores, even more coding will be required.  You might think that you could write the code to use 1000 threads, but unfortunately, the overhead of creating 1000 threads would dominate the running time.  Moreover, the system would require memory resources proportional to 1000, even when running on a few cores or just a single core.  What’s needed is a load-balancing scheduler that manages memory intelligently, and as luck would have it, that’s one of the services that most concurrency platforms provide.

**Code simplicity.**  Without a concurrency platform, the effort of thread management can complicate even a simple problem like Fibonacci, harkening back to the days when programmers had to write their own linkage protocols to communicate arguments to called subroutines.  That was John Backus’s great innovation embodied in 1957 in the first FORTRAN compiler.  You could call a subroutine without elaborate marshaling of arguments and return values, just by naming them in a functional syntactic form.  By contrast, in the native-threaded Fibonacci code, the argument n-1 must be marshaled into the args struct in order to pass it to the subsidiary thread, and then it must be unpacked by the wrapper function thread_func() on arrival, much as in pre-FORTRAN caller-callee linkage.  DIY multithreading takes a veritable 50-year leap backward!  Encapsulating parallel linkage so that it can be expressed in a functional syntactic form is another service that many concurrency platforms provide.

**Modularity.**  Unlike in the serial version, the Fibonacci logic in the native-threaded version is no longer nicely encapsulated in the fib() routine.  In particular, the identity fib(n) = fib(n-1) + fib(n-2) has now infiltrated the main thread.  For large applications, a mandated change to the basic serial logic often requires the parallel logic to be modified as well to ensure consistency.  You might think that updating both the serial and parallel logic might as much as double developer time, but it’s actually much worse in practice.  As can be seen from this little example, parallel code can be far more complicated than serial code, and maintaining a DIY multithreaded codebase can cost a factor of 10 or more in developer time over a functionally equivalent serial code.  A concurrency platform may provide linguistic support so that the program logic doesn’t weasel its way into complex thread-management code.

## The bottom line 

One can criticize DIY multithreading from the points of view of application performance and software reliability, as well as development time, but the case in terms of development time alone is strong.  For example, to obtain good performance and ensure reliable software may require extra attention to coding that could also adversely impact development time. 

You may now be convinced of the folly of DIY multithreading, but if you’re a top-flight developer, you may still harbor thoughts of building your own concurrency platform rather than acquiring one.  Before going too far down that path, however, you would be wise to consider the large development efforts that have gone into existing concurrency platforms.  Building a concurrency platform from scratch is a mountain to climb.  Although many of today’s concurrency platforms fail to offer complete solutions to multicore programming, most do represent a better place to start than does DIY multithreading, and they’re improving rapidly.

In summary, parallel programming has earned a reputation for being difficult, and a good deal of that credit owes itself to applications written with native threads.  So, if you don’t mind that your multicore software is a mess, if you don’t mind giving corner offices to the few engineers who have at least some clue as to what’s going on, if you don’t mind the occasional segment fault when your software is in the field, then DIY multithreading may fit the bill perfectly.  J  But, if the prospect sounds at least mildly unpleasant, I encourage you to check out one of the concurrency platforms mentioned at the beginning of this blog.

To get you started, here’s a parallelization of the fib() code using the Cilk++ concurrency platform:

```c
1	#include 
2 	#include 
3	#include 
  	  	 
4	int fib(int n)
5		{
6 	  	  if (n < 2) return n;
7 	  	  else {
8 	  	    int x = cilk_spawn fib(n-1);
9 	  	    int y = fib(n-2);
10 	  	    cilk_sync;
11 	  	    return x + y;
12 	  	  }
13		}
  	  	 
14	int cilk_main(int argc, char *argv[])
15 	  	{
16 	  	  int n = atoi(argv[1]);
17 	  	  int result = fib(n);
18 	  	  printf("Fibonacci of %d is %d.\n", n, result);
19 	  	  return 0;
20 	  	}
```

Compare this code with the original, and you judge the impact on development time.