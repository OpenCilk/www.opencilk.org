---
title: Sync
tags: sync
---
To wait for a set of {% defn "spawn", "spawned" %} functions to
return before proceeding. The current
function is dependent upon the spawned
functions and cannot proceed in parallel
with them. See also {% defn "cilk_sync" %}.