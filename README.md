# README

This is the GitHub repository for OpenCilk's new in-development website, https://opencilk.org.

If you want to install OpenCilk, see [github.com/OpenCilk/infrastructure](https://github.com/OpenCilk/infrastructure).

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.

## Making simple changes

All the content used to generate the site is in the `src/` folder.

To suggest a change to the website, you can simply navigate to the page with the content you think should be changed, and edit it.
(Here are [instructions for editing on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).)
You will be prompted to fork the repo (if you haven't already) and then open a Pull Request.
Once your Pull Request is merged, you should see your changes show up on the website in a few minutes.

## Adding documentation or a blog post

To add a new blog post or page of documentation, the recommended approach is to use the [dashboard UI](https://www.opencilk.org/admin).
You will need to log in with your GitHub credentials.

OpenCilk.org uses [Netlify CMS](https://www.netlifycms.org) to manage our editorial workflow for documentation, including blog posts.
Netlify CMS provides a dashboard-like UI that lets you 

- Edit WYSIWYG-style, with rich text, as an alternative to markdown;
- Manage pre-publication with queues for "draft" content, "in-review" content, and "ready" content; and
- Manage images and similar files with a Media page.

Netlify CMS configures the necessary front matter for each piece of content (e.g., date, author, etc.)
and it it stores pre-publication content in GitHub branches. Published content apppears in the following folders:

- `src/doc/users-guide/`: how-to's on **doing tasks with OpenCilk**
- `src/doc/tutorials/`: introductions for **learning about OpenCilk**
- `src/doc/reference/`: information about **OpenCilk technical specifications**

There is a separate folder for blog posts:

- `src/posts/`: explanations for **understanding OpenCilk** as a tool for performance engineering. (Probably we will create subfolders for years, and perhaps for months.)

All documentation and blog posts use this folder for images: `src/img/`.

## Changing a landing page (e.g., Documentation, Community, Contribute)

Netlify CMS is not configured to manage the various landing pages on this site.
In order to edit those pages, please follow the "Making simple changes" instructions above. 

## Making More Complex Changes

To suggest a change to the website that is more significant, it is suggested that you make said changes and test them locally on your device.
You can do this by simply forking the base repo, cloning it locally onto your device, making the changes you want, and then following the "Installing locally" instructions below. Once you have validated that everything looks good, you can open a Pull Request.

## Installing locally

Clone the repository and `cd` to it. With Node.js installed, execute the following to install Node dependences and perform the first build.

```bash
> npm install

> npm run build
```
Then to launch the website, execute the following:
```bash
> npm run start
```

Navigate to `localhost:8080` (or sometimes `localhost:8081`) in a browser and you should see your local instance of the site.

## Colors

![colors](/img/color-family.png)
