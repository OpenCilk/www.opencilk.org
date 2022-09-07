---
title: Fake lock
tags: fake lock
---
A construct that `Cilksan` treats as
a lock but which behaves like a no-op
during actual running of the program. A
fake lock can be used to suppress the
reporting of an intentional {% defn "race condition" %}.