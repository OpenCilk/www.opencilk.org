---
layout: layouts/page.njk
stylesheet: None
background: bg-white
sidebar: toc
title: About software performance engineering (SPE)
eleventyNavigation:
  key: About SPE
  parent: About
  order: 1
---
{% alert "note", "Software performance engineering (SPE):" %}
Making software run fast or otherwise consume few resources such as time, storage, energy, network bandwidth, etc.
{% endalert %}

## A field whose time has come (again)

In the mid-20th century, when "computer" took its modern machine-based meaning, software performance engineering was a big deal. For example, the Apollo 11 missions used guidance computers with 4KB of RAM and 32KB hard disks. Getting astronauts to the moon and back under those constraints required serious brilliance from the engineers at NASA.

Then, Moore's Law kicked in. "The number of transitiors per integrated circuit shall double every two years." For over five decades, software developers enjoyed "free" performance gains thanks to this windfall.

But no more!

Since 2018 or so, developers have had to work for performance gains, which no longer come for free from the chip-makers. Of all the ways to improve application performance -- e.g., hardware architecture, algorithms -- software performance engineering is by far the least inexpensive and most accessible.

## Embracing all of performance engineering

**Parallel programming with OpenCilk:** To cope with the end of Moore's Law, application developers must embrace performance engineering and all its constituent technologies: parallel programming, vectorization, caching, algorithms, compiler optimization, etc. The OpenCilk task-parallel platform greatly simplifies parallel programming, arguably the most difficult of these technologies and the one with the greatest potential. 

**All of performance engineering with Fastcode:** But without a more general knowledge of performance engineering, programmers cannot effectively exploit the full capabilities of modern multicore computers. Fastcode aims to help researchers to advance our understanding of performance engineering and parallel programming, providing the next generation of researchers and software developers with principled and scientific foundations for obtaining application performance in the post-Moore era.

## Notable techniques of SPE
- parallelism
- vectorization
- caching
- algorithms
- data structuring
- compiler optimization
- and more.  

## Notable tools of SPE
- high-resolution timers
- performance profilers
- memory analyzers
- scalability analyzers
- race detectors
- and more.

## Theoretical foundations of SPE
- task-parallel scheduling
- work/span analysis
- reuse distance
- cache-oblivious algorithms
- data structures
- and more.

