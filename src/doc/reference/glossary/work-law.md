---
title: Work law
defn: |-
    The work provides a lower bound on the running time $T_P$ of a task-parallel computation on $P$ processors:
    In one step, an ideal parallel computer with $P$ processors can do at most $P$
    units of work, and thus in $T_P$ time, it can perform at most $PT_P$ work. 
    Since the total work to do is $T_1$, we have $PT_P \geq T_1$. Dividing by $P$ yields the *work law*:

    $T_P \geq T_1/P$.
---