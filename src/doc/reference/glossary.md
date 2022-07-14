---
title: Glossary
eleventyNavigation:
  key: Glossary
  parent: Reference
date: 2022-07-14T21:12:31.424Z
---

{% for entry in collections.glossary %}
## {{ entry.data.title }}
{% if entry.data.defn %}
<p> {{ entry.data.defn | markdownify | safe }}</p>
{% endif %}
{% endfor %}
