---
title: Intel Glossary
stylesheet: glossary.css
attribution: true
eleventyNavigation:
  key: Intel Glossary
  parent: Reference
---

{% for entry in collections.intel_glossary %}

## {{ entry.data.title }} 

{{ entry.templateContent | markdownify | safe }}

{% endfor %}


