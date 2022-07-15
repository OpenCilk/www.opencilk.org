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
With OpenCilk, you can use task parallelism to program multicore computers with the Cilk language.

Task-parallel programming allows parallelism to be specified in a “processor-oblivious” fashion, where the programmer identifies what computational tasks may
run in parallel but does not indicate which thread or processor performs the task.
Thus, the programmer is freed from worrying about communication protocols, load
balancing, and other vagaries of "do-it-yourself" multicore programming. The task-parallel platform
contains a scheduler, which automatically load-balances the tasks across the pro-
cessors, thereby greatly simplifying the programmer’s chore. Task-parallel algorithms provide a natural extension to ordinary serial algorithms, allowing performance to be reasoned about mathematically using “work/span analysis.”

, which uses task parallelism.

 to program multicore computers  This processor-centric parallel-programming model employs a software abstraction of “virtual
processors,” or threads that share a common memory. Each thread maintains its
own program counter and can execute code independently of the other threads. The
operating system loads a thread onto a processing core for execution and switches
it out when another thread needs to run.