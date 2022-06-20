---
title: Race conditions
excerpt: The lure of nonlocal
author: Charles Leiserson
tags:
  - race
date: 2021-11-03
---

In a widely applauded article published in 1973 and entitled, “Global variable considered
harmful,” Bill Wulf and Mary Shaw argued, “We claim that the non‐local variable is a
major contributing factor in programs which are difficult to understand.” Thirty‐five
years later, however, nonlocal variables are still very much in vogue in production code.
Moreover, as software developers look toward multicore‐enabling their legacy
codebases, nonlocal variables pose a significant obstacle to software reliability, because
they can cause race bugs.

## The lure of nonlocal variables

To begin with, what were Wulf and Shaw concerned about, and why are nonlocal
variables nevertheless so prevalent? To be clear, by nonlocal variable, I mean one
nonlocal that is declared outside of the scope in which it is used. A global variable is a
nonlocal variable declared in the outermost program scope.