---
title: Parallelism
tags: parallelism
---

The ratio $T_1/T_{\infty}$ of the work to the span gives the *parallelism* of a parallel
computation. We can view the parallelism from three perspectives. As a ratio, the
parallelism denotes the average amount of work that can be performed in parallel
for each step along the critical path. As an upper bound, the parallelism gives the
maximum possible speedup that can be achieved on any number of processors. Perhaps 
most important, the parallelism provides a limit on the possibility of attaining
perfect linear speedup. Specifically, once the number of processors exceeds the
parallelism, the computation cannot possibly achieve perfect linear speedup.