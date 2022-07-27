# Contribution guidelines for www.opencilk.org

Thank you for considering contributing to www.opencilk.org. People like you make it simple to build fast and composable software with OpenCilk. Following these guidelines helps make the OpenCilk website and documentation better for users&mdash;researchers, educators, students, and coders interested in software performance engineering.

## Platform and content basics

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.
All the content used to generate the site is in the `src/` folder.

As much as possible, content is written in markdown. (We have not yet selected an official dialect.) 
The generator is programmed to recognize a few shortcodes that we have created specifically for this site, which are described at the end of this document.

## Production and staging

The site is hosted by Netlify, which provides an alternate URL https://sage-licorice-6da44d.netlify.app/ for viewing this site, in addition to our custom domain https://www.opencilk.org, which visitors typically use. These two URLs both show the `main` branch of this repository.

Edits to the site should initially be made to the `staging` branch.
Netlify deploys those commits to a special staging URL: https://staging--sage-licorice-6da44d.netlify.app/.
When commits are ready to be published on the production site, they are
merged with the `main` branch. 

For both `staging` and `main`, commits automatically trigger a rebuild, which
usually takes 2-3 minutes to deploy.

## Making simple changes

To suggest a simple change to the website, you can navigate to the `staging` branch of the page with the content you think should be changed, and edit it.
(Here are [instructions for editing on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).)
You will be prompted to fork the repo (if you haven't already) and then open a Pull Request.
Once your Pull Request is merged with `staging`, you should see your changes show up on https://staging--sage-licorice-6da44d.netlify.app/ in a few minutes.

## Tracking work in progress

For bigger changes please use GitHub Issues&mdash;by [searching the existing issues](https://github.com/OpenCilk/www.opencilk.org/issues), creating a new issue if needed, and adding comments to track progress.

## Distilling the goals of one page

When you work on a page of the website, please consider carefully the top-level reasons why OpenCilk users would want to read it. This basic information is included in the following fields, which should be in the [front matter](https://www.11ty.dev/docs/data-frontmatter/) that comes before the body of the page.

- Title
- Tag line: 1 or 2 sentences to persuade a visitor to read this page.
- Author
- Featured image: Eye-catching graphic to persuade a visitor to read this page.
  * Don’t worry if you can’t find one.
  * Better if image has no background.
  * Should be readable when reduced to a thumbnail roughly 150 pixels wide, as you see on the [Fast Code](https://www.opencilk.org/posts) page. For example </br>![random-work-steal](/src/img/random-work-steal-154px.png)
  * Tags
    - For existing tags, see [here](https://www.opencilk.org/tags/news/).
    - Alternatively, invent your own (try to be conservative).

## Join the team

Members of the `@opencilk/website-contributors` team have write access to this repository.
If you are interested in joining, please [let us know](https://github.com/orgs/OpenCilk/discussions).

## Netlify CMS

Members of `@opencilk/website-contributors` (people with accounts with write access) may use Netlify CMS to edit pages of the site. 
Netlify CMS provides a dashboard-like UI that lets you

- Edit WYSIWYG-style, with rich text, as an alternative to markdown;
- Manage images and similar files with a Media page.

### Logging in

Access Netlify CMS at https://www.opencilk.org/admin. At the Netlify Identity prompt, choose "Continue with GitHub". Your first time, you will be asked to authorize the GitHub OAuth app that connects Netlify CMS with GitHub. The screen will look roughly like this:
</br>![Netlify CMS GitHub OAuth](src/img/Netlify%20CMS%20GitHub%20OAuth.png)

The app will only access data of the OpenCilk organization;
however, the authorize modal may report that the app has permission to access more than that. If you see another organization with a green check beside it, it means that the administrator of that organization has *removed the default GitHub restrictions* that control third-party access, so that any app used by any member is allowed to access the data of that organization. (If you disagree with your org admin, you can ask them to restore default restrictions, which is easy for them to do.)

### Collections

Once you are logged into https://www.opencilk.org/admin, you may choose Collections or Media. These web UIs allow you to work with content in the `staging` branch.
Media stores images, and 
Collections include Authors, Blog, User's guide, Tutorials, Reference, and Glossary.

### Your author page

If you haven't already done so, please choose the Authors collection and make sure that there is a complete entry for you. Your author information helps the OpenCilk community of users and contributors to recognize each other, so please fill in all the fields. Thank you!

- Name (how you would like your name to appear above pages that you author)
- Affiliation
- URL of external homepage
- Headshot (with background removed)

### Editing a page with Netlify CMS

Netlify CMS is configured so that you can create and edit the top-level basic information for your page(s), as shown in the left side of the Netlify CMS edit screen, at the top. </br>![netlify-cms-editor](/src/img/netlify-cms-editor.png)

## Custom shortcodes

The generator for this site has been programmed to recognize the following shortcodes in markdown:

- `{% defn "term", "optional_display text" %}`: this shortcode renders `"term"` (or `"optional_display_text"`) as a link to the glossary entry for `"term"`.
- `{% img "/img/filename.ext", "optional_size" %}`: this shortcode displays a centered image (as a CSS block), sized so that neither its width nor height exceed `"optional_size"`, which defaults to 400px.
  * `{% imgRight "/img/filename.ext", "size" %}`: similar to `img` but floats right
  * `{% imgLeft "/img/filename.ext", "size" %}`: similar to `img` but floats left
- `{% alert "optional_style" %} lorem ipsum {% endalert %}`: this paired shortcode renders its content inside a [Bootstrap 5 alert box](https://getbootstrap.com/docs/5.0/components/alerts/), using `"optional_style"` as the style of alert ("info" is the default).
