---
layout: layouts/page.njk
title: Join us
eleventyNavigation:
  key: Join us
  order: 1
experience:
- [Algorithms, Applications, Architectures, Benchmarking, Compilers, IDEs]
- [Languages, Libraries, Runtime systems, Software productivity tools, Teaching]
---

To hear about the latest OpenCilk developments, please sign up here.

<div class="content ms-4">
    <form action="POST" name="join-us-form" content-type="application/x-www-form-urlencoded" data-netlify="true" style="max-width: 40em;">
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
                <label for="title" class="form-label">Title</label>
                <input name="title" type="text" class="form-control" id="title" aria-describedby="nameHelp">
            </div>
        </div>
        <div class="form-group">
            <div class="mb-3">
                <label for="organization" class="form-label">Organization</label>
                <input name="organization" type="text" class="form-control" id="organization" aria-describedby="nameHelp">
            </div>
        </div>
        <div class="form-group">
          <div class="d-flex">
            {% for itemList in experience %}<div class="me-5">{% for item in itemList %}
                <div class="mb-3">
                <input name="{{ item }}" type="checkbox" id="{{ item }}" value="{{ item }}">
                <label for="{{ item }}" class="form-label">{{ item }}</label>
                </div>{% endfor %}</div>{% endfor %}
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