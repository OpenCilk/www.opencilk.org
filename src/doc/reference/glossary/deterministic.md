---
title: Deterministic
---

A parallel algorithm is *deterministic* if it always does the same thing on the same
input, no matter how the instructions are scheduled on the multicore computer.
It is nondeterministic if its behavior might vary from run to run when the input is the same.
A parallel algorithm that is intended to be deterministic may nevertheless
act nondeterministically, however, if it contains a difficult-to-diagnose bug called a
determinacy race.