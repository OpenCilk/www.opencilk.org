---
title: Threads and thread parallelism
tags: threads
---

One approach to programming multicores is *thread parallelism*.  This processor-centric
parallel-programming model employs a software abstraction of "virtual
processors," or *threads* that share a common memory. Each thread maintains its
own program counter and can execute code independently of the other threads. The
operating system loads a thread onto a processing core for execution and switches
it out when another thread needs to run.
