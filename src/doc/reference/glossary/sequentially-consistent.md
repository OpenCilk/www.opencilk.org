---
title: Sequential consistency
---

*Sequential consistency* means that even if
multiple processors attempt to access memory simultaneously, 
the shared memory behaves as if exactly one instruction from one of the processors is executed at
a time, even though the actual transfer of data may happen at the same time. It is
as if the instructions were executed one at a time sequentially according to some
global linear order among all the processors that preserves the individual orders in
which each processor executes its own instructions.