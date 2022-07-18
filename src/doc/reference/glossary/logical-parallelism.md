---
title: Logical parallelism
---

Parallel keywords like `cilk_spawn`, `cilk_scope`, `cilk_sync`, and `cilk_for` express
the *logical parallelism* of a computation, indicating which parts of the computation 
*may* proceed in parallel (without requiring that they *must* do so). At runtime, it is up to a scheduler to determine
which subcomputations actually run in parallel by assigning them to available processors
as the computation unfolds.