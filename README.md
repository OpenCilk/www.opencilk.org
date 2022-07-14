# README

This is the GitHub repository for OpenCilk's new in-development website, https://opencilk.org.

If you want to install OpenCilk, see [github.com/OpenCilk/infrastructure](https://github.com/OpenCilk/infrastructure).

We welcome your contributions to this website. Please see [CONTRIBUTING.md](/CONTRIBUTING.md).

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites. All the content used to generate the site is in the `src/` folder. Published content apppears in the following folders:

- `src/doc/users-guide/`: how-to's on **doing tasks with OpenCilk**
- `src/doc/tutorials/`: introductions for **learning about OpenCilk**
- `src/doc/reference/`: information about **OpenCilk technical specifications**

And there is a separate folder for blog posts:

- `src/posts/`: explanations for **understanding OpenCilk** as a tool for performance engineering. (Probably we will create subfolders for years, and perhaps for months.)

All documentation and blog posts use this folder for images: `src/img/`.

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

![colors](/src/img/color-family.png)

```css
/* Color definitions in CSS */
:root {
  --lime: #91b301;              /* RGB: 145,179,0 -- link hover, headers */
  --tangelo: #f44500;           /* RGB: 244,69,0 */
  --teal: #11a5a1;              /* RGB: 17,165,161 */
  --sky: #0cb3e1;               /* RGB: 12,179,225 */
  --americanyellow: #f4b200;    /* RGB: 244,178,0 */
  --safetyyellow: #f4d400;      /* RGB: 244,212,0 */
  --blue: #043065;              /* RGB: 4,48,101 -- links, headers */
  --midnight: #001630;          /* RGB: 0,22,48 -- dark backgrounds */
  
}
```