---
title: Webdev
features:
- call: Write fast code
  call_description: Parallelize C/C++ with OpenCilk.
  call_color: var(--midnight)
  call_bg: var(--lime)
  button: Install
  button_link: /doc/users-guide/install/
  button_color: var(--yellow)
  button_bg: var(--blue)
  image_bg: var(--yellow)
  image: qsort-code-light.png
- call: Performance engineering
  call_description: What is it and why does it matter?
  call_color: var(--yellow)
  call_bg: var(--midnight)
  button: Learn
  button_link: /posts/
  button_color: var(--yellow)
  button_bg: var(--blue)
  image_bg: var(--midnight)
  image: plenty-of-room-at-the-top.png
- call: Teach performance
  call_description: OpenCilk provides an ideal introduction.
  call_color: var(--safetyyellow)
  call_bg: var(--darkteal)
  button: Discover
  button_link: /community/teach-performance/
  button_color: var(--midnight)
  button_bg: var(--yellow)
  image_bg: var(--teal)
  image: fib-code-multicore.png
- call: Go multicore
  call_description: Convert your code to OpenCilk
  call_color: var(--midnight)
  call_bg: var(--yellow)
  button: Here's how
  button_link: /doc/users-guide/convert-a-c-program/
  button_color: var(--yellow)
  button_bg: var(--blue)
  image_bg: var(--safetyyellow)
  image: fib-nocode-trace-dag.png

---

## Web development

Files in the `/src/webdev/` folder will be ignored in production and compiled only in development environments.
You can set your environment as development with the file `/.env`:

```bash
ELEVENTY_ENV=development
```

You can also put `draft: true` into the front matter of any article in `/src/doc/`, and it will be ignored in production and compiled only in development environments. 

The alternative color scheme seen here indicates that the page is `draft` and does not appear in production environments.

{% for item in features %} 
<div class="d-flex align-content-between flex-wrap">
    <div class="d-flex"><span class="myCard-header">{{ item.call }}</span></div>
    <div class="d-flex"><span class="myCard-lead">{{ item.call_description }}</span></div>
    <div class="d-flex"><a href="{{ item.button_link }}" class="btn px-4 me-md-2" style="text-decoration: none; color: {{ item.button_color }}; background-color: {{ item.button_bg }};">{{ item.button }}</a></div>
</div>
{% endfor %}
