---
title: Data race
tags: data race
---
A {% defn "race condition" %} that occurs when two or
more parallel strands, holding no {% defn "lock" %} in
common, access the same memory
location and at least one of the strands
performs a write. Compare with
{% defn "determinacy race" %}.