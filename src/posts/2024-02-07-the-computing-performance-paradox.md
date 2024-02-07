---
layout: layouts/post.njk
title: The Computing-Performance Paradox
tagline: Why should we care about how fast our software runs?
author: Charles E. Leiserson
date: 2024-02-07T18:46:37.291Z
attribution: false
---
Why should we care about how fast our software runs? Many other system properties — security, functionality, maintainability, usability, etc. — are arguably more important than performance. Then why do we value performance (or for performance skeptics, should we value performance)? Perhaps the answer lies at the origin of economics in the 18th century, long before computers were invented.

Welcome to the Fastcode blog. Fastcode is a website focused on ***software performance engineering***: making
code run fast or otherwise use few resources, such as energy, storage,
network bandwidth, etc. My name is Charles Leiserson, and I’ve been a
professor of computer science and engineering at MIT for 42 years. You
can find more about me at my website <http://people.csail.mit.edu/cel>.
For this kickoff blog post, I’d like to share with you a paradox about
computing performance that confused me until about 15 years ago.

It all started when my colleague Saman Amarasinghe and I introduced a
new class at MIT aiming to teach students how to make code run fast. At
the time, many of my colleagues at MIT and elsewhere expressed
skepticism that fast code was an important academic topic. One said
(paraphrasing), “I never waste time worrying about the performance of
the code I write. Computers are fast. Software functionality and
programmer time are much more important. We need to teach programmer
productivity, not software performance.” Yet I felt in my gut that
educating students in software performance engineering would be
important for their careers, at least in the long run. If performance is
so cheap, I asked myself, why do I feel it’s so valuable? It’s a
paradox.

Indeed, Saman and I now use this paradox to introduce students to our
junior/senior-level class on software performance engineering. For over
fifteen years, I have started my first lecture of class the same way. I
tell the approximately 180 students in the lecture hall that we will be
studying how to develop fast code. Then I ask them, “What software
properties are more important than performance?” After a little
prompting, they volunteer a variety of answers: correctness,
functionality, usability, security, debuggability, maintainability,
modularity, reliability, compatibility, etc.

When our list is well populated, I ask the students, “If programmers are
willing to sacrifice performance for these properties, why study
performance? It sounds as if lots of other topics are more
consequential. In other words, why bother taking this class?” I invite
them to leave and take one of the many other computer-science classes at
MIT that will teach obviously far more important topics. (I have never
seen any students leave.)

A bit later in the lecture, I invite a student volunteer to the lecture
podium to play a game called *Which Do You Choose?* I tell them[1] that
I will exhibit two objects, and they can pick either one to take back to
their seat. That’s it. They see the two objects, and they choose one.

After confirming that the student understands the rules, I show them the
first object: a 16.9-ounce bottle of water.[2] Then I reveal the second
object: a $10 bill. I ask them which they want to take back to their
seat. Every year, the student says the same thing: “I’ll take the ten
dollars.”

I then point out that water is essential to life, but they can live
without $10. Why pick the money, which clearly is less valuable?
Invariably, they say, “I can buy a bottle of water for less than $1 and
have at least $9 left over to do whatever I want with.” Indeed, the
local supermarket this week is offering 24 16.9-ounce bottles of water
for just $4.99, less than 21 cents per bottle.

The famed economist Adam Smith in his opus *An Inquiry into the Nature
and Causes of the Wealth of Nations* (1776) posed a similar question
(water versus diamonds), noting that there are two notions of value,
what he calls “use-value” (utility) and “exchange-value” (price):

> “Nothing is more useful than water: but it will purchase scarcely
> anything; scarcely anything can be had in exchange for it. A diamond,
> on the contrary, has scarcely any use-value; but a very great quantity
> of other goods may frequently be had in exchange for it.”

Consequently, a diamond costs more than water, and people prefer $10 to
a bottle of water because they can buy a bottle of water for less than
$1 and have at least $9 left over for other things. Smith’s observations
have evolved into the modern economic theory of supply and demand. For
example, there are contexts where one might value a 16.9-ounce bottle of
water more than $10. In the middle of a desert, a thirst-stricken person
might eagerly give up more than $10, or even a diamond, in exchange for
a bottle of water, because water is more scarce.

I contend that computing performance is like currency: We want
performance because we can use it to buy software properties we value
more. It’s the same kind of paradox. Just as we trade money for things
we value more—housing, food, clothing, transportation, education,
entertainment, etc.—we trade performance for things we value
more—correctness, usability, security, reliability, portability,
responsiveness, etc. Just as currency is a universal platform for
trading goods and services, performance is a universal platform for
trading properties of software. And just as most of us would like a bit
more money than we currently have, all things being equal, most of us
would like more performance out of our computer systems so as to better
afford the software properties we truly want.

As an example of this trade-off, Apple Computer famously changed the
history of technology in 1984 by trading an unprecedentedly large
fraction of the Macintosh computer’s performance in exchange for a more
intuitive user interface. As another example, Python has risen to the
top of IEEE *Spectrum*’s list of top programming languages even though
it tends to produce slower code than C or C++ because many people value
developer time over execution time. They trade application performance
for ease of development.

In the next few blog posts, I’ll overview the history of computing
performance, including the important role of Moore’s Law, which has
essentially doubled the computing capability of a silicon chip every two
years for over 55 years. (Imagine if your inflation-adjusted salary
consistently doubled every two years for your entire professional life.
How would that affect your approach to household costs and budgeting?)
I’ll argue that the recent demise of Moore’s Law has elevated the
importance of software performance engineering as a primary means for
obtaining application performance. I’ll demonstrate the dramatic gains
possible from performance engineering, which will touch on techniques
such as vectorization, caching, and parallel programming. I will aim to
convince you that performance engineering is a basic skill that every
undergraduate in computer science should know.

Unfortunately, there’s a catch. Just because performance engineering is
a basic skill doesn’t make it easy. Today’s systems and productivity
tools make it hardboth to do and to teachand that’s where this website
comes in. We created Fastcode.org to be a free resource for software
performance engineering. Whether you are a practicing engineer, a
professor, or a student, you will find resources here to learn about
software performance. In particular, the Fastcode website features
OpenCilk, an integrated open-source ecosystem for performance
engineering that is based on a state-of-the-art task-parallel platform
that is easy to use, extend, and incorporate into your own research.
There are other systems you can use for doing and teaching performance
engineering, and we will write about them here as well, but we invite
you to try OpenCilk. Its simple language, small codebase, and
mathematically provable guarantees of performance set it apart from
other platforms.


[1] Whenever possible, I will try to use gender-neutral terminology out
of respect for the diversity of humans, which I cherish.

[2] Personally, I tend to minimize my use of single-use plastic
containers, but for this demonstration for almost 200 students, I
compromised my morals.