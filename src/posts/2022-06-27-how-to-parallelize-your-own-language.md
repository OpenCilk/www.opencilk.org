---
title: How to parallelize your own language using OpenCilk components
excerpt: Angelina Lee and TB Schardl presented the following tutorial at the PACT 2021 tutorial session.
date: 2021-09-27
author: Bruce Hoppe
thumbnail: /img/random-work-steal.png
tags:
 - conference
 - tutorial
---

## Abstract

OpenCilk (http://opencilk.org) is a new open-source platform to support task-parallel programming in C/C++, aimed primarily at researchers and teachers of parallel computing. OpenCilk provides a full-featured implementation of Cilk, including a compiler based on the award-winning Tapir/LLVM and a streamlined runtime system based on Cheetah, as well as integrated tools, including the Cilksan race detector and the Cilkscale scalability analyzer. OpenCilk features a componentized design that makes it easy for compiler writers to add parallelism to their own languages, experiment with new runtime systems, and create custom dynamic-analysis tools for parallel productivity.

The first half of the tutorial overviews the OpenCilk project. It provides details about the OpenCilk architecture, specifically its componentized design that allows individual components to be repurposed by researchers and developers. The second half of the tutorial is a hands-on session. Participants use OpenCilk components to add parallelism to Kaleidoscope, a toy language that the LLVM project uses to introduce people to LLVM. They debug and analyze their addition using OpenCilk productivity tools.

## Slides

[![](/img/opencilk-pact-2021.png)](/img/opencilk-pact-2021.pdf)

## Video

 <video width="640" height="480" controls>
  <source src="https://people.csail.mit.edu/dcurtis/cilk/pact21/zoom_1.mp4" type="video/mp4">
Your browser does not support the video tag.
</video> 