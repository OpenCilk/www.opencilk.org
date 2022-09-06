---
title: Lock
tags: lock
---
A synchronization mechanism for
providing {% defn "atomic" %} operation by limiting
concurrent access to a resource.
Important operations on locks include
acquire (lock) and release (unlock).
Many locks are implemented as a {% defn "mutex" %},
whereby only one {% defn "strand" %} can hold the
lock at any time.