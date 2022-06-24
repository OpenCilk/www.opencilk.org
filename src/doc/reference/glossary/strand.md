---
title: Strand
defn: |-
    It’s sometimes inconvenient, especially if we want to focus on the parallel structure 
    of a computation, for a vertex of a [**trace**](/doc/reference/glossary/#parallel-trace) to represent only one executed instruction. 
    Consequently, if a chain of instructions contains no parallel or procedural
    control (no `cilk_spawn`, `cilk_sync`, procedure call, or return&mdash;via either an explicit `return`
    statement or the return that happens implicitly upon reaching the end of a procedure), 
    we group the entire chain into a single *strand*. 
    Strands do not include instructions that involve parallel or procedural
    control. These control dependencies must be represented as edges in the trace.
---