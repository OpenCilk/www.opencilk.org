---
title: Glossary
stylesheet: glossary.css
attribution: true
eleventyNavigation:
  key: Glossary
  parent: Reference
---

{% for entry in collections.glossary %}

## {{ entry.data.title }} 

{{ entry.templateContent | markdownify | safe }}

{% endfor %}


