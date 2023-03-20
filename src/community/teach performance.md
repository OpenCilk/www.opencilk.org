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

To help you develop your own course or module on performance engineering, we are compiling a list of relevant classes and workshops with materials that you can adapt. Each listing includes links to basic materials (e.g., lecture PDFs). Additional materials (e.g., editable slide decks, and solutions for homeworks and quizzes) are often also available, as detailed below, when you [join the OpenCilk community](../join-us/). Do you have your own class or module to add to our list? Please [let us know](/contribute/contact/).

Click on the list below to jump ahead.
- Performance engineering of software systems
  * [MIT 6.106](#MIT-6-106)
  * [UC Davis EEC 289Q]
- [Modern algorithms workshop: parallel algorithms](#modern-algorithms-workshop:-parallel-algorithms)



## Performance engineering of software systems

### MIT 6.106

At MIT, _Performance Engineering of Software Systems_ is an upper-division undergraduate course with prerequisitess of introductory computer architecture, algorithms, and programming courses. Other faculty have adapted this material as an introductory graduate course. The class uses the C language with OpenCilk task-parallel extensions. Materials from Fall 2018 are available on [MIT Open CourseWare](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/), which includes 23 lectures (listed below), [10 homeworks](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/assignments), [4 projects](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/projects), [4 quizzes](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/quizzes), and [practice problems](https://ocw.mit.edu/courses/6-172-performance-engineering-of-software-systems-fall-2018/pages/recitation-problems) from selected recitations.

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

[Join the OpenCilk community](../join-us/) for access to
- PowerPoint source for slides
- LaTeX source for homework and projects from a past course offering
- Reference code for homeworks and projects
- A library of past quiz and exam questions

### UC Davis EEC 289Q

John Owens adapted the course at MIT to create _Performance Engineering of Software Systems_ at UC Davis.

1. Intro and Matrix Multiplication ([PDF](https://ucdavis.box.com/s/lqbbzplf7cjo1dnxi8hon2pkjigest7n))
2. Bentley Rules for Optimizing Work ([PDF](https://ucdavis.box.com/s/7asxi08fobekk6e1pkoo5r7zuyjrktrw))
3. Bit Hacks ([PDF](https://ucdavis.box.com/s/xd10fgi2aslmjiv67q9uajuvh0srfvo8))
4. Computer Architecture ([PDF](https://ucdavis.box.com/s/itjn1m2cu5czh4qhz5doin4bpbx0f515))
5. C to Assembly ([PDF](https://ucdavis.box.com/s/n6nvroi4gyk2j0lswcn35eqp81g95bny))
6. What Compilers Can and Cannot Do ([PDF](https://ucdavis.box.com/s/l9bq9sfkvl6oah88tpzio4hxsvqkmwp7))
7. Multicore Programming ([PDF](https://ucdavis.box.com/s/hmc5zjo8bnojke8svj5gedyxgveuzh6r))
8. Races and Parallelism ([PDF](https://ucdavis.box.com/s/h8z91f2t23qhpa976hbt4bnaf972avir))
9. Analysis of Parallel Algorithms I ([PDF](https://ucdavis.box.com/s/o45xbyoaenzvcww8o0eb4v2o3dg3e9as))
10. Analysis of Parallel Algorithms II ([PDF](https://ucdavis.box.com/s/etxfwg2l50gqxd40ydk0p8nnpxs9e6z4))
11. Measurement and Timing ([PDF](https://ucdavis.box.com/s/aplokuj304hzc2qmdbp4w9auo7kb8uct))
12. Cheetah -- Cilk Runtime ([PDF](https://ucdavis.box.com/s/6eb956s19hair2awfborukl1uk3rsvsz))
13. Storage Allocation ([PDF](https://ucdavis.box.com/s/eb05vbh9ldem2txtmvbm7ov5r1xpxowz))
14. Parallel Storage Allocation ([PDF](https://ucdavis.box.com/s/vbpz9zgc3qbbd34808wpjc88y77j9bo5))
15. Cache-Efficient Algorithms ([PDF](https://ucdavis.box.com/s/11ojllbna5yfdvscm386vg4ne1nr2w17))
16. Cache-Oblivious Algorithms ([PDF](https://ucdavis.box.com/s/2g6m7ztsj71w34j7m1u4x8dlm29h8x0e))
17. Nondeterministic Parallel Programming ([PDF](https://ucdavis.box.com/s/8abgpbd67b35d8i2a2piflav2crndszs))
18. Synchronization without Locks ([PDF](https://ucdavis.box.com/s/dohev283rm0p7iwtlclu849iigdhrrkj))
19. Potpourri ([PDF](https://ucdavis.box.com/s/a98i1k7c70jg3tw9wdw9kj7xsexbgifx))
20. Speculative Parallelism ([PDF](https://ucdavis.box.com/s/7px55i4u01kgem0xtq384aenmjm6u23y))

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

[Join the OpenCilk community](../join-us/) for access to editable slide decks.

