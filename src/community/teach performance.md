---
title: Teach performance
sidebar: toc
eleventyNavigation:
  key: Teach performance
  parent: Community
---

The end of Moore's Law makes software performance engineering a priority for modern computer-science curricula.
OpenCilk enables you to teach principles of multicore computing using a state-of-the-art task-parallel platform that is easy to learn.

## List of classes and workshops

To help you develop your own course or module on performance engineering, we are compiling a list of relevant classes and workshops with materials that you can adapt. Do you have your own class or module to add to our list? Please [let us know](/contribute/contact/).
- [Performance engineering of software systems](#performance-engineering-of-software-systems)
- [Modern algorithms workshop: parallel algorithms](#modern-algorithms-workshop:-parallel-algorithms)

Each listing includes links to basic materials (e.g., PDF lecture slides). Additional materials (e.g., editable slide decks, and solutions for homeworks, quizzes, and tests) are often also available, as detailed below.

## Performance engineering of software systems

At MIT, _Performance Engineering of Software Systems_ is an upper-division undergraduate course with prereqs of introductory computer architecture, algorithms, and programming courses. Other faculty have adapted this material as an introductory graduate course. The class uses the C language with OpenCilk task-parallel extensions. [Recent _Performance Engineering of Software Systems_ offerings](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/), which provide free and open course material for adoption, have featured roughly 20 lectures on the following topics:

- Intro and Matrix Multiplication
- Bentley Rules
- Bit Hacks
- Architecture and Vectorization
- C to Assembly
- Compilers
- Multicore Programming
- Races and Parallelism
- Analysis of Parallel Algorithms
- Measurement and Timing
- Cilk Runtime System
- Caching and Cache Efficient Algorithms
- Cache Oblivious Algorithms
- Synchronization
- Speculative Parallelism

MIT's course has a significant homework/project component. Enabling students to achieve high performance on project submissions is a significant goal of the course. MIT typically uses servers from commercial cloud providers (historically AWS) to accept project submissions and measure performance.
Recent projects have included rotating an image, parallelization of a physical simulation, and memory management. The traditional MIT capstone project is a bot that plays one side of a 2-player game, where optimized bot performance is a necessity for a competitive submission.

Join the OpenCilk community for access to
- PowerPoint source for slides
- Video recordings of a past course offering's lectures
- LaTeX source for homework and projects from a past course offering
- Reference code for homeworks and projects
- A library of past quiz and exam questions

## Modern algorithms workshop: parallel algorithms

Originally created as a single full-day class, this workshop includes an introduction and 8 separate modules listed below.

- Cilk model
- Detecting nondeterminism
- What Is parallelism?
- Scheduling theory primer
- Analysis of parallel loops
- Case study: matrix multiplication
- Case study: Jaccard similarity
- Post-Moore software

Join the OpenCilk community for access to editable slide decks.

