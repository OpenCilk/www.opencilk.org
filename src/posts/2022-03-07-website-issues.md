---
title: Website issues
date: 2022-03-08
author: Bruce Hoppe
tags:
- issues
---

From Alexandros

# Logo

## Full logo with text

I personally like the logo. :)

## Plain logo without text (top bar)

The plain logo looks odd and a little distracting to me when there is a
lot of empty space around it as in the top bar, especially after
scrolling down which hides the breadcrumbs. It gives me the impression
of an incomplete or leftover design element.

I can see two ways to (hopefully) make it look nicer:

1.  Move the main navigation links ("install", "blog", "documentation",
    "community", "contribute") to the left, next to the OpenCilk logo.
    (This could also make it possible to fit the search bar in the same
    line if that is desirable.)
2.  Use the full logo in the top bar.

I think the first option would be better.

## Thumbnail in the browser tab

This looks great.

# Main content and side pane

## Width of content in web pages

(I am viewing the website on a 27" monitor with 4K resolution. My
browser is Firefox 97.0.1 with zoom level 120%. I am on Windows 10 and
the OS-wide display scale is 200%.)

The main content (i.e., excluding the side pane) takes up about 50% of
my display width. This feels maybe a bit narrow but pretty comfortable
overall. If I reduce the Firefox zoom level to 100%, however, the
content width is at about 1/3 of the display width. At that point, it
starts feeling like I am viewing a mobile-browser page on my desktop.

I think the content space should be made wider (for wide-enough
displays).

## Centering: content vs side pane + content

In pages that feature a side pane, such as blog posts, the total width
of "side pane + content" is centered", which means that the content
itself is off-center. A little after I started reading a blog post ("The
folly of DIY multithreading"), I begun to find it uncomfortable that my
head was generally turned more to the right than I am used to when
browsing web pages.

As long as there is enough unused space, it may be nice to keep the
content centered (as in the pages which lack side panes) and have the
side pane occupy part of the left margin (either left- or
right-justified).

The above layout means that the non-empty space of pages with side panes
would not be centered. I am not sure how this would look, but I expect
it would make it more comfortable to browse around opencilk.org.

## Side pane vs main page content

1.  The side pane is great. However, I notice that there is often a
    mismatch between the items in the side pane and the contents in the
    page.
2.  Even if there isn't an actual mismatch, I would expect something
    that is shown in the side pane to be a significant element in the
    page, e.g., a section (even if the section body is but a few words).
      - The first place where this jumped at me was in "Install": I
        missed the "build from source" link when scanning through it. (I
        then saw it in the side pane but for some seconds thought it was
        actually missing from the page.)

## Side pane active item highlighting

1.  If the text of the active item in the side pane is wrapped over
    multiple lines, the highlighting of consecutive lines overlaps a
    little. As a result, the highlighting opacity becomes higher in the
    overlap area.

# Top bar

## Breadcrumbs (e.g. home \> Documentation \> …)

1.  If I click on a tag, the breadcrumb becomes "Tags \> Tagged
    'featured'". I think "Home" should still be the first crumb;
    possibly "Blog" should be the second one, before "Tags".
2.  If I click on "Blog" in the top bar, the relevant breadcrumb is "Go
    Multicore". Once I go deeper, it becomes "Blog".

## Reserved space for top bar

When I scroll down in a long page (e.g., a blog post) it seems like the
top part of the top bar (OpenCilk logo and the 5 landing pages) is
overlaid on the visible page rather than occupying its own space.

That is, the breadcrumbs + search bar, as well as part of the side pane,
apparently get hidden behind the visible top bar.

This may or may not be desirable for the bread crumbs and search bar (I
am 50/50 on this), but I think it is certainly undesirable for the side
pane.

# Front page

## The four buttons

1.  They look great.
2.  I find it a tad odd or confusing that the button labels do not match
    the top-bar buttons.

# Blog

## Archive side pane

1.  It would be nice to have a (possibly lighter-color) "Mon YYYY" tag
    next to each post in the archive list.

## Tag-filtered list of blog posts

1.  I like the difference in layout:
      - regular blog post list – compact buttons, multiple per row; vs
      - tag-filtered post list – one item per row.
2.  I would prefer to retain the look-and-feel where each blog post
    listing has an associated image (it could be a smallish thumbnail at
    the right end of the listing).
3.  I think the one-sentence description underneath the post title
    should be plain, not be decorated like a URL. The hyperlinked
    element should be either an entire tile (like in the regular Blog
    page) or just the title.

## "The folly of DIY multithreading" post

1.  Cilk++ -\> OpenCilk?
2.  `fib.c`
    1.  The `#include` statements are incomplete.
    2.  The first code is already in Cilk, not just plain C.
    3.  With OpenCilk (as opposed to Cilk++), the main function stays
        `main()` (as opposed to `cilk_main()`).
3.  As a rule, I think it is if source code references in the blog text
    body (e.g., "in this case to `thread_func()` and the struct `args`")
    are typeset in a monospace font.
4.  \[In "Code simplicity"\] I assume this was an older blog post, but
    if its publication timestamp is 2022 the backward leap should be a
    65-year one. :)
5.  \[Before the final Cilk code\] "\[…\] may fit the bill perfectly.
    **J** But, if the prospect \[…\]".

## "Race conditions" post

This post is incomplete.

# Learn

## Title vs content

1.  "Learn" sounds great to me as a user (of sorts). But if we are
    trying to strategically target teachers, it seems odd that "teach"
    (or similar) is not easily found.
      - I do see that "In the classroom: teach with OpenCilk" is
        literally in the front page, but if I don't interact with it
        right away, or spend some time browsing and forget, it is too
        easy to miss.

# Colors

## Dark mode

1.  I would love for the OpenCilk website to look good in dark mode.
      - For the record, I use the [Dark Reader](https://darkreader.org)
        extension in Firefox.

# Software components (ecosystem?) besides the OpenCilk compiler

Where would things like the following go?

1.  Libraries
      - Ours or third-party
2.  Other tools
      - E.g.: I am playing around with a benchmarking tool that could be
        handy for performance engineering
3.  Miscellaneous "goodies"
      - E.g.: I have a `cilk-mode` package for highlighting Cilk
        keywords and using the OpenCilk compiler for on-the-fly syntax
        checking in Emacs.

As it is, if I try to imagine myself as a first-time visitor who wants
to learn about OpenCilk, I get the impression that there would be no
such things to be found in the website.

Maybe a way to make space for them would be to rename the
"Install"-\>"Software" in the top bar, and have subsections in
"Software" (e.g., "Install", "Libraries", "Tools", etc).
