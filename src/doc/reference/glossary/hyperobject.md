---
title: Hyperobject
tags: hyperobject
---
A linguistic construct supported by the
OpenCilk runtime system 
that allows many {% defn "strand", "strands" %}
to coordinate in updating a shared
variable or data structure independently
by providing different {% defn "view", "views" %}
of the hyperobject to different strands at
the same time. The {% defn "reducer" %} is the only
hyperobject currently provided by OpenCilk.