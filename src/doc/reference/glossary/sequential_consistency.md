---
title: Sequential consistency
tags: sequential consistency
---
The memory model for concurrency
wherein the effect of {% defn "concurrent agents" %} is
as if their operations on {% defn "shared memory" %}
were interleaved in a global order
consistent with the orders in which each
agent executed them. This model was
advanced in 1976 by [Leslie Lamport](https://research.microsoft.com/en-us/um/people/lamport/).