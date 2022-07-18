---
title: Incomplete step
---

As a greedy scheduler manages a computation on $P$ processors, each step is classified as complete or incomplete.
In an *incomplete step*, fewer than $P$ strands are ready to execute. 
A greedy scheduler assigns each ready strand to its own processor, leaving some processors
idle for the step, but executing all the ready strands.