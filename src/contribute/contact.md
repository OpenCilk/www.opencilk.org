---
layout: layouts/page.njk
title: Contact us
eleventyNavigation:
  key: Contact
  order: 0
---

Do you have questions or comments about OpenCilk, our open-source community, or software performance engineering?

We would love to hear from you. (See also [Community](/community/) and [Contribute](/contribute/).)

<div class="content ms-4">
    <form action="POST" data-netlify="true" style="max-width: 40em;">
        <div class="form-group">
            <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input type="text" class="form-control" id="name" aria-describedby="nameHelp">
            </div>
        </div>
        <div class="form-group">
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" aria-describedby="emailHelp">
                <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
            </div>
        </div>
        <div class="form-group">
            <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea class="form-control" name="message" id="message" rows="7"></textarea>
            </div>
        </div>
        <div class="field">
                <div data-netlify-recaptcha="true"></div>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</div>