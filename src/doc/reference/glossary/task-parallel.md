---
title: Task-parallel
tags: [task-parallel]
---

*Task-parallel platforms* provide a layer of software on top of {% defn "thread", "threads" %} to coordinate, schedule, and manage the {% defn "processor", "processors" %} of a {% defn "multicore" %}. Some task-parallel platforms are built as runtime libraries, but others provide full-fledged parallel languages with compiler and runtime support.

*Task-parallel programming* allows parallelism to be specified in a “processor-oblivious” fashion, where the programmer identifies what computational tasks may run in parallel but does not indicate which thread or processor performs the task. Thus, the programmer is freed from worrying about communication protocols, load balancing, and other vagaries of thread programming. The task-parallel platform contains a scheduler, which automatically load-balances the tasks across the processors, thereby greatly simplifying the programmer’s chore. Task-parallel algorithms provide a natural extension to ordinary serial algorithms, allowing performance to be reasoned about mathematically using “work/span analysis.”