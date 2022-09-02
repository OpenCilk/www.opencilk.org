---
title: CilkArts Glossary
stylesheet: glossary.css
eleventyNavigation:
  key: CilkArts Glossary
  parent: Reference
---

{% for entry in collections.cilkarts_glossary %}

## {{ entry.data.title }} 

{{ entry.templateContent | markdownify | safe }}

{% endfor %}


