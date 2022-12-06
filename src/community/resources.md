---
layout: layouts/page.njk
sidebar: toc
title: Resources
draft: true
eleventyNavigation:
  key: Resources
  parent: Community
  order: 99
---

**The goal of this draft page** is to encourage the core OpenCilk team to start contibuting content to this site. As we curate our collection of content (on the [website repository](https://github.com/OpenCilk/www.opencilk.org/)) over the coming weeks/months/years, we can change and adapt how we present it on the generated pages of this website. For example, whenever we notice a interesting slice of content emerging behind the scenes, we can present it on the website with a blog post or a new page.

## Add to our list of resources

The content below comes from [`src/_data/resources.yaml`](https://github.com/OpenCilk/www.opencilk.org/blob/main/src/_data/resources.yaml). If you have any edits or additions to make to the list, please submit them as edits (pull requests) there. Thank you!

## Community resource list

{% for entry in resources %}
 - [{{ entry.name }}]({{ entry.url }}) {%if entry.tags %} {% for tag in entry.tags | filterTagList %} {% set tagUrl %}/tags/{{ tag | slug }}/{% endset %} <a href="#" class="post-tag">{{ tag }}</a> {% endfor %} {% endif %} {% if entry.description %}: {{ entry.description }} {% endif %}
{% endfor %}