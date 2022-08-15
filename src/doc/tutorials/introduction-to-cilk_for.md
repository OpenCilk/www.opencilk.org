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
- 6.172 Lecture 8 https://canvas.mit.edu/courses/11151/files/1723140?module_item_id=444341

See also
- https://www.smcm.iqfr.csic.es/docs/intel/compiler_c/main_cls/index.htm#cref_cls/common/cilk_for.htm 
- https://cilk.mit.edu/programming/

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
{% img "/img/divide-conquer-cilk_for.png", "600" %}

## Loop parallelism and matrix transpose

Use 6.172 Lecture 8 https://canvas.mit.edu/courses/11151/files/1723140?module_item_id=444341