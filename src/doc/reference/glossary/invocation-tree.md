---
title: Invocation tree
defn: |-
    A fork-join parallel trace can be pictured as a dag of strands embedded in an
    *invocation tree* of procedure instances. 
    All directed edges connecting strands
    run either within a procedure or along undirected edges of the invocation tree.
    More general task-parallel traces that are not fork-join traces may
    contain some directed edges that do not run along the undirected tree edges.
---