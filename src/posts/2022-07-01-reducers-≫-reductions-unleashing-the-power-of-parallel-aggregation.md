---
layout: layouts/post.njk
title: "Reducers ≫ Reductions:  Unleashing the Power of Parallel Aggregation"
excerpt: "OpenCilk reducers are more powerful than reduction operations in other
  task-parallel systems. "
author: Charles E. Leiserson
date: 2022-07-01T14:05:36.766Z
tags: []
thumbnail: /img/reduction-example.png
---
# Reducers ≫ Reductions:

# Unleashing the Power of Parallel Aggregation\[cel1] 

The idea of a reducing a set of values dates back at least to the programming language [APL](http://en.wikipedia.org/wiki/APL_(programming_language)), invented by the late [Kenneth Iverson](http://en.wikipedia.org/wiki/Kenneth_E._Iverson).  In APL, one can “sum-reduce” the elements of a vector A by simply writing +/A, which adds up all the numbers in the vector.  APL provided a variety of reduction operators besides addition, but it did not let users write their own reduction operations.  As parallel computing technology developed, reductions naturally found their way into parallel programming languages, because reduction can naturally be implemented as a parallel tree with logarithmic [span](http://www.cilk.com/multicore-blog/bid/5365/What-the-is-Parallelism-Anyhow), as shown below:

The growing set of concurrency platforms all feature some form of reduction mechanism:

·      [ OpenMP](http://openmp.org/wp/) provides a reduction clause.

·       Intel’s [Threading Building Blocks](http://www.threadingbuildingblocks.org/) (TBB) provides a parallel_reduce template function.

·       Microsoft’s upcoming [Parallel Pattern Library](http://blogs.msdn.com/nativeconcurrency/archive/2008/09/25/avoiding-contention-using-combinable-objects.aspx) (PPL) provides a combinable object construct.

·       Cilk Arts’s [Cilk++](http://www.cilk.com/multicore-products/cilk-solution-overview/) provides reducer hyperobjects.

## OpenMP reductions

For example, the following code snippet illustrates the OpenMP syntax for a sum reduction within a parallel for loop (changes from the serial code are highlighted in red):

In this code, the variable result is designated as a reduction variable of a parallel loop in the pragma preceding the for loop.  Without this designation, the various iterations of the parallel loop would [race](http://www.cilk.com/multicore-blog/bid/5254/Are-Determinacy-Race-Bugs-Lurking-in-YOUR-Multicore-Application) on the update of result.  The iterations of the loop are spread across the available processors, and local copies of the variable result are created for each processor.  At the end of the loop, the processors’ local values of result are summed to produce the final value.  TBB and PPL provide similar functionality in their own ways.

All three concurrency platforms support other reducing operations besides addition, and TBB and PPL even allow programmers to supply their own.  In order for the result to be the same as the serial code produces, however, the reducing operation must be associative and commutative, because the implementation may jumble up the order of the operations as it load-balances the loop iterations across the processors.

## Cilk++ reducers

The Cilk++ “reducer” approach differs markedly from the others, however.  Although the general concept of reduction is similar, Cilk++ reducers provide a flexible and powerful mechanism that offers the following advantages:

·       Reducers can be used to parallelize many programs containing global (or nonlocal) variables without locking, atomic updating, or the need to logically restructure the code.

·       The programmer can count on a deterministic result as long as the reducer operator is associative.  Commutativity is not required.

·       Reducers operate independently of any control constructs, such as parallel for, and of any data structures that contribute their values to the final result.

·       The Cilk++ distribution provides a library of commonly used reducers, but programmers can also write their own.

·       Reducers incur low overhead.

Unlike in OpenMP, where reduction is specified as part of the pragma describing a parallel loop, Cilk++ reducers are first-class data objects, called hyperobjects.  Below is a snippet of code illustrating how reducers can be used to parallelize the for loop from above: 

The cilk::reducer_opadd<int>  template declares result to be reducer hyperobject over integers with addition as the reduction operator.  The cilk_for keyword indicates that all iterations of the loop can operate in parallel, similar to the parallel for pragma in OpenMP.  As with OpenMP, the iterations of the loop are spread across the available processors, and local copies, called views, of the variable result are created.  There, however, the similarity ends, because Cilk++ does not wait until the end of the loop to combine the local views, and it combines them in such a way that the operator (addition in this case) need not be commutative to produce the same result as would a serial execution.  When the loop is over, the underlying integer value can be extracted from the reducer using the get_value() member function.

At this point, the differences between OpenMP reductions and Cilk++ reducers may seem minimal.  Indeed, it may even seem that Cilk++ has the additional complication of requiring get_value()to extract the underlying value at the end of the computation.  In fact, Cilk++ reducers are far more powerful, providing a general mechanism for parallelizing many programs that contain [global variables](http://www.cilk.com/multicore-blog/bid/5672/Global-Variable-Reconsidered). 

## Handling global variables

Let’s illustrate how reducers can help in the parallelizing of code with a global variable using the example of a recursive “[tree walk](http://en.wikipedia.org/wiki/Tree_walk).”  Specifically, suppose that we wish to traverse all the nodes in a tree and form a list of all the leaves that satisfy a given property.  First, the original serial code:

When called initially on the root of the tree, this code tests whether the node is an internal node or a leaf.  If the node is a leaf, it checks whether the leaf has the property, and if so, appends it to the global variable output_list.  If the node is an internal node, it recursively walks each of the children of the node.  At the end of the computation, output_list contains a list of all the leaves that satisfy the property.

The following code shows how this program can be parallelized using Cilk++ and reducers:

This parallelization takes advantage of the fact that list appending is associative.  That is if we append a list L1 to a list L2 and append the result to L3, it is the same as if we appended list L1 to the result of appending L2 to L3.  As Cilk++ load-balances this computation over the available processors, it ensures that each branch of the recursive computation has access to a private view of the variable output_list, eliminating races on this global variable without requiring locks.  When the branches synchronize, the private views are reduced (combined) by concatenating the lists, and Cilk++ carefully maintains the proper ordering so that the resulting list contains the identical elements in the same order as in a serial execution. 

OpenMP would have a hard time parallelizing this code, for three key reasons.  First, most implementations of OpenMP do not support nested parallelism well.  Second, appending of lists is not provided as one of OpenMP’s reduction operators, and programmers cannot write their own.  Third, even if programmers could write their own, reduction in OpenMP is tied to the parallel for loop pragma.  Consequently, OpenMP cannot solve the problem of races on global variables using its mechanism.  TBB and PPL have similar limitations, although they do support nested parallelism and allow programmer-defined reduction operators.

Another strategy for removing the races on output_list is to use a lock to protect the variable from multiple simultaneous updates.  Unfortunately, this strategy creates the problem of lock contention, where the parallel branches of the computation try to access the lock simultaneously, limiting parallelism.  Use of atomic updates (e.g., the x86 instruction set architecture provides XCHG, CMPXCHG, XADD, etc.), while avoiding explicit locks, can also induce contention.  

## Advantages of Cilk++ reducers

Cilk++ reducers are a more flexible and powerful mechanism that reductions provided by other concurrency platforms.  Here is a summary of advantages.

#### Solutions for nonlocal variables

Every update of a global (or nonlocal) variable can be handled without locking, atomic updating, or need to logically restructure code.  The only requirement is that updates to the global variable be reduced using an associative operator.  The variable can be stored in a data structure, passed as a parameter, or copied, and Cilk++ properly performs the updates.  In contrast, if a parallel loop in OpenMP performs a reduction on a global variable and another section of code updates the variable concurrently, a race occurs.  Cilk++ reducers properly resolve any and all updates correctly and transparently.

#### Deterministic ordering

As the computation proceeds, local views of the reducer variable are combined by the Cilk++ runtime system into a single value.  Sometimes the order of combination is irrelevant — as when the reducer is summing values, but when the order matters — as when concatenating lists — the result of a Cilk++ program that uses reducers is the same as the serial version.  Commutativity is not required in order for the parallel code to implement the same semantics as the underlying serial C++ code, no matter on how many processors the program is run or how load is balanced across the processors.

#### Independent use

Cilk++ reducers can be used independently of the control structure of the program, unlike other constructs that are defined over specific control structures such as loops.  They can also be used independently of any data structure providing the input values to be reduced.  Thus, updates in loops, by recursive programs, whatever — are all handled correctly. 

#### An extensible reducer library

The Cilk++ distribution includes a library for common reducers, including list concatenation, sum, minimum, maximum, and logical operations.  Moreover, programmers can write their own.  Different reducers represent different data types and have different update and reducing operations.  For example, the list-append reducer provides a push_back() operation, an empty list identity value, and a reduce() function that performs list concatenation.  The integer-max reducer provide a max() operation, a type-specific minus infinity identity, and a reduce() function that keeps the larger of the views being reduced.  A reducer can be instantiated on a user-defined class and can be generalized to use templates. 

#### Low overhead

The Cilk++ implementation of reducers is fast.  Accessing a reducer typically costs about the same cost as a null function call, and even this minimal overhead is greatly reduced for loops by using compiler techniques, such as common subexpression elimination.  Moreover, as long as the application contains sufficient parallelism, the reduce() function, which is invoked as an up-call by the Cilk++ runtime system to combine views, is executed relatively infrequently.  Specifically, the per-processor number of calls to reduce()is on average at most proportional to the [span of the computation](http://www.cilk.com/multicore-blog/bid/5365/What-the-is-Parallelism-Anyhow).

## Conclusion

Reducers aren’t the only type of hyperobject that Cilk++ will eventually support.  On the roadmap are two other kinds of hyperobjects.  Holders provide a structured means of implementing thread-local storage, in which local views of the hyperobject are isolated from each other.  Splitters address serial codes where a recursive function performs an action on a variable but undoes the action before it returns.  By defining the variable as a splitter, multiple branches of the computation can operate in parallel, each obtaining the same value for its view as it would in a serial execution.  The goal of all the various kinds of hyperobjects is to provide simple linguistic means to support legacy conversion of serial code.

 

- - -

 \[cel1]1. Uses new-style syntax for reducers, which was not implemented at the time of the writing.  Pablo should check.

2. Assumes common subexpression elimination of hyperobject lookup, which was not implemented as of the time of the writing.