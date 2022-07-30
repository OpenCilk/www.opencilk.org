---
excerpt: The bane of concurrency, race conditions are notoriously hard to find.
  If you're going to multicore-enable your application, you need a reliable way
  to find them and eliminate them.
draft: true
author: I-Ting Angelina Lee
thumbnail: /img/determinacy-races-1.png
title: Are determinacy-race bugs lurking in YOUR multicore application?
tagline: determinacy race; data race; task parallelism
date: 2022-07-19T17:46:52.940Z
tags:
  - determinacy race
  - data race
---

Race conditions are the bane of concurrency.  Famous race bugs include the Therac-25 radiation therapy machine, which killed three people and injured several others, and the North American Blackout of 2003, which left over 50 million people without power.  These pernicious bugs are notoriously hard to find.  You can run regression tests in the lab for days without a failure only to discover that your software crashes in the field with regularity.  If you're going to multicore-enable your application, you need a reliable way to find and eliminate race conditions.

Different types of race conditions exist depending on the synchronization methodology (e.g., locking, condition variables, etc.) used to coordinate parallelism in the application.  Perhaps the most basic of race conditions, and the easiest to understand, is the “determinacy race,” because this kind of race doesn’t involve a synchronization methodology at all.  A program is *deterministic*  if it always does the same thing on the same input, no matter how the instructions are scheduled on the multicore computer, and it’s *nondeterministic*  if its behavior might vary from run to run.  Often, a parallel program that is intended to be deterministic isn’t, because it contains a determinacy race.

In the following examples, we’ll assume that the underlying hardware supports the *sequential consistency* memory model, where the parallel program execution can be viewed as an interleaving of the steps of the processes, threads, strands, or whatever the abstraction for independent locus of control in the parallel-programming model. 

## A simple example

Let’s look at an example of a determinacy-race bug, and then we’ll define determinacy races more precisely.  The following Cilk++ code illustrates a determinacy race on a shared variable x:

```c
void incr (int *counter) {
    ++(*counter);
}

void main() {
    int x(0);
    cilk_spawn incr (&x);
    incr (&x);
    cilk_sync;
    assert (x == 2);
}
```

The `cilk_spawn` keyword calls `incr()` but allows control to continue to the following statement.  The `cilk_sync` keyword says control shouldn’t go past this point until the spawned subroutine has completed.  In an ordinary serial execution (equivalent to executing the code with the `cilk_spawn` and `cilk_sync` keywords nulled out), the result is that the value of `x` is increased to 2.  This parallel code has a bug, however, and in a parallel execution, it might sometimes produce 1 for the value of `x`.  To understand why, it’s helpful to have a clearer model of parallel-program execution.

## A model for parallel-program execution

We can view the program execution as being broken into four “strands.”  A *strand* is a sequence of instructions that doesn’t contain any parallel control, such as `cilk_spawn` or `cilk_sync`.  Strand $A$ begins with the start of the program and ends at the cilk_spawn statement.  Two subsequent strands, $B$ and $C$, are created at the `cilk_spawn` statement: $B$ executes the spawned subroutine `incr()`, and $C$ executes the called subroutine `incr()` on the next line.  These two strands join at the cilk_sync statement, where Strand $D$ begins.  Strand $D$ consists of the instructions from the `cilk_sync` to the end of the program.  Here’s a graphical view of the four strands:

<img src='/img/determinacy-races-1.png' width=380>

We say that a strand $S$ *precedes*  a strand $S'$, sometimes denoted $S ≺ S'$, if $S$ must complete before
$S'$ can begin.  If neither $S ≺ S'$ nor $S′ ≺ S$, we say the strands are parallel, denoted $S ∥ S'$.  In the diagram, we have $A ≺ B$, $A ≺ C$, $B ≺ D$, $C ≺ D$, and by inference, $A ≺ D$.  We also have $B ∥ C$.  This type of diagram is called a *directed acyclic graph*  or *dag*, and it’s a convenient way to visualize the execution of a parallel program.

We can now define a determinacy race formally.

**Definition.**  A determinacy race  occurs when two logically parallel strands access the same location of memory and one of the strands performs a write.

If $S$ performs the write and $S'$ performs a read, we call the determinacy race a *read race*.  The behavior of the program depends on whether $S'$ sees the value before or after $S$’s write.  If $S'$ performs a write, the determinacy race is a *write race*.  In this case, one of the two writes is “lost,” and the behavior of the program may depend on which thread wrote last.

## Atomicity

The key reason that the example code exhibits a determinacy race is that the `counter++` statement in the definition of `incr()` is not atomic, meaning that it is made up of smaller operations.  The figure below, we’ve broken the increment of the variable `x` into a load from memory into a register, an increment of the register, and then a store of the result back into memory:

<img src='/img/determinacy-races-2.png' width=360>

(We’ve also eliminated a bunch of instructions that don’t involve computation on `x`.) Strand $A$ executes the instruction with label 1; Strand $B$ executes the code with labels 2, 3, and 4; Strand $C$ executes the code with labels 5, 6, and 7; and Strand $D$ executes the instruction with label 8.

When the multicore computer executes two strands in parallel, it is as if the various operations making up the strand were interleaved. Now, we can see why the code might operate in a faulty manner. If the instructions are executed in the order 1, 2, 3, 5, 6, 7, 4, 8, then strands $B$ and $C$ both read 0 for the value of `x` and subsequently both store 1. Thus, `x` is incremented only once, not twice as we would like. Ouch!

Of course, there are many executions that don’t elicit the bug. For example, if the execution order were (1, 2, 3, 4, 5, 6, 7, 8) or (1, 4, 5, 6, 2, 3, 4, 8), we’d be okay. That’s the problem with determinacy races: generally, most orderings are okay (in this case, any for which $B$ executes before $C$ or vice versa); just some generate improper results ($B$ and $C$ interleave). Consequently, races are notoriously hard to test for. You can test for days in the lab and never see a bug, only to release your software and have some customer repeatedly experience the bug (often catastrophic crashes) because of some timing situation in their environment.

## Validating determinacy

How can you make sure that your parallel program has no determinacy races? You can try to do it by manual inspection, but that’s tedious and error-prone. You have to make sure that every possible ordering of instructions in a parallel execution produces the same behavior. There is an easier way, however. OpenCilk provides a race-detection tool, called `Cilksan`, which can tell you if your Cilk++ program is free of determinacy races. Moreover, if there is a race, it will locate the offending accesses in the source code, including stack traces. You can check correctness of your code by testing it on serial executions and then use `Cilksan` to verify that there are no determinacy races.

Of course, there are other sources of nondeterminism besides determinacy races. A program that queries time of day, for instance, may behave differently from run to run. Generally, however, we can view these sources of nondeterminism as part of the program input. If you’re testing such a program in an ordinary serial-programming environment, you usually dummy up the call to always return a fixed time so that you can check whether the output produced by the program corresponds to the value expected by your regression suite. You can do the same for a parallel code.

Some programs are correct even with determinacy races. For example, even the example code above might be considered correct if all a programmer cares about is whether `x` is zero or nonzero. Programs that use locks also typically contain determinacy races that can cause nondeterministic behavior, but the behavior may nevertheless be acceptable. When it isn’t acceptable, it’s usually because of a special kind of determinacy race, called a *data race*, which is a topic for another blog post.