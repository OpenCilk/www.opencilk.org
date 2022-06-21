---
title: Fork-join parallelism
defn: |-
    Almost all task-parallel environments support *fork-join parallelism*, which is typically embodied
    in two linguistic features: *spawning* and *parallel loops*. Spawning allows a subroutine to be “forked”: executed like a subroutine call, except that the caller can continue to execute while the spawned subroutine computes its result. A parallel
    loop is like an ordinary `for` loop, except that multiple iterations of the loop can
    execute at the same time.
    
    *Fork-join* parallel algorithms employ spawning and parallel loops to describe
    parallelism. A key aspect of this parallel model, inherited from the task-parallel
    model but different from the thread model, is that the programmer does not specify
    which tasks in a computation must run in parallel, only which tasks may run in
    parallel. The underlying runtime system uses threads to load-balance the tasks
    across the processors.
---