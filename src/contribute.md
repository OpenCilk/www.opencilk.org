---
layout: layouts/home.njk
sidebar: toc
title: Contribute to OpenCilk
eleventyNavigation:
  key: Contribute
  parent: Home
  order: 6
---

The OpenCilk project welcomes your expertise and enthusiasm.

## Writing code
In addition to developing the OpenCilk codebase, we need your help extending existing code libraries to run in parallel with OpenCilk. Notable opportunities include x and y.

## Writing blog posts and other documentation
Are you doing something with performance engineering that you want people to hear about? Are you writing how-tos or tutorials to help students with OpenCilk? We would love to hear! Have you prepared a presentation, video, or other educational material about OpenCilk? Let us know! If you’re unsure where to start or how your skills fit in, reach out! 

## Add to our list of resources
See `resources.yaml`:
{% for entry in resources %}
 - [{{ entry.name }}]({{ entry.url }}) {%if entry.tags %} {% for tag in entry.tags | filterTagList %} {% set tagUrl %}/tags/{{ tag | slug }}/{% endset %} <a href="{{ tagUrl | url }}" class="post-tag">{{ tag }}</a> {% endfor %} {% endif %} {% if entry.description %}: {{ entry.description }} {% endif %}
{% endfor %}

Contact us on the [mailing list (TBD)](#) or with [GitHub Issues](https://github.com/OpenCilk/opencilk-project/issues).

