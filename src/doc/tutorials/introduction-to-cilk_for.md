---
layout: layouts/page.njk
title: Introduction to cilk_for
tagline: The simplest way to write your first parallel program.
author: Bruce Hoppe
date: 2022-08-15T21:47:08.358Z
attribution: false
---
## Context

Below is a rough collection of content about `cilk_for` taken from
- https://www.intel.sg/content/dam/www/public/apac/xa/en/pdfs/ssg/Introduction_to_Intel_Cilk.pdf
- 6.172

## `cilk_for` loop
- Looks like a normal `for` loop of C/C++
```c
cilk_for (int x=0; x < 100000; ++x) { ... }
```
- Any or all iterations may execute in parallel with one another.
- All iterations complete before program continues.
- Constraints:
  * Limited to a single control variable.
  * Must be able to jump to the start of any iteration at random.
  * Iterations should be independent of one another.

## Implementation of `cilk_for`

OpenCilk uses divide and conquer.
![implementation of cilk_for](/img/implementation-of-cilk_for.png)

