---
title: Ideal parallel computer
defn: |-
    Our analyses generally assume that parallel algorithms execute on an *ideal parallel 
    computer*, which consists of a set of processors and a [sequentially consistent](/doc/reference/glossary/#sequentially-consistent)
    shared memory. 
    The ideal parallel-computer model also assumes that each processor in the machine has equal computing power, 
    and it ignores the cost of scheduling. 
    This last assumption may sound optimistic, but it turns out that
    for algorithms with sufficient [parallelism](/doc/reference/glossary/#parallelism),
    the overhead of scheduling is generally minimal in practice.
---