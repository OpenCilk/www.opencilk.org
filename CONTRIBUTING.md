# Contribution guidelines for www.opencilk.org

Thank you for considering contributing to www.opencilk.org. People like you make it simple to build fast and composable software with OpenCilk. Following these guidelines helps make the OpenCilk website and documentation better for users&mdash;researchers, educators, students, and coders interested in software performance engineering.

## Making simple changes

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.
All the content used to generate the site is in the `src/` folder.

To suggest a simple change to the website, you can navigate to the page with the content you think should be changed, and edit it.
(Here are [instructions for editing on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).)
You will be prompted to fork the repo (if you haven't already) and then open a Pull Request.
Once your Pull Request is merged, you should see your changes show up on the website in a few minutes.

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

Members of the `@opencilk/website-contributors` team have write access and can push changes directly to the main branch of www.opencilk.org.
If you are interested in joining, please [let us know](https://github.com/orgs/OpenCilk/discussions).

## Netlify CMS

For any changes worth tracking as Issues, members of `@opencilk/website-contributors` should use Netlify CMS to edit pages of the site. 
Netlify CMS provides a dashboard-like UI that lets you

- Edit WYSIWYG-style, with rich text, as an alternative to markdown;
- Manage pre-publication with queues for "draft" content, "in-review" content, and "ready" content; and
- Manage images and similar files with a Media page.

### Logging in

Access Netlify CMS at https://www.opencilk.org/admin. At the Netlify Identity prompt, choose "Continue with GitHub": </br>![netlify-cms-github](/src/img/netlify-cms-continue-with-github.png)

### Collections and workflow

Once you are logged into https://www.opencilk.org/admin, you may choose Collections or Workflow.

#### Workflow 

Workflow organizes work in progress&mdash;content held in special branches depending on whether its status is draft, in-review, or ready.
</br>![netlify-cms-workflow](/src/img/netlify-cms-workflow.png).

#### Collections

Collections are for published content (held in the main branch) and they include Authors, Blog, User's guide, Tutorials, Reference, and Glossary.
When you edit published content, Netlify CMS will set the page to draft status, after which you may change the status to in-review, ready, or (re-)published.
</br>![netlify-cms-collections](/src/img/netlify-cms-collections.png).

### Your author page

If you haven't already done so, please choose the Authors collection and make sure that there is a complete entry for you. Your author information helps the OpenCilk community of users and contributors to recognize each other, so please fill in all the fields. Thank you!

- Name (how you would like your name to appear above pages that you author)
- Affiliation
- URL of external homepage
- Headshot (with background removed)

### Editing a page with Netlify CMS

Netlify CMS is configured so that you can create and edit the top-level basic information for your page(s), as shown in the left side of the Netlify CMS edit screen, at the top. </br>![netlify-cms-editor](/src/img/netlify-cms-editor.png)
