---
title: Work stealing
tags: work stealing
---
A scheduling strategy where {% defn "processor", "processors" %}
post parallel work locally and, when a
processor runs out of local work, it steals
work from another processor. Work-stealing schedulers are notable for their efficiency, because they incur no
communication or synchronization
overhead when there is ample
{% defn "parallelism" %}. The OpenCilk runtime system
employs a work-stealing scheduler.