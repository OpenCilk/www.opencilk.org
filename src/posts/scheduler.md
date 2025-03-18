---
title: What does spawning mean?
author: John F. Carr
---

# What does spawning mean?

I want to explain how the OpenCilk compiler implements spawn, but
first I need to explain what spawn means.  The `cilk_spawn` keyword is
fundamentally different from C's `pthread_create` and Java's
`Thread.start`.  This distinction goes back to the origins of Cilk in
the 1990s and my description applies to the whole Cilk family of
languages.

By making threads explicit in the programming model, the old approach
to multithreading made programs that depended on threads to work.  A
program with a producer and consumer thread will hang if one of the
threads doesn't run.

A correct Cilk program behaves the same whether it runs on one thread
or many.  You do not have to create threads and it is poor style to
examine thread state.  By default Cilk uses as many _workers_ (threads
running user code) as your system has processors.  Spawns tell the
system that part of the program can be moved to these workers.  You
can also ask it to run single-threaded.  Then spawns don't do
anything, but the program is still the same.

## Spawning usually does nothing

In most Cilk programs most spawns have no effect.

The keyword `cilk_spawn` means the statement with the spawn is allowed
to run in parallel with the statements that follow, up until the next
`cilk_sync`.  It doesn't have to run in parallel and usually it doesn't.

A program we often use for testing and benchmarking computes a
fibonacci number with an inefficient exponential time algorithm.  The
number of spawns is comparable to the number computed.  For testing I
use an argument in the low 40s that takes about a second to run.  The
program spawns about 100 million times.

Probably less than 100 of those spawns result in added parallelism.
The rest, 99.9999% of the total, are ignored.  In a highly parallel
Cilk program the number of scheduling events is related to the number
of processors.  A perfect scheduler would have the numbers equal.
There is no perfect scheduler for general purpose programs.

Because most spawns end up having no effect, we work hard to make them
cheap.  Moving work to a new processor is allowed to be slower because
it is rare.  We call this the _work-first principle_.

(This is one reason we use our fibonacci number generator as a test.
Its performance is determined by how fast `cilk_spawn` runs and we
want that to be fast.)

## The spawn deque

When a function is spawned, i.e. a function call is prefixed with
`cilk_spawn`, the spawned function is called the _child_ and function
with the `cilk_spawn` keyword is called the _parent_.

Each worker has a deque (double-ended queue) of parent functions,
functions that have spawned.  We call one end the _head_ and the other
the _tail_.  Spawning pushes the *parent* onto the tail.  Returning
from a spawn pops the parent off the tail.

Usually that's all that happens.  Functions get pushed, functions get
popped, and in the end push and pop cancel out.

Sometimes, especially at the start of a parallel region of code, a
worker has nothing to do.  An idle worker _steals_ a function from a
busy worker by popping it off the *head* of the other worker's deque.
This _work stealing_ is how parts of the program move between
processors.

## Only monsters steal children

The thing that was popped off the head of the other worker's deque
describes a function that is suspended at a function call.  More
specifically, it is a data structure with enough information to resume
the parent function as if the spawned child had returned.  The thief
does this on a new processor.

The worker from which work was stolen, sometimes called the _victim_,
is so far oblivious.  It continues doing whatever it was doing in the
child function.  Cilk is designed so a processor keeps running serial
code as long as it can.  Work first.

Stealing parents and leaving children alone is what makes Cilk Cilk.
This scheduling policy avoids deadlocks and unnecessary migration of
work between processors.

The parent function, running on a new processor, has a flag set
indicating that it has been stolen.  It might spawn again and be
stolen again.  In any case it will eventually execute a `cilk_sync`.
If the function has never been stolen (the usual case) `cilk_sync`
does nothing.  If the function has been stolen `cilk_sync` calls into
the Cilk runtime.  The runtime suspends the function until all spawned
children return.

The spawned child will eventually return.  When it returns the worker
tries to pop the tail of the deque.  This fails: the deque is empty.
The parent is running on another processor.  Execution can not
continue.  The worker is now idle and can start stealing.

(We have an optimization for the common case where the parent reached
a `cilk_sync` and is waiting for the spawn to complete.)

## Stay tuned

Having described at a high level what `cilk_spawn` does, next time I
will describe what the compiler does to your code when you spawn.

