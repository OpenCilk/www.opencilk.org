---
title: Reducer
tags: reducer
---
A {% defn "hyperobject" %} with a defined (usually
associative) `reduce()` binary operator
which the OpenCilk runtime system uses to
combine the each {% defn "view" %} of each separate
{% defn "strand" %}.
A reducer must have two methods:
- A default constructor which initializes the
reducer to its identity value
- A `reduce()` method which merges the
value of right reducer into the left (this)
reducer.