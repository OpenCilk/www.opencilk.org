---
title: Complete step
tags: complete step
---

As a {% defn "greedy scheduler" %} manages a computation on $P$ processors, each step is classified as *complete* or {% defn "incomplete step", "incomplete" %}.
In a complete step, at least $P$ strands are ready to execute, meaning that all strands
on which they depend have finished execution. A greedy scheduler assigns
any $P$ of the ready strands to the processors, completely utilizing all the processor resources.