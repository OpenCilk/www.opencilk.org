---
title: Determinacy race
tags: determinacy race
---

A *determinacy race* occurs when two logically parallel instructions access the
same memory location and at least one of the instructions modifies the value stored
in the location. For a computation with a determinacy race, 
the results can vary depending on the how the instructions are scheduled on the multicore computer.
Often in practice, most instruction orderings produce correct results, 
but some orderings generate improper results when the instructions interleave. 
Consequently, races can be extremely hard to test for.
Task-parallel programming environments often provide race-detection
productivity tools to help you isolate race bugs.