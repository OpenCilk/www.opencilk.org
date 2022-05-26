---
layout: layouts/page.njk
background: bg-white
sidebar: toc
title: About us
eleventyNavigation:
  key: About us
  parent: Home
  order: 6
---

**Our mission:** OpenCilk aims to make it easy for developers to write fast and correct multicore code, for researchers to pioneer technologies to do so, and for educators to teach and students to learn software performance engineering.

## Leadership

<div class="list-tight">

- [Tao B. Schardl](http://neboat.mit.edu/), Director, Chief Architect
- [I-Ting Angelina Lee](http://www.cse.wustl.edu/~angelee/), Director, Runtime Architect
- John Carr, consultant, Senior Programmer
- Dorothy Curtis, MIT, Project Manager
- Bruce Hoppe, consultant, Documentation and Outreach Coordinator
- [Charles E. Leiserson](https://people.csail.mit.edu/cel/), MIT, Executive Director
</div>

## Contributors

<div class="list-tight">

- [Alexandros Iliopoulos](https://www.csail.mit.edu/person/alexandros-stavros-iliopoulos), postdoc, MIT
- [Timothy Kaler](https://www.csail.mit.edu/person/timothy-kaler), postdoc, MIT
- Matthew Kilgore, Ph.D. student, MIT
- Billy Moses, Ph.D. student, MIT
- Kyle Singer, Ph.D. student, WUSTL
- Daniele Vettorel, Ph.D. student, MIT→Google
- Grace Yin, M.Eng. student, MIT→MIT
</div>

## Academic board
<div class="list-tight">
{% for person in academic_board %}
 - [{{ person.name }}]({{ person.url }}), {{ person.organization }}
{% endfor %}
</div>

## Advisory board
<div class="list-tight">
{% for person in advisory_board %}
 - [{{ person.name }}]({{ person.url }}), {{ person.organization }}
{% endfor %}
</div>

## Acknowledgments

This material is based on work supported by the National Science Foundation under Grant No. 1925609. Any opinions, findings, and conclusions or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the National Science Foundation.
