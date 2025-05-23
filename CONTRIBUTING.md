# Contribution guidelines for www.opencilk.org

Thank you for considering contributing to www.opencilk.org. People like you make it simple to build fast and composable software with OpenCilk. Following these guidelines helps make the OpenCilk website and documentation better for users&mdash;researchers, educators, students, and coders interested in software performance engineering.

## Platform and content basics

The OpenCilk website is generated using [Eleventy](https://www.11ty.dev/), a Node.js package for building static websites.
All the content used to generate the site is in the `src/` folder.

As much as possible, content is written in markdown. (We have not yet selected an official dialect.) 
The generator is programmed to recognize a few shortcodes that we have created specifically for this site, which are described at the end of this document.

## Drafting, reviewing, and publishing changes

The site is hosted by Netlify at https://www.opencilk.org and also at the alternate URL https://sage-licorice-6da44d.netlify.app/. 
These two URLs both show the `main` branch of this repository.

### Drafting changes

Edits to the site should be made with a pull request (PR) to the `main` branch.
(Here are [instructions for editing on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files).
You will be prompted to fork the repo if you haven't already.)
Creating or updating a PR automatically triggers Netlify to generate a deploy-preview, where you can see the proposed updates within the context of the full website. The deploy-preview usually takes 2-3 minutes to generate.

Proposing draft changes occurs via PRs, with their associated deploy-previews and comment threads. [Here is an example](https://github.com/OpenCilk/www.opencilk.org/pull/97). Bigger changes are also tracked with GitHub Issues.

There are two ways to create PRs:

- Manual PRs: the traditional approach with GitHub, as documented [here](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request).
- Netlify CMS: members of the `@opencilk/website-contributors` can also use Netlify CMS to create PRs, as explained below.

### Reviewing changes

Simple changes may be approved and merged directly with the `main` branch. Bigger changes are reviewed before they are merged. 
To indicate that your PR is awaiting review, please edit the PR as follows:

- Change the "Labels" field of the PR from `netlify-cms/draft` to `netlify-cms/pending_review`.
- Change the "Reviewers" field of the PR to the appropriate person(s), after they have agreed to review for you.

If you don't know who to ask to review, just email [contact@opencilk.org](mailto:contact@opencilk.org) and let us know, and we will help you.

### Publishing (aka merging with the `main` branch)

Please let Bruce know when you are ready to merge your PR with the `main` branch, because he would appreciate working through the exact details of this step with a few people before documenting it. There is a visualization of our GitHub workflow at the end of this document.

### Making simple changes vs. tracking bigger ones

To suggest a simple change to the website, you can navigate to the `main` branch of the page with the content you think should be changed, and edit it on GitHub.
Your edit will create a PR. Once the PR is merged with `main`, you should see it online in 2-3 minutes.

For tracking bigger changes (or suggesting that others make changes to the website), please use GitHub Issues&mdash;by [searching the existing issues](https://github.com/OpenCilk/www.opencilk.org/issues), creating a new issue if needed, and adding comments to track progress.

## Style guide

### Prose

I can't resist blogs written in first-person singular ("I"), where I can hear the voice of the author as I read,
so please write blog posts that way.
For the user's guide and tutorials, one should not write too formally.
Instead, you should write conversationally and address the reader as "you" to make the topic more engaging.
Reference documents should be concise and correct.

### Fonts
- The first time you use a formally defined term that is (or should be) in the glossary, use the shortcode `{% defn "term", "optional_display text" %}`, and the site generator will render it as a <strong><em><a href="#">bold italicized link</a></em></strong> (as documented near the bottom of this page).
- The first time you use a formally defined term that does not belong in the glossary, then
  * make it an <em><a href="#">italicized link</a></em> if you are referencing an external webpage definition, or
  * make it <em>italicized</em> if you are not referencing an external webpage definition.

### Images

Please use diagrams to help people follow your article. If you mention a person (perhaps as an important influence on your topic)
then consider including a headshot, to make your article more "personable."

If you put code into an image, please use Consolas font. 

To simplify using images, the site supports the shortcode `{% img "/img/filename.ext", "optional_size" %}`, which is documented below (along with variants `imgRight` and `imgLeft`).

### Colors

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
## Editing tips

### Distilling the goals of one page

When you work on a page of the website, please consider carefully the top-level reasons why OpenCilk users would want to read it. This basic information is included in the following fields, which should be in the [front matter](https://www.11ty.dev/docs/data-frontmatter/) that comes before the body of the page.
If you edit with Netlify CMS, it will prompt you to edit each of these fields, as explained below.

- Title
- Tag line: 1 or 2 sentences to persuade a visitor to read this page.
- Author
- Featured image: Eye-catching graphic to persuade a visitor to read this page.
  * Don’t worry if you can’t find one.
  * Better if image has no background.
  * Should be readable when reduced to a thumbnail roughly 150 pixels wide, as you see on the [Fastcode Blog](https://www.opencilk.org/posts). For example </br>![random-work-steal](/src/img/random-work-steal-154px.png)
  * Tags
    - For existing tags, see [here](https://www.opencilk.org/tags/news/).
    - Alternatively, invent your own (try to be conservative).

### Netlify CMS

Members of the `@opencilk/website-contributors` team have write access to this repository
and may use Netlify CMS to edit pages of the site. 
(If you are interested in joining, please email [contact@opencilk.org](mailto:contact@opencilk.org).)

**Benefits of Netlify CMS:** Netlify CMS provides a dashboard-like UI that lets you

- Edit WYSIWYG-style, with rich text, as an alternative to markdown;
- Create a PR for each page that you are editing, with the corresponding deploy-preview generated by Netlify;
- Associate GitHub labels with each PR for tracking pre-publication workflow:
  * `netlify-cms/draft`
  * `netlify-cms/pending_review`
  * `netlify-cms/pending_publish`;
- Manage images and similar files with a Media page.

**Downsides of Netlify CMS:** 

- **Time.** Every time you save your changes with Netlify CMS, no matter how trivial, it takes 2-3 minutes to see the result, because that's how long it takes Netlify to regenerate the deploy-preview of that PR.
Alternatively, with a local fork of the repository, you can work on the PR and see the results of each edit in 2-3 seconds, because regenerating your instance of the site on `localhost` is that much faster than regenerating on Netlify.
- **Comments.** Every time you save your changes with Netlify CMS, it adds a generic "Update" comment to GitHub.
 Alternatively, if you use git to push commits to the PR, you can write your own comments so that each change is documented.


#### Logging in

Access Netlify CMS at https://www.opencilk.org/admin. At the Netlify Identity prompt, choose "Continue with GitHub": </br>![netlify-cms-github](/src/img/netlify-cms-continue-with-github.png)

#### Contents, workflow, and media

Once you are logged into https://www.opencilk.org/admin, you may choose Contents, Workflow, or Media.

##### Contents

Contents are published articles organized as Collections, which include Authors, Blog, User's guide, Tutorials, Reference, and Glossary.
When you edit or create new published content, Netlify CMS will create a PR and label it `netlify-cms/draft`, and Netlify will generate a deploy-preview for the PR.
</br>![netlify-cms-collections](/src/img/netlify-cms-collections.png).

##### Workflow 

Workflow organizes pre-published work in progress, based on GitHub labels associated with the corresponding PRs. (The labels are `netlify-cms/draft`, `netlify-cms/pending_review`, and `netlify-cms/pending_publish`). 
</br>![netlify-cms-workflow](/src/img/netlify-cms-workflow.png).

We recommend using the GitHub Project, [Website Content Development](https://github.com/orgs/OpenCilk/projects/1/views/4), to view and update the PR labels, which is easier than using the Netlify CMS edit screen for changing from draft to in-review etc.
</br>![github-project-content dev](/src/img/github-project-website-content-development.png).

##### Media

Media provides a UI to manage images in the `/src/img/` folder.

#### Your author page

If you haven't already done so, please choose the Authors collection and make sure that there is a complete entry for you. Your author information helps the OpenCilk community of users and contributors to recognize each other, so please fill in all the fields. Thank you!

- Name (how you would like your name to appear above pages that you author)
- Affiliation
- URL of external homepage
- Headshot (with background removed)

#### Editing a page with Netlify CMS

The edit screen of Netlify CMS has buttons for saving your work, changing the status (from draft to in-review etc.), publishing, and deleting.
We recommend using only the `Save` button and ignoring the others.
To change the status, you should use the GitHub Project, [Website Content Development](https://github.com/orgs/OpenCilk/projects/1/views/4), to view and update the PR labels.
To publish, please let Bruce know that you are ready to merge your pull request with the `main` branch.

Netlify CMS is configured so that you can create and edit the top-level basic information for your page(s), as shown in the left side of the Netlify CMS edit screen, at the top. 

</br>![netlify-cms-editor](/src/img/netlify-cms-editor.png)

### GitHub workflow

![GitHub workflow](/src/img/github-workflow.png)

### Custom shortcodes

The generator for this site has been programmed to recognize the following shortcodes in markdown:

- `{% danger %}` generates a "![fire](/src/img/fire.png) Use responsibly:" warning.
- `{% defn "term", "optional_display text" %}`: this shortcode renders `"term"` (or `"optional_display_text"`) as a link to the glossary entry for `"term"`.
- `{% img "/img/filename.ext", "optional_size" %}`: this shortcode displays a centered image (as a CSS block), sized so that neither its width nor height exceed `"optional_size"`, which defaults to 400px.
  * `{% imgRight "/img/filename.ext", "size" %}`: similar to `img` but floats right
  * `{% imgLeft "/img/filename.ext", "size" %}`: similar to `img` but floats left
- `{% alert "optional_type", "optional_title" %} lorem ipsum {% endalert %}`: this paired shortcode renders its content inside a [Pydata-Sphinx admonition box](https://pydata-sphinx-theme.readthedocs.io/en/stable/examples/kitchen-sink/admonitions.html), using `"optional_type"` as the type of admonition and "optional_title" as the text above the content (i.e. the title). The default type is "note" and the default title is "Note:".

