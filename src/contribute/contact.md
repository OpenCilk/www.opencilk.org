---
layout: layouts/page.njk
title: Contact us
eleventyNavigation:
  key: Contact
  order: 2
---

Do you have questions or comments about OpenCilk, our open-source community, or software performance engineering?

We would love to hear from you. Please use the form below or email `contact@opencilk.org`. Thank you!

<div class="content ms-4">
    <form action="POST" name="contact-form" content-type="application/x-www-form-urlencoded" data-netlify="true" style="max-width: 40em;">
        <div class="form-group">
            <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input name="name" type="text" class="form-control" id="name" aria-describedby="nameHelp">
            </div>
        </div>
        <div class="form-group">
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input name="email" type="email" class="form-control" id="email" aria-describedby="emailHelp">
                <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
            </div>
        </div>
        <div class="form-group">
            <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea name="message" class="form-control" id="message" rows="7"></textarea>
            </div>
        </div>
        <!-- Comment out the recaptcha because it's onerous IMO
        <div class="field">
                <div data-netlify-recaptcha="true"></div>
        </div>
        -->  
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</div>

(See also [Community](/community/) and [Contribute](/contribute/).)