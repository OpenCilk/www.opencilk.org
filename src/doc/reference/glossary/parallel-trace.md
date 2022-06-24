---
title: Parallel trace
defn: |-
    It helps to view the execution of a parallel computation&mdash;the dynamic stream of
    runtime instructions executed by processors under the direction of a parallel program&mdash;as
    a directed acyclic graph $G=(V,E)$, called a *(parallel) trace*. Conceptually, 
    the vertices in $V$ are executed instructions, and the edges in $E$ represent
    dependencies between instructions, where $(u,v)\in E$ means that the parallel 
    program required instruction $u$ to execute before instruction $v$.
---