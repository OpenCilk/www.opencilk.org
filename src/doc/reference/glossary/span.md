---
title: Span
defn: |-
    The *span* is the fastest possible time to execute the computation on an
    unlimited number of processors, which corresponds to the sum of the times taken
    by the strands along a longest path in the trace, where “longest” means that each
    strand is weighted by its execution time. Such a longest path is called the *critical
    path* of the trace, and thus the span is the weight of the longest (weighted) path
    in the trace.
---