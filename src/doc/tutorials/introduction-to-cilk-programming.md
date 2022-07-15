---
layout: layouts/page.njk
title: Introduction to Cilk programming
author: Bruce Hoppe
date: 2022-07-15T18:13:01.322Z
---
Parallel computers—computers with multiple processing units—are ubiquitous.
Handheld, laptop, desktop, and cloud machines are all multicore computers, or
simply, multicores, containing multiple processing “cores.” Each processing core
is a full-fledged processor that can directly access any location in a common shared
memory. Multicores can be aggregated into larger systems, such as clusters, by
using a network to interconnect them. These multicore clusters usually have a distributed memory, where one multicore’s memory cannot be accessed directly by a
processor in another multicore. Instead, the processor must explicitly send a mes-
sage over the cluster network to a processor in the remote multicore to request any
data it requires. The most powerful clusters are supercomputers, comprising many
thousands of multicores. But since shared-memory programming tends to be conceptually easier than distributed-memory programming, and multicore machines
are widely available, this chapter focuses on parallel algorithms for multicores.
One approach to programming multicores is thread parallelism. This processor-centric parallel-programming model employs a software abstraction of “virtual
processors,” or threads that share a common memory. Each thread maintains its
own program counter and can execute code independently of the other threads. The
operating system loads a thread onto a processing core for execution and switches
it out when another thread needs to run.