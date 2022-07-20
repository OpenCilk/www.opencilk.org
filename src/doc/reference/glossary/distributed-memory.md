---
title: Distributed memory
tags: distributed memory
---

Multicore clusters usually have a distributed memory, where one multicore's memory
cannot be accessed directly by a processor in another multicore.
Instead, the processor must explicitly send a message over the cluster
network to a processor in the remote multicore to request any data it requires. 