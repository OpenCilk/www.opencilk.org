---
layout: layouts/page.njk
title: Introduction to Cilk programming
tagline: OpenCilk extends C/C++ with a few Cilk keywords to support
  task-parallel programming, a simple and efficient model for writing fast code
  for multicore computers.
author: Bruce Hoppe
date: 2022-07-15T18:13:01.322Z
image: /img/p-fib-4-trace.png
---
Programming a shared-memory parallel computer using threads
tends to be difficult and error-prone. One reason is that it can be complicated
to dynamically partition the work among the threads so that each thread receives
approximately the same load. For any but the simplest of applications, the pro-
grammer must use complex communication protocols to implement a scheduler
that load-balances the work.

The difficulty of thread programming has led to the creation of task-parallel plat-
forms, which provide a layer of software on top of threads to coordinate, schedule,
and manage the processors of a multicore. Some task-parallel platforms are built as
runtime libraries, but others provide full-fledged parallel languages with compiler
and runtime support.

Task-parallel programming allows parallelism to be specified in a “processor-oblivious” fashion, where the programmer identifies what computational tasks may
run in parallel but does not indicate which thread or processor performs the task.
Thus, the programmer is freed from worrying about communication protocols, load
balancing, and other vagaries of "do-it-yourself" multicore programming. The task-parallel platform
contains a scheduler, which automatically load-balances the tasks across the processors, thereby greatly simplifying the programmer’s chore. Task-parallel algorithms provide a natural extension to ordinary serial algorithms, allowing performance to be reasoned about mathematically using “work/span analysis.”

Although the functionality of task-parallel environments is still evolving and increasing, almost all support fork-join parallelism, which is typically embodied
in two linguistic features: spawning and parallel loops. Spawning allows a subroutine to be “forked”: executed like a subroutine call, except that the caller can
continue to execute while the spawned subroutine computes its result. A parallel
loop is like an ordinary for loop, except that multiple iterations of the loop can
execute at the same time.

Fork-join parallel algorithms employ spawning and parallel loops to describe
parallelism. A key aspect of this parallel model, inherited from the task-parallel
model but different from the thread model, is that the programmer does not specify
which tasks in a computation must run in parallel, only which tasks may run in
parallel. The underlying runtime system uses threads to load-balance the tasks
across the processors. This chapter investigates parallel algorithms described in
the fork-join model, as well as how the underlying runtime system can schedule
task-parallel computations (which include fork-join computations) efficiently.

Our exploration of parallel programming begins with the problem of computing
Fibonacci numbers recursively in parallel. We’ll look at a straightforward serial
Fibonacci calculation, which, although inefficient, serves as a good illustration of
how to express parallelism in pseudocode.

To calculate the $n$th Fibonacci number recursively, you could use the ordinary serial
algorithm in the procedure `fib` below. You would not really want to compute large Fibonacci numbers this way, because this computation does needless
repeated work, but parallelizing it can be instructive.

```c#
int fib(int n)
{
  if (n <= 1)
    return n;
  else {
    x = fib(n-1);
    y = fib(n-2);
    return x + y;
  }
}
```

The `p-fib` procedure (below) computes Fibonacci numbers, but using the
parallel keywords `cilk_spawn` and `cilk_sync` to indicate parallelism in the code.
If the keywords `cilk_spawn` and `cilk_sync` are deleted from `p-fib`, the resulting pseudocode text is identical to `fib` (other than renaming the procedure in the header).

```c#
int p-fib(int n)
{
  if (n <= 1)
    return n;
  else {
    x = cilk_spawn p-fib(n-1);  // don't wait for funtion to return
    y = p-fib(n-2);             // in parallel with spawned function
    cilk_sync;                  // wait for spawned function to finish
    return x + y;
  }
}
```

Spawning occurs when the keyword `cilk_spawn` precedes a procedure call, as in line 6
of `p-fib`. The semantics of a spawn differs from an ordinary procedure call in
that the procedure instance that executes the spawn—the parent—may continue
to execute in parallel with the spawned subroutine—its child—instead of waiting
for the child to finish, as would happen in a serial execution. In this case, while
the spawned child is computing `p-fib(n-1)`, the parent may go on to compute
`p-fib(n-2)` in line 7 in parallel with the spawned child. 
Since the `p-fib` procedure
is recursive, these two subroutine calls themselves create nested parallelism, as
do their children, thereby creating a potentially vast tree of subcomputations, all
executing in parallel.

The keyword spawn does not say, however, that a procedure must execute in
parallel with its spawned children, only that it may. The parallel keywords express
the logical parallelism of the computation, indicating which parts of the compu-
tation may proceed in parallel. At runtime, it is up to a scheduler to determine
which subcomputations actually run in parallel by assigning them to available 
processors as the computation unfolds. 

A procedure cannot safely use the values returned by its spawned children until after it executes a sync statement, as in line 5. The keyword sync indicates
that the procedure must wait as necessary for all its spawned children to finish 
before proceeding to the statement after the sync—the “join” of a fork-join parallel
computation. The P-F IB procedure requires a sync before the return statement
in line 6 to avoid the anomaly that would occur if x and y were summed before
P-F IB .n 1/ had finished and its return value had been assigned to x. In addition
to explicit join synchronization provided by the sync statement, it is convenient
to assume that every procedure executes a sync implicitly before it returns, thus
ensuring that all children finish before their parent finishes.

It helps to view the execution of a parallel computation—the dynamic stream of
runtime instructions executed by processors under the direction of a parallel pro-
gram—as a directed acyclic graph G D .V; E/, called a (parallel) trace.

{% img "img/p-fib-4-trace.png" %}

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