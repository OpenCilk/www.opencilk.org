---
layout: layouts/post.njk
title: Who cares about software performance?
tagline: Software performance, like money, is useful for buying other more
  important system properties like usability and security. How can we teach
  students to be good stewards of such a resource?
author: Charles E. Leiserson
date: 2023-03-20T19:30:21.415Z
attribution: false
---

About 15 years ago, Saman Amarasinghe and I developed a new class at MIT that aims to teach students how to make code run fast. Our hands-on curriculum combines algorithms, software, and architecture, and we've taught it annually ever since.  Currently, about 140 MIT undergraduates (mostly juniors and seniors) take the class each fall to learn about software performance.

I tell students in the first lecture that we will be studying how to develop fast code.  Then I ask them, "What software properties are more important than performance?"  After a little prompting, they volunteer a variety of answers: 
correctness, 
functionality,
usability,
security,
debuggability,
maintainability,
modularity,
reliability,
compatibility, etc.

When our list is well populated, I ask the students, "If programmers are willing to sacrifice performance for these properties, why study performance? Why bother taking this class? Why not leave now and take one that will teach any of these many more important topics?'' (Not one student has ever left.)

## Price vs. value

Years ago, I thought long and hard about why I felt in my gut that software performance should be taught.  As with many difficult questions, I came to my own answer with the help of an analogy, which I'll pose as a question to you.  Which would you rather have right now: a gallon of water or $100?

{% img "/img/water-jug-and-hundred-dollars.png", "700px" %}

If you're like most of my students, you would snatch the $100.  Why?  After all, water is essential to life, and money is not.  But economics teaches us that the price of a commodity does not necessarily reflect the value people place on it.  The price is determined by supply and demand, not by any notion of intrinsic value.  Consequently, in modern society, people prefer $100 to a gallon of water because they can buy a gallon of water for $1 and have $99 left over for other things.

I contend that computing performance is like currency:  We want performance because we can use it to buy software properties we value more.  For example, in 1984, Apple famously changed the history of technology by devoting an unprecedentedly large fraction of the Macintosh computer's performance capacity to its user interface.  Apple traded performance for an intuitive user interface.  Python has risen to the top of IEEE *Spectrum*'s list of top programming languages, even though it tends to produce slower code than C or C++, because many people value low software-development time over the speed of their code.  They trade performance for fast development time.  

\[Performance is limited in supply. (say more)]

## After Moore's Law

In the next few blog posts, I'll overview the history of computing performance, including the important role of Moore's Law, the technological and economic trend that has enhanced computing power by almost a billion times since Gordon Moore, the founder of Intel, articulated it in 1965.

{% img "/img/moores-commandment.png", "400px" %}

Moore's Law has been a printing press for the currency of computing performance for decades.  I'll argue that the recent demise of Moore's Law has elevated the importance of software performance engineering as a primary means for obtaining application performance.  I'll demonstrate the dramatic gains possible from performance engineering, which will touch on techniques such as vectorization, caching, and parallel programming.  I will aim to convince you that performance engineering is a basic skill that every undergraduate in computer science should know.

Unfortunately, there's a catch. 
Just because performance engineering is a basic skill doesn't make it easy.
It's hard -- both to do and to teach -- and that's where OpenCilk comes in.
OpenCilk is an integrated open-source ecosystem that enables you to teach performance engineering using a state-of-the-art task-parallel platform that is easy to use, extend, and incorporate into your own research.
There are other systems you can use to teach performance engineering, 
and we will write about them here as well,
but we invite you to try OpenCilk.
Its simple language, small codebase, and mathematically provable guarantees of performance set it apart from other platforms.
We invite you to check out the OpenCilk community, which aims to make OpenCilk a premier open-source platform for next-generation parallel-computing research and an essential tool for teaching software performance engineering.