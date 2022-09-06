---
title: Mutex
tags: mutex
---
A "mutually exclusive" {% defn "lock" %} that only one
{% defn "strand" %} can acquire at a time, thereby
ensuring that only one strand executes
the {% defn "critical section" %} protected by the
mutex at a time. 
For example, Linux* OS supports Pthreads `pthread_mutex_t` objects.