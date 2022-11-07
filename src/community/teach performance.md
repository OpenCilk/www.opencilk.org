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

At MIT, _Performance Engineering of Software Systems_ is an upper-division undergraduate course with prereqs of introductory computer architecture, algorithms, and programming courses. Other faculty have adapted this material as an introductory graduate course. The class uses the C language with OpenCilk task-parallel extensions. Materials from Fall 2018 are available on [MIT Open CourseWare](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/), which includes 23 lectures (listed below), [10 homeworks](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/assignments), [4 projects](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/projects), [4 quizzes](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/quizzes), and [practice problems](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/recitation-problems) from selected recitations.

#### Lectures

1. Introduction & Matrix Multiplication ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec1/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-1-intro-and-matrix-multiplication/))
1. Bentley Rules for Optimizing Work ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec2/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-2-bentley-rules-for-optimizing-work/))
1. Bit Hacks ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec3/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-3-bit-hacks/))
1. Assembly Language and Computer Architecture ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec4/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-4-assembly-language-computer-architecture/))
1. C to Assembly ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec5/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-5-c-to-assembly/))
1. Multicore Programming ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec6/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-6-multicore-programming/))
1. Races and Parallelism ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec7/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-7-races-and-parallelism/))
1. Analysis of Multithreaded Algorithms ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec8/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-8-analysis-of-multithreaded-algorithms/))
1. What Compilers Can and Cannot Do ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec9/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-9-what-compilers-can-and-cannot-do/))
1. Measurement and Timing ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec10/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-10-measurement-and-timing/))
1. Storage Allocation ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec11/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-11-storage-allocation/))
1. Parallel Storage Allocation ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec12/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-12-parallel-storage-allocation/))
1. The Cilk Runtime System ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec13/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-13-the-cilk-runtime-system/))
1. Caching and Cache-Efficient Algorithms ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec14/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-14-caching-and-cache-efficient-algorithms/))
1. Cache-Oblivious Algorithms ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec15/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-15-cache-oblivious-algorithms/))
1. Nondeterministic Parallel Programming ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec16/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-16-nondeterministic-parallel-programming/))
1. Synchronization Without Locks ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec17/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-17-synchronization-without-locks/))
1. Domain Specific Languages and Autotuning ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec18/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-18-domain-specific-languages-and-autotuning/))
1. Leiserchess Codewalk ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec19/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-19-leiserchess-codewalk/))
1. Speculative Parallelism & Leiserchess ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec20/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-20-speculative-parallelism-leiserchess/))
1. Tuning a TSP Algorithm ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec21/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-21-tuning-a-tsp-algorithm/))
1. Graph Optimization ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec22/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-22-graph-optimization/))
1. High Performance in Dynamic Languages ([PDF](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/mit6_172f18_lec23/), [video](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/resources/lecture-23-high-performance-in-dynamic-languages/))

MIT's course has a significant homework/project component. Enabling students to achieve high performance on project submissions is a significant goal of the course. MIT typically uses servers from commercial cloud providers (historically AWS) to accept project submissions and measure performance.
Recent projects have included rotating an image, parallelization of a physical simulation, and memory management. The traditional MIT capstone project is a bot that plays one side of a 2-player game, where optimized bot performance is a necessity for a competitive submission.

Join the OpenCilk community for access to
- PowerPoint source for slides
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

