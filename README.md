# README

This is the GitHub repository for OpenCilk's new in-development website.
Right now the site is hosted [here](https://sage-licorice-6da44d.netlify.app/).
We will deploy the site to [opencilk.org](https://opencilk.org/) soon.

If you want to install OpenCilk, see [github.com/OpenCilk/infrastructure](https://github.com/OpenCilk/infrastructure).

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.

## Making Simple Changes

To suggest a change to the website, you can simply navigate to the page with the content you think should be changed, and edit it.
You will be prompted to fork the repo (if you haven't already) and then open a Pull Request.
Once your Pull Request is merged, you should see your changes show up on the website in a few minutes.

## Adding documentation or a blog post

All the content used to generate the site is in the `src/` folder.

Follow the blueprint of the other files in terms of folder and file structure.
Each file of documentation is categorized uniquely by the `src/doc/` folder that contains it: 

- `src/doc/users-guide/`: how-to's on **doing tasks with OpenCilk**
- `src/doc/tutorials/`: introductions for **learning about OpenCilk**
- `src/doc/reference/`: information about **OpenCilk technical specifications**.

There is a separate folder for blog posts:

- `src/posts/`: explanations for **understanding OpenCilk** as a tool for performance engineering. (Probably we will create subfolders for years, and perhaps for months.)

All documentation and blog posts use this folder for images: `src/img/`.

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