# README

This is the GitHub repository for OpenCilk's new in-development website.
Right now the site is hosted [here](https://inspiring-feynman-7b1a58.netlify.app/).
We will deploy the site to [opencilk.org](https://opencilk.org/) soon.

If you want to install OpenCilk, see [github.com/OpenCilk/infrastructure](https://github.com/OpenCilk/infrastructure).

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.

## Making Simple Changes

To suggest a change to the website, you can simply navigate to the page with the content you think should be changed, and edit it.
You will be prompted to fork the repo (if you haven't already) and then open a Pull Request.
Once your Pull Request is merged, you should see your changes show up on the website in a few minutes or less.

Build previews for each Pull Request will be linked in the comment section of the PR once the site has been successfully build.

## Making More Complex Changes

To suggest a change to the website that is more significant, it is suggested that you make said changes and test them locally on your device.
You can do this by simply forking the base repo, cloning it locally onto your device, making the changes you want, and then following the "Installing locally" instructions below.

Once you have validated that everything looks good, you can open a Pull Request and check the Deploy Preview from Netlify as a final sanity check.

Build previews for each Pull Request are available at: https://julialang.netlify.app (note that given the GitHub Actions design, build previews are only available for those who have write access to the repo).

## Deploying locally

Clone the repository and `cd` to it. With Node.js installed, execute the following to install dependences.

```bash
> npm install

> npm run build
```
Then to launch the website, execute the following:
```bash
npm run start
```

Navigate to `localhost:8080` (or sometimes `localhost:8081`) in a browser and you should your local instance of the site.

All the content used to generate the site is in the `src/` folder.

**Adding images**: add the relevant files to `src/img/`.

**Modifying CSS**: modify the relevant files in `src/css/`.

**Modifying the HTML structure**: if you want to modify the navbar or the sidebar, go to `src/_includes/` and modify the relevant template fragment.

## Adding documentation or a blog post

Follow the blueprint of the other files in terms of folder and file structure.
Each file of documentation is categorized uniquely by the `src/doc` folder that contains it: 

- `src/doc/users_guide`: how-to's on **doing tasks with OpenCilk**
- `src/doc/tutorials`: introductions for **learning about OpenCilk**
- `src/doc/reference`: information about **OpenCilk technical specifications**.

There is a separate folder for blog posts:

- `src/posts/`: explanations for **understanding OpenCilk** as a tool for performance engineering.

(Probably we will create subfolders for years, and perhaps for months.)

