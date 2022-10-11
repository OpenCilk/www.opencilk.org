---
layout: layouts/page.njk
stylesheet: users-guide.css
background: bg-white
sidebar: toc
title: Community
eleventyNavigation:
  key: Community
  parent: Home
  order: 5
---

OpenCilk is a community-driven open source project developed by a diverse group of contributors. [Join us](/contribute)!

## Where can I get help?

### StackOverflow
The best way to get help is by posting on [StackOverflow](https://stackoverflow.com/) with the <a href="https://stackoverflow.com/questions/tagged/cilk"><code>#cilk</code></a> tag.

### GitHub Issues
To report bugs and most feature requests, use GitHub Issues in the appropriate repository: 

- [here](https://github.com/OpenCilk/opencilk-project/issues) for software
- [here](https://github.com/OpenCilk/www.opencilk.org/issues) for documentation.

### GitHub Discussions
To subscribe to announcements and have longer discussions,
use [GitHub Discussions](https://github.com/OpenCilk/opencilk-project/discussions) in the [OpenCilk Project](https://github.com/OpenCilk/opencilk-project) repository.

## Conferences
Below are the academic conferences traditionally most popular with the OpenCilk community. Many of them include tutorial days with sessions on OpenCilk.
{% for conf in  conferences %}
 - [{{ conf.shortName }}]({{ conf.url }})
{% endfor %}

See also: **[Contribute](/contribute)**.