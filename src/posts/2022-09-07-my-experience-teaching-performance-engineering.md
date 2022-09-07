---
layout: layouts/post.njk
title: My experience teaching performance engineering
tagline: Lessons I learned creating a new course at my university
author: John Owens
date: 2022-09-07T20:08:01.475Z
attribution: false
---
In fall 2021, I taught a graduate course in performance engineering at UC Davis, based on MIT's 6.172. My course (EEC 289Q) had a number of structural differences from MIT's offering:

- MIT's course targeted undergraduates, while ours was an introductory graduate course with a significant fraction of undergraduates. (In the future, I hope my course will be offered at a "mezzanine" level for advanced undergraduates and beginning graduate students.) We had 12 ECE undergrads, 6 CS grad students, and 35 ECE grad students.
- MIT had recitation sections alongside lectures. We did not.
- MIT students have a uniform background; the instructors can count on particular prereqs. Our graduate students come from many universities and vary significantly in their backgrounds.
- Our students were mostly from my home department, electrical and computer engineering, and hence generally had a solid computer engineering background but less computer science.
- Our course had 53 students; I believe MIT's course is considerably larger.

Fortunately, this course material can be taught without an enormous amount of prereqs, or at least this was my experience when doing so. For instance, all MIT students taking this course have a solid theory background; this was certainly not true for my students, some of whom had quite modest theory backgrounds, but I feel that I was able to successfully communicate the theory required in the course. The essential prereq, in my opinion, was programming experience in C, but even some students lacked that experience and (with effort) were able to succeed.

I am thankful that my lecture style is fairly similar to Professor Leiserson's in terms of pace and the kind of material we put on our slides. Perhaps the most significant difference is that his strength in theory allows him to dive deep into theory details, whereas my more modest background forced me to try to acquire a more intuitive, less math-y theory understanding (which is how I presented it to my students).

The other important difference in my course was the length. UC Davis has a quarter system and MIT is on semesters, and beyond that, the MIT course appears to be 1.5x the number of units of a normal MIT semester course. Thus MIT students in 6.172 are doing more than 2x the work compared to my course offering.

## Course structure at UC Davis

MIT had more homeworks and more projects than UC Davis's offering. We had two homeworks:

- A "getting started" assignment:
    - "This assignment introduces the environment and tools you will be using to complete your future project assignments. It includes a quick C primer. You should use this assignment to familiarize yourself with the tools you will be using throughout the course."
- A Cilk tools assignment:
    - "In this homework, you will experiment with parallelizing in Cilk. You will learn how to use Cilksan to detect and solve determinacy races in your multithreaded code, and how to measure a program’s parallelism using the Cilkscale scalability analyzer."

and three projects:

- Rotating a large bitmapped image (we used MIT's assignment with virtually no changes):
    - "This project provides you with an opportunity to learn how to improve the performance of programs using the perf tool and to experiment with the abstraction of a computer word as a vector of bits on which bitwise arithmetic and logical operations can be performed."
- Parallel Graphical Screensaver with OpenCilk (also MIT's project with virtually no changes)
    - "Optimize a graphical screensaver program for multicore processors using the OpenCilk parallel programming platform."
- Find a valid route on a 2D grid with global and local constraints (requiring a parallel search)
    - This was solving the logic puzzle [Masyu](https://en.wikipedia.org/wiki/Masyu) (the students did not know this)
    - This was a completely new assignment, written by me

The MIT homeworks overall were written well, with copious detail, and while I would have enjoyed giving them all if we had had time in the quarter, we did not. I thus focused the homework on tools and Cilk preparation.

I personally have not yet written even a single line of Cilk, nor did I do any of the assignments except for writing the serial version of the third project. I simply did not have the time to do this work and thus sadly embody the adage of "those who can, do, and those who can't, teach".

MIT has a large capstone project ("Leiserchess") that I chose not to offer; I think it is simply too large for a quarter-length course. It certainly encapsulates many of the principles from the course, but it also is fairly chess-specific and benefits from the extensive knowledge on that particular topic from the MIT course staff (experience that I lack).

Projects are quite time-consuming to create and a library of projects available to instructors would ease a significant concern among potential instructors of this course. I chose a search-based project for the one I created because I wanted to replace the (largely) search-based Leiserchess project from 6.172. I would do well to better understand the wide range of Cilk application domains, however.

## Project Infrastructure

The course itself emphasizes challenges with getting reliable computer performance measurements. These are significant challenges, especially when a course offering does not fully control its own computing infrastructure. Thus MIT's offering of this course goes to considerable effort to configure AWS machines to give the most reliable measurements possible.

We adapted MIT's configuration of AWS for our own course. MIT TAs were quite helpful in getting the scripts running. However, it was a significant amount of time for us to maintain this infrastructure; we had one 10-hour-a-week TA who basically did nothing but keep the servers running, with the infrastructure often failing in a way that required manual TA intervention. The difficulty of setting up AWS infrastructure (and billing) and especially keeping the infrastructure running without intervention is a significant hurdle to exporting this class. Rock-solid scripts that can be easily ported to other universities would be highly desirable. Without more core infrastructure development, I anticipate that other faculty will face similar difficulties as we did (per-university ad hoc scripts written or modified by non-experts that require significant manual intervention).

We spent $155 per enrolled student on compute time, which is in line with my and MIT's expectations. My department funded this directly in fall 2021. We face a hurdle in finding long-term funding for this course, however.

## TA Allocation

We had two TAs:

- The 20-hours-a-week TA was largely responsible for grading and evaluation, which included a fair amount of TA-developed auto-grading infrastructure (students submitted code and the TA's code would automatically evaluate it for correctness and performance). It may be there is existing infrastructure for some of this (possibly open-source software?) but I am at this time unaware of such infrastructure. Some of what was developed can be reused in future years, although the projects will likely change. This TA also graded student writeups associated with student assignment submissions. In general this part of TA responsibilities will scale with the number of students (twice as many students means twice as much effort), although hopefully the auto-grading would not (it costs the same amount of time whether we have one or 100 students).
- The 10-hour-a-week TA spent all of his time with AWS: how to use it and how to keep it running. This part of TA responsibilities does not have to scale (it should take the same amount of effort no matter how many students we have).

MIT has regular recitations led by TAs as well as industry professionals reviewing code. I would have loved to have had either, but did not have the budget (or bandwidth) to do so.

## Lectures

MIT did not fully populate its (presumably) 30 lecture slots with regular lectures (instead using some guest speakers and code walkthroughs), so I was able to present most course material that was covered by the MIT course in the 20 lectures I had available. Those 20 lectures included:

- Introduction and Matrix-Matrix Multiply
- The Bentley Rules
- Bit Hacks
- Computer Architecture
- C2Assembly
- What Compilers Can and Cannot Do
- Multicore Programming
- Races and Parallelism
- Parallel Algorithms (2 lectures)
- Measurement and Timing
- Cheetah Cilk Runtime
- Storage Allocation
- Parallel Storage Allocation
- Cache Efficient Algorithms
- Cache-Oblivious Algorithms
- Nondeterministic Parallel Programming
- Synchronization without Locks
- Potpourri
- Speculative Parallelism

The only brand-new lecture from me was Potpourri, where I presented 5 vignettes:
- Brendan Gregg's Flame Graphs, with hopes students would feel comfortable writing their own simple visualization tools to make sense of perf data. https://www.brendangregg.com/FlameGraphs/cpuflamegraphs.html
- An ARM spinlock explained in great detail: https://blog.regehr.org/archives/2173
- Timsort, how it works, and what it targets (not "sort a random array" but instead real arrays that typically have some structure). https://bugs.python.org/file4451/timsort.txt , https://hackernoon.com/timsort-the-fastest-sorting-algorithm-youve-never-heard-of-36b28417f399 , https://medium.com/@rylanbauermeister/understanding-timsort-191c758a42f3
- Fast case conversion, a simple problem but one with good compute-vs.-space tradeoffs and good engineering https://github.com/apankrat/notes/tree/master/fast-case-conversion
- "How I Cut GTA Online Loading Times by 70%", a wonderful story of debugging and performance analysis with a lovely ending. https://nee.lv/2021/02/28/How-I-cut-GTA-Online-loading-times-by-70/

The MIT teaching staff (Charles Leiserson and Jonathan Ragan-Kelley) made both their lecture slides (PPT) and their lecture recordings available to me. I watched all lectures (at 150% speed, it was a slight shock post-class to have my first Zoom conversation with Professor Leiserson and find he spoke at a normal rate). I also converted all lecture slides to Keynote and made notes on what I changed/added; for me, converting slides is time well spent because I get a chance to go over every slide.

Having access to slides and recordings was absolutely critical for me to learn the (significant amount of) material I didn't know, and to begin with high-quality slides, freeing me from creating my own. I made detailed notes after each lecture on what went well, what didn't go well, what changes I made before the lecture, and what I'd change for the next time. Professor Leiserson and TB Schardl were generous with their time in answering my questions and receiving my feedback.

## The Future

First, I had an absolutely fantastic time learning and teaching this material. I felt like I was the conduit for delivering enormous value to students from the outstanding course material developed at MIT. Our students so often learn small and deep slices of technical material but do not get the breadth of interconnected material covered in this course and in particular its focus on performance, a sadly undertaught area. I am told by industry friends that they see so many candidates who can program in JavaScript and Python but simply don't have the background to dive into performance at the level needed at their companies.

I would like to survey industry colleagues to understand the technologies they would find useful. One lecture I would like to develop is vectorization, including the underlying hardware instruction sets; how they are accessed from C; and what compilers can and cannot do with respect to auto-vectorization.

I have communicated the following to the MIT course staff, which has been understanding: the course is rather MIT-focused, with much of the course material building from research done at MIT. This is of course Absolutely Appropriate for an MIT-taught course, but exporting 6.172 to other campuses allows a fresh perspective. The lecture on speculative parallelism was highly chess-focused and was the most difficult to give simply because I did not have the deep background required to give it; I would leave it out next time.

The course also has a strong focus on Cilk. First, this is absolutely appropriate for this course, and the dual theoretical and practical treatment of Cilk in the course was really a treat to learn and teach. That being said, Cilk is not a panacea for parallel computing, and moreover, due to its not-quite-mainstream status in modern toolchains, it may not even be available to all potential users. The course should not present Cilk as the culmination of parallel computing programming models/environments. A deeper dive into alternate models and programming environments for parallelism (e.g., modern-C++ std::thread) would strengthen this class. Parallel data structures (e.g., parallel STL) might also be a good topic.

Cilk builds on more than two decades of research and it was, more than once, a challenge to understand some of the underlying motivations for / principles of Cilk. I could find some of them in 20+ year old papers but there is no modern description of Cilk, its design goals and decisions, and principles anywhere. (It was a significant challenge to dig through the Cilk literature to get answers to some of my questions.) It would benefit from a from-scratch paper that explained it as if it were a new system.