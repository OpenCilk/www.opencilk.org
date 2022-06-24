---
title: Centralized
defn: |-
    A good scheduler operates in a distributed fashion, where
    the threads implementing the scheduler cooperate to load-balance the computation.
    Provably good online, distributed schedulers exist, but analyzing them is complicated. 
    To keep the analysis simple, one may consider an online *centralized*
    scheduler that knows the global state of the computation at any moment.
---