---
title: Documentation
layout: layouts/page.njk
eleventyNavigation:
  key: Documentation
  parent: Home
  order: 4
---

To help you find the information you need, we have organized OpenCilk documention into three categories:

- A [user's guide](/doc/users-guide) that shows you how to do important tasks with OpenCilk,
- [Tutorials](/doc/tutorials) that help you learn the fundamentals of OpenCilk, and
- A [reference manual](/doc/reference) that describes the technical design of OpenCilk, both as a language (for application programming) and as an environment (for parallel systems research).

Finally, our [blog](/posts) puts the documentation in context with stories about the latest developments in performance engineering.

## User's guide

Featured entries go here.

{% set postslist = collections['users guide'] %}
{% include "posts_list_tagless.njk" %}

## Tutorials

Featured tutorials go here.

{% set postslist = collections['tutorial'] %}
{% include "posts_list_tagless.njk" %}

## Reference manual

Featured entries go here.

{% set postslist = collections['reference'] %}
{% include "posts_list_tagless.njk" %}