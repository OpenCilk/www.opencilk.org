---
layout: layouts/page.njk
title: Community
sidebar: toc
eleventyNavigation:
  key: Community
  parent: Home
  order: 5
---

OpenCilk is a community-driven open source project developed by a diverse group of contributors. Please read the OpenCilk Code of Conduct for guidance on how to interact with others in a way that makes the community thrive.

## Where can I get help?

### StackOverflow
The best way to get help is by posting on [StackOverflow](https://stackoverflow.com/) with the <a href="https://stackoverflow.com/questions/tagged/cilk"><code>#cilk</code></a> tag.

### GitHub Issues
[This forum](https://github.com/OpenCilk/opencilk-project/issues) is for reporting software bugs, documentation issues, and most feature requests.

### Mailing list
[This list (TBD)](#) is for longer discussions, such as more involved feature requests. It is also where we post announcements about OpenCilk, like new releases and upcoming talks. 

## Conferences
Below are the academic conferences traditionally most popular with the OpenCilk community. Many of them include tutorial days with sessions on OpenCilk.
{% for conf in  conferences %}
 - [{{ conf.shortName }}]({{ conf.url }})
{% endfor %}



See also: **[Contribute](../contribute)**.

