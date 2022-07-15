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

```c#
int fib(int n) {
  if (n <= 1)
    return n;
  else {
    x = fib(n-1);
    y = fib(n-2);
    return x + y;
  }
}
```


, which uses task parallelism.

 to program multicore computers  This processor-centric parallel-programming model employs a software abstraction of “virtual
processors,” or threads that share a common memory. Each thread maintains its
own program counter and can execute code independently of the other threads. The
operating system loads a thread onto a processing core for execution and switches
it out when another thread needs to run.