---
title: Span law
---

The span provides a lower bound on the running time $T_P$ of a task-parallel computation on $P$ processors.
A $P$-processor ideal parallel computer cannot run any faster than a machine
with an unlimited number of processors. Looked at another way, a machine
with an unlimited number of processors can emulate a $P$-processor machine by
using just $P$ of its processors. Thus, the *span law* follows:

$T_P \geq T_{\infty}$.