---
title: Webdev
---

## Web development

Files in the `/src/webdev/` folder will be ignored in production and compiled only in development environments.
You can set your environment as development with the file `/.env`:

```bash
ELEVENTY_ENV=development
```

You can also put `draft: true` into the front matter of any article in `/src/doc/`, and it will be ignored in production and compiled only in development environments. 

The alternative color scheme seen here indicates that the page is `draft` and does not appear in production environments.
