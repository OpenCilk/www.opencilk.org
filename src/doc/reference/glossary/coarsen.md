---
title: Coarsen
---

To reduce the overhead of recursive spawning, task-parallel platforms sometimes
*coarsen* the leaves of the recursion by executing several iterations in a single leaf,
either automatically or under programmer control. This optimization comes at
the expense of reducing the parallelism. If the computation has sufficient parallel
slackness, however, near-perfect linear speedup won’t be sacrificed.