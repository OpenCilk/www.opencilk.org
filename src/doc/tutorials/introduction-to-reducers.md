---
layout: layouts/page.njk
title: Introduction to Reducers
tagline: This tutorial features motivating examples of code that use reducers to
  prevent races.
author: Bruce Hoppe
date: 2022-08-18T21:21:09.980Z
attribution: true
---
The following reducer tutorial is intended to suggest how we might complement the reducer reference documentation with a basic introduction that features motivating examples of code using reducers. This tutorial would probably also interface with the blog post in development about races. 

***From Cilk Plus Programmer's Guide*** 
https://github.com/OpenCilk/documentation/tree/33afa32c9b272ea20acc9cd6f10911470290919a/source_documents/Intel_Cilk%2B%2B_Programmers_Guide

## Using reducers &mdash; a simple example

A common need for reducers appears when trying to accumulate a sum in parallel. Consider the
following serial program that repeatedly calls a `compute()` function and accumulates the
answers into the `total` variable.

```cpp
#include <iostream>
unsigned int compute(unsigned int i)
{
  return i; // return a value computed from i
}

int main(int argc, char* argv[])
{
  unsigned int n = 1000000;
  unsigned int total = 0;

  // Compute the sum of integers 1..n
  for(unsigned int i = 1; i <= n; ++i)
  {
    total += compute(i);
  }

  // the sum of the first n integers should be n * (n+1) / 2
  unsigned int correct = (n * (n+1)) / 2;

  if (total == correct)
        std::cout << "Total (" << total
                  << ") is correct" << std::endl;
  else
        std::cout << "Total (" << total
                  << ") is WRONG, should be "
                  << correct << std::endl;
  return 0;
}
```

Converting this to a Cilk program and changing the `for` to a `cilk_for` causes the loop to
run in parallel, but creates a data race on the total variable. To resolve the race,
we simply make `total` a reducer. 

```cpp
#include <cilk.h>
#include <reducer_opadd.h>
#include <iostream>
unsigned int compute(unsigned int i)
{
  return i; // return a value computed from i
}

int cilk_main(int argc, char* argv[])
{
  unsigned int n = 1000000;
  cilk::reducer_opadd<unsigned int> total;

  // Compute the sum of integers 1..n
  cilk_for(unsigned int i = 1; i <= n; ++i)
  {
    total += compute(i);
  }

  // the sum of the first n integers should be n * (n+1) / 2
  unsigned int correct = (n * (n+1)) / 2;

  if (total.get_value() == correct)
        std::cout << "Total (" << total.get_value()
                  << ") is correct" << std::endl;
  else
        std::cout << "Total (" << total.get_value()
                  << ") is WRONG, should be "
                  << correct << std::endl;
  return 0;
}
```

The changes in the serial code show how to use a reducer provided by the Intel® Cilk++ SDK:
Include the appropriate reducer header file.

- Declare the reduction variable as a `reducer_kind`<TYPE> rather than a TYPE.
- Introduce parallelism, in this case by changing the `for` loop to a `cilk_for` loop.
- Retrieve the reducer's terminal value with the `get_value()` method after the `cilk_for` loop is complete.

## How reducers work

***This section of the Cilk Plus programmer's guide is quite redundant with our new reference documentation,
but it might be worth integrating.***

In this section, we discuss in more detail the mechanisms and semantics of reducers. This
information should help the more advanced programmer understand more precisely what rules
govern the use of reducers as well as provide the background needed to write custom reducers.
In the simplest form, a reducer is an object that has a value, an identity, and a reduction function.
The reducers provided in the reducer library provide additional interfaces to help ensure that the
reducers are used in a safe and consistent fashion.
In this discussion, we refer to the object created when the reducer is declared as the "leftmost"
instance of the reducer.
In the following sections, we present a simple example and discuss the run-time behavior of the
system as this program runs.
First, consider the two possible executions of a cilk_spawn, with and without a steal. The
behavior of a reducer is very simple:
- If no steal occurs, the reducer behaves like a normal variable.
- If a steal occurs, the continuation receives a view with an identity value, and the child
receives the reducer as it was prior to the spawn. At the corresponding sync, the value in the
continuation is merged into the reducer held by the child using the reduce operation, the new
view is destroyed, and the original (updated) object survives.
The following diagrams illustrate this behavior:

### No steal

If there is no steal after the cilk_spawn indicated by (A):

{% img "/img/reducer-no-steal.png" %}

In this case, a reducer object visible in strand (1) can be directly updated by strand (3) and (4).
There is no steal, thus no new view is created and no reduce operation is called.

### Steal

If strand (2), the continuation of the cilk_spawn at (A), is stolen:

{% img "/img/reducer-steal.png" %}

In this case, a reducer object in strand (1) is visible in strand (3), the child. Strand (2), the
continuation, receives a new view with an identity value. At the sync (B), the new reducer view is
reduced into the original view visible to strand (3).

### Example: Using reducer_opadd<>

Here is a simplified program that uses reducer_opadd<> to accumulate a sum of integers in
parallel. For addition, the identity value is -, and the reduction function adds the right value into
the left value:

```cpp
reducer_opadd<int> sum;

void addsum()
{
  sum += 1;
}
int cilk_main()
{
  sum += 1;
  cilk_spawn addsum();
  sum += 1;
  // the value of sum here depends on whether a steal occured
  cilk_sync;
  return sum.get_value();
}
```

### If no steal occurs...

First consider the serial case when the execution occurs on a single processor, and there is no
steal. In this case, there is no private view of sum created, so all operations are performed on
the leftmost instance. Because no new views are created, the reduction operation is never
called. The value of sum will increase monotonically from 0 to its final value of 3.

In this case, because there was no steal, the cilk_sync statement is treated as a no-op.

### If a steal occurs...

If a steal occurs, then, when sum is accessed at line 12, a new view with an identity value (0) is
created. In this case, the value of sum after line 12 executes will be 1. Note that the parent gets
the new (identity) view and child gets the view that was active at the time of the spawn. This
allows reducers to maintain deterministic results for reduce operations that are associative but
not cummutative. The child (addsum) operates on the leftmost instance, and so sum increases
from 1 to 2 at line 5.

When the cilk_sync statement is encountered, if the strands joining together have different
views of sum, those views will be merged using the reduction operation. In this case, reduction is
an addition, so the new view in the parent (value 1) is added into the view held by the child
(value 2) resulting in the leftmost instance receiving the value 3. After the reduction, the new
view is destroyed.

### Lazy semantics

It is conceptually correct to understand that each strand has a private view of the reducer. For
performance purposes, these views are created lazily—that is, only when two conditions are
met.
- First, a new view will only be created after a steal.
- Second, the new view is created when the reducer is first accessed in the new strand. At
that point, a new instance is created, holding an identify value as defined by the default
constructor for the type.

If a new view has been created, it is merged into the prior view at cilk_sync. If no view was
created, no reduction is necessary. (Logically, you can consider that an identity was created and
then merged, which would be a no-op.)

### Safe operations

It is possible to define a reducer by implementing only the identity and reduction functions.
However, it is typically both safer and more convenient to provide functions using operator
overloads in order to restrict the operations on reducers to those that make sense.
For example, reducer_opadd defines +=, -=, * ++, --, +, and - operators. Operations such as
multiply (*) and divide (/) will not provide deterministic and consistent semantics, and are thus not
provided in the reducer_opadd definition.

## Safety and performance cautions

In general, reducers provide a powerful way to define global variables that do not require locks
and that provide results across parallel runs that are repeatable and exactly the same as the
results of a serial execution.
However, there are some cautions to be aware of.

### Safety

To get strictly deterministic results, all operations (update and merge) that modify the value of a
reducer must be associative.
The reducers defined in the reducer library provide operators that are associative. In general, if
you only use these operators to access the reducer, you will get deterministic, serial semantics.
It is possible to use reducers with operations that are not associative, either by writing your own
reducer with non-associative operations, or by accessing and updating the underlying value of
any reducer with unsafe operations.

### Determinism

When reducers are instantiated with floating-point types, the operations are not strictly
associative. Specifically, the order of operations can generate different results when the
exponents of the values differ. This can lead to results that vary based on the order in which the
strands execute. For some programs, these differences are tolerable, but be aware that you may
not see exactly repeatable results between program runs.

### Performance

When used judiciously, reducers can incur little or no runtime performance cost. However, the
following situations may have significant overhead. Note that the overhead is also proportional to
the number of steals that occur.
If you create a large number of reducers (for example, an array or vector of reducers) you must
be aware that there is an overhead at steal and reduce that is proportional to the number of
reducers in the program.
If you define reducers with a large amount of state, note that it may be expensive to create
identity values when the reducers are referenced after a steal.
In addition, if the merge operation is expensive, remember that a merge occurs at every sync
that follows a successful steal.

## Using reducers &mdash; additional examples

### String reducer

`reducer_string` builds 8-bit character strings, and the example uses += (string concatenation)
as the update operation.
This example demonstrates how reducers work with the runtime to preserve serial semantics. In
a serial `for` loop, the reducer will concatenate each of the characters 'A' to 'Z', and then print out:

```c
The result string is: ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

The `cilk_for` loop will use a divide-and-conquer algorithm to break this into two halves, and
then break each half into two halves, until it gets down to a "reasonable" size chunk of work.
Therefore, the first worker might build the string "ABCDEF", the second might build "GHIJKLM",
the third might build "NOPQRS", and the fourth might build "TUVWXYZ". The runtime system
will always call the reducer's reduce method so that the final result is a string containing the
letters of the English alphabet in order.

String concatenation is associative (but not commutative), the order of operations is not
important. For instance, the following two expressions are equal:

- "ABCDEF" concat ("GHIJKLM" concat ("NOPQRS" concat "TUVWXYZ"))
- ("ABCDEF" concat "GHIJKLM") concat ("NOPQRS" concat "TUVWXYZ")

The result is always the same, regardless of how `cilk_for` creates the work chunks.

The call to `get_value()` performs the reduce operation and concatenates the substrings into a
single output string. Why do we use `get_value()` to fetch the string? It makes you think about
whether fetching the value at this time makes sense. You could fetch the value whenever you
want, but, in general, you should not. The result might be an unexpected intermediate value,
and, in any case, the intermediate value is meaningless. In this example, the result might be
"GHIJKLMNOPQRS", the concatenation of "GHIJKLM" and "NOPQRS".

While OpenCilk reducers provide serial semantics, the serial semantics are only guaranteed at the
end of the parallel calculation, such as at the end of a `cilk_for` loop, after the runtime system
has performed all the reduce operations. Never call `get_value()` within the `cilk_for` loop;
the value is unpredictable and meaningless since results from other loop iterations are being
combined (reduced) with the results in the calling iteration.

Unlike the previous example, which adds integers, the reduce operation is not commutative. You
could use similar code to append (or prepend) elements to a list using the reducer library's
reducer_list_append, as is shown in the example in the next section.

```cpp
#include <reducer_string.h>
int cilk_main()
{
  // ...

  cilk::reducer_string result;
  cilk_for (std::size_t i = 'A'; i < 'Z'+1; ++i) {
    result += (char)i;
  }

  std::cout << "The result string is: "
            << result.get_value() << std::endl;

  return 0;
}
```

In this and other examples, each loop iteration only updates the reducer once; however, you
could have several updates in each iteration. For example:

```cpp
cilk_for (std::size_t i = 'A'; i < 'Z'+1; ++i) {
  result += (char)i;
  result += tolower((char)i);
}
```

is valid and would produce the string:

```c
AaBb...Zz
```

### List reducer (with user-defined type)

content coming...

### Reducers in recursive functions

content coming...


***From Cilk Plus documentation.***
https://github.com/OpenCilk/documentation/tree/33afa32c9b272ea20acc9cd6f10911470290919a/source_documents/tutorial

<p>Attempting to modify a shared variable from multiple parallel threads simultaneously is called a <i>race.</i> The standard way to deal with races is to use locks or mutexes to serialize access to the variable. For example, consider the following code which generates a list of the letters 'a' to 'z':</p>

```c
void locked_list_test()
{
    mutex m;
    std::list<char>letters;

    // Build the list in parallel
    cilk_for(char ch = 'a'; ch <= 'z'; ch++)
    {
        simulated_work();

        m.lock();
        letters.push_back(ch);
        m.unlock();
    }

    // Show the resulting list
    std::cout << "Letters from locked list: ";
    for(std::list<char>::iterator i = letters.begin(); i != letters.end(); i++)
    {
        std::cout << " " << *i;
    }
    std::cout << std::endl;
}
```

<p>Since STL lists are not thread-safe, we must use a mutex to serialize access to the list "letters."</p>
<p>While the mutex guarantees that the access is thread-safe, it doesn't make any guarantees about ordering, so the resulting list will be jumbled and different on every run with more than 1 worker. Running the <tt>locked_list_test()</tt> routine will result in output something like:</p>

```c
Letters from locked list:  y g n d t a w x e z q j o h b u f v c k i r p l m s
```

<p>Here's the function rewritten using a <tt>reducer_list</tt>.  The code that has been modified was <strong><span style="background-color:#ffff00;">highlighted</span></strong>: (but the highlighting did not translate from Cilk Plus docs into this version here)</p>

```c
void reducer_list_test()
{
    cilk::reducer< cilk::op_list_append<char> > letters_reducer;

    // Build the list in parallel
    cilk_for(char ch = 'a'; ch <= 'z'; ch++)
    {
        simulated_work();
        letters_reducer->push_back(ch);
    }

    // Fetch the result of the reducer as a standard STL list
    const std::list <char> &letters = letters_reducer.get_value();

    // Show the resulting list
    std::cout << "Letters from reducer_list:";
    for(std::list <char>::const_iterator i = letters.begin(); i != letters.end(); i++)
    {
        std::cout << " " << *i;
    }
    std::cout << std::endl;
}
```

<p>Running the <tt>reducer_list_test()</tt> routine will result in the following output regardless of how many workers there are:</p>

```c
Letters from reducer_list: a b c d e f g h i j k l m n o p q r s t u v w x y z
```

<p>Click to download the  <a href="#">cilk-reducers-demo.cpp</a> sample code. (BEH: Not sure if this demo still exists.)</p>
<p>Cilk Plus reducers provide a number of useful properties:</p>
<ul><li>Each strand has a private <i>view</i> of the reducer, so we don't need to use mutexes to serialize access to the reducer. The views are combined by the Cilk runtime by calling the <code>reduce()</code> function of the reducer's <a href="tutorial-terms#monoid">monoid</a> when views sync.</li>
<li>The <code>reduce()</code> function is called so that the strands are combined in the order that would have occurred if the program were run with one worker.</li>
</ul><p>Unlike some other parallel frameworks, Intel Cilk Plus reducers are not limited to loops.  Here's a version of the Fibonacci number calculation that's been reworked to use reducers:</p>

```c
cilk::reducer< cilk::op_add<int> ><int> fib_sum(0);

void fib_with_reducer_internal(int n)
{
    if (n < 2)
    {
        *fib_sum += n;
    }
    else
    {
        cilk_spawn fib_with_reducer_internal(n-1);
        fib_with_reducer_internal(n-2);
        cilk_sync;
    }
}
```