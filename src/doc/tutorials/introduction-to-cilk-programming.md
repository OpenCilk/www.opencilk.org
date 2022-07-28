---
layout: layouts/page.njk
title: Introduction to Cilk programming
tagline: With a few Cilk keywords, OpenCilk extends C/C++ to support fork-join
  parallel programming, a simple and efficient model for writing fast code for
  multicore computers.
author: Bruce Hoppe
date: 2022-07-15T18:13:01.322Z
image: /img/p-fib-4-trace.png
---
{% defn "parallel algorithms", "Parallel programming" %} involves writing instructions that can be executed on different processors simultaneously. Compared to serial programming, parallel programming offers opportunities to reduce the resources consumed (e.g., time, storage, energy, etc.), but taking advantage of these opportunities can be too much for developers to manage on their own. 

OpenCilk is a task-parallel platform, which provides a layer of software that coordinates, schedules, and manages the multiple processors of a parallel program. OpenCilk automatically load-balances the tasks of the different processors and achieves performance that is provably close to optimal.

Using the OpenCilk platform, a developer writes code in Cilk, which extends C and C++ with a just few keywords to support task-parallel programming. Cilk specifically supports {% defn "fork-join parallelism" %} with spawning and parallel loops. Let's look at an example each.

{% defn "Spawning" %} allows a subroutine to be “forked”: executed like a subroutine call, except that the caller can continue to execute while the spawned subroutine computes its result. 

{% defn "Parallel loops" %} are like ordinary \`for\` loops, except that multiple iterations of the loop can execute at the same time.)

With Cilk programming, a programmer uses these keywords to describe
parallelism. A key aspect of this parallel model is that the programmer does not specify
which tasks in a computation *must* run in parallel, only which tasks *may* run in
parallel. (Behind the scenes, the OpenCilk runtime system uses threads to load-balance the tasks across the processors.)

We introduce Cilk programming begins with the problem of computing
Fibonacci numbers recursively in parallel. 
The $n$th Fibonacci number is the $n$th number (indexed from 0) in the sequence 0, 1, 1, 2, 3, 5, 8, 13, 21,…, where each number is the sum of the previous two. 
We’ll look at a straightforward serial
Fibonacci calculation, which, though inefficient, serves as a good illustration of
how to express parallelism in Cilk.

To calculate the $n$th Fibonacci number recursively, you could use the ordinary serial algorithm in the procedure `fib` below. You would not really want to compute large Fibonacci numbers this way, because this computation does needless
repeated work, but parallelizing it can be instructive.

```c
int fib(int n)
{
  if (n < 2) return n;
  else {
    int x = cilk_spawn fib(n-1);
    int y = fib(n-2);
    cilk_sync;
    return x + y;
  }
}
	  	 
int cilk_main(int argc, char *argv[])
{
  int n = atoi(argv[1]);
  int result = fib(n);
  printf("Fibonacci of %d is %d.\n", n, result);
  return 0;
}
```

The `p_fib` procedure (below) computes Fibonacci numbers, but using the
parallel keywords `cilk_spawn` and `cilk_sync` to indicate parallelism in the code.
If the keywords `cilk_spawn` and `cilk_sync` are deleted from `p_fib`, the resulting code is identical to `fib` (other than renaming the procedure in the header).

```c#
int p_fib(int n)
{
  if (n < 2) return n;
  else {
    cilk_scope {
      int x = cilk_spawn p_fib(n-1);  // don't wait for funtion to return
      int y = p_fib(n-2);             // in parallel with spawned function
    }                                 // wait for spawned function to finish
    return x + y;
  }
}

int cilk_main(int argc, char *argv[])
{
  int n = atoi(argv[1]);
  int result = p_fib(n);
  printf("Fibonacci of %d is %d.\n", n, result);
  return 0;
}
```

Spawning occurs when the keyword `cilk_spawn` precedes a procedure call, as in line 6
of `p_fib`. The semantics of a spawn differs from an ordinary procedure call in
that the procedure instance that executes the spawn—the parent—may continue
to execute in parallel with the spawned subroutine—its child—instead of waiting
for the child to finish, as would happen in a serial execution. In this case, while
the spawned child is computing `p_fib(n-1)`, the parent may go on to compute
`p_fib(n-2)` in line 7 in parallel with the spawned child. 
Since the `p_fib` procedure
is recursive, these two subroutine calls themselves create nested parallelism, as
do their children, thereby creating a potentially vast tree of sub-computations, all
executing in parallel.

The keyword spawn does not say, however, that a procedure must execute in
parallel with its spawned children, only that it may. The parallel keywords express
the logical parallelism of the computation, indicating which parts of the computation may proceed in parallel. At runtime, it is up to a scheduler to determine
which subcomputations actually run in parallel by assigning them to available 
processors as the computation unfolds. 

A procedure cannot safely use the values returned by its spawned children until after it executes a sync statement, as in line 5. The keyword \`cilk_sync\` indicates
that the procedure must wait as necessary for all its spawned children to finish 
before proceeding to the statement after the \`cilk_sync\`—the “join” of a fork-join parallel
computation. The \`p_fib\` procedure requires a \`cilk_sync\` before the \`return\` statement
in line 6 to avoid the anomaly that would occur if \`x\` and \`y\` were summed before
\`p_fib\` had finished and its return value had been assigned to \`x\`. In addition
to explicit join synchronization provided by the \`cilk_sync\` statement, it is convenient
to assume that every procedure executes a \`cilk_sync\` implicitly before it returns, thus
ensuring that all children finish before their parent finishes.

It helps to view the execution of a parallel computation—the dynamic stream of
runtime instructions executed by processors under the direction of a parallel pro-
gram—as a directed acyclic graph G D .V; E/, called a (parallel) trace.

{% img "/img/p-fib-4-trace.png" %}

Conceptually, the vertices in V are executed instructions, and the edges in E represent
dependencies between instructions, where .u; v/ 2 E means that the parallel pro-
gram required instruction u to execute before instruction v.
It’s sometimes inconvenient, especially if we want to focus on the parallel struc-
ture of a computation, for a vertex of a trace to represent only one executed instruction. Consequently, if a chain of instructions contains no parallel or procedural control (no spawn, sync, procedure call, or return—via either an explicit return statement or the return that happens implicitly upon reaching the end of a procedure), we group the entire chain into a single strand. As an example, Figure 26.2
shows the trace that results from computing P-F IB .4/ in the portion of Figure 26.1
shaded blue. Strands do not include instructions that involve parallel or procedural
control. These control dependencies must be represented as edges in the trace.
 to program multicore computers  This processor-centric parallel-programming model employs a software abstraction of “virtual
processors,” or threads that share a common memory. Each thread maintains its
own program counter and can execute code independently of the other threads. The
operating system loads a thread onto a processing core for execution and switches
it out when another thread needs to run.