---
title: Glossary
eleventyNavigation:
  key: Glossary
  parent: Reference
---

{% for entry in collections.glossary %}
## {{ entry.data.title }}
{% if entry.data.defn %}
<p> {{ entry.data.defn | markdownify | safe }}</p>
{% endif %}
{% endfor %}
