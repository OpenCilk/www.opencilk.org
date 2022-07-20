---
title: Spawning
tags: spawning
---

*Spawning* occurs when the keyword `cilk_spawn` precedes a procedure call. 
The semantics of a spawn differs from an ordinary procedure call in
that the procedure instance that executes the spawn&mdash;the *parent*&mdash;may continue
to execute in parallel with the spawned subroutine&mdash;its *child*&mdash;instead of waiting
for the child to finish, as would happen in a serial execution.