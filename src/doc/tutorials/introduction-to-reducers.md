---
layout: layouts/page.njk
title: Introduction to Reducers
tagline: This tutorial features motivating examples of code that use reducers to
  prevent races.
author: Bruce Hoppe
date: 2022-08-18T21:21:09.980Z
attribution: true
---
The following reducer tutorial is intended to suggest how we might complement the reducer reference documentation with a basic introduction that features motivating examples of code using reducers. This tutorial would probably also interface with the blog post in development about races. This material comes from the Cilk Plus documentation.

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