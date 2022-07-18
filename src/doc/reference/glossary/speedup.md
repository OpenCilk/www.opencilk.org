---
title: Speedup
---

We define the *speedup* of a computation on $P$ processors by the ratio $T_1/T_P$,
which says how many times faster the computation runs on $P$ processors than
on one processor. By the work law, we have $T_P \geq T_1/P$, which implies that
$T_1/T_P \leq P$. Thus, the speedup on a $P$-processor ideal parallel computer can be
at most $P$.