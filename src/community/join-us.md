---
layout: layouts/page.njk
sidebar: toc
title: Join us
eleventyNavigation:
  key: Join us
  order: 1
---

The OpenCilk project welcomes your expertise and enthusiasm. Please fill out the form below to get started. Thank you for your interest!

<form name="join-formxx" method="POST" data-netlify="true">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" class="form-control" id="name" name="name" placeholder="Fib O'Nacci" required>
  </div>
  <div class="form-group">
    <label for="email">Email address</label>
    <input type="email" class="form-control" id="email" name="email" placeholder="onacci@exemplary.edu" required>
  </div>
  <div class="form-group">
    <label for="org">Organization</label>
    <input type="text" class="form-control" id="org" name="org" placeholder="Exemplary Institute">
  </div>
  <label>More about your work (Check all that apply.)</label>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="faculty" name="faculty" id="faculty">
    <label class="form-check-label" for="faculty">
      Faculty
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="postdoc" name="postdoc" id="postdoc">
    <label class="form-check-label" for="postdoc">
      Postdoc
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="re_sci" name="re_sci" id="re_sci">
    <label class="form-check-label" for="re_sci">
      Research Scientist
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="student" name="student" id="student">
    <label class="form-check-label" for="student">
      Student
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="ta" name="ta" id="ta">
    <label class="form-check-label" for="ta">
      Teaching Assistant
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="industry" name="industry" id="Industry">
    <label class="form-check-label" for="Industry">
      Industry
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="govt" name="govt" id="govt">
    <label class="form-check-label" for="govt">
      Government
    </label>
  </div>
  </br>
  <div class="form-group">
    <label for="research_area">Please describe your research area and research interests.</label>
    <textarea class="form-control" id="research_area" name="research_area" rows="2"></textarea>
  </div>

  </br>Indicate your level of agreement with the following statements, where 0=strongly disagree and 10=strongly agree.
  <div class="form-group">
    <label for="spe-important-to-me">SPE is an important part of my research.</label></br>
    0<input type="range" class="form-range" name="spe_for_me" min="0" max="10" step="1" id="spe_important_to_me">10
  </div>
  <div class="form-group">
    <label for="me-important-to-spe">My research is an important part of advancing SPE.</label></br>
    0<input type="range" class="form-range" name="me_for_spe" min="0" max="10" step="1" id="me_important_to_spe">10
  </div>
  <div class="form-group">
    <label for="advancing-spe">I am interested in coalescing a community of researchers to advance SPE as scientific field in its own right.</label></br>
    0<input type="range" class="form-range" name="advancing_spe" min="0" max="10" step="1" id="advancing_spe">10
  </div>
  <div class="form-group">
    <label for="teaching-spe">I am interested in teaching SPE.</label></br>
    0<input type="range" class="form-range" name="teaching_spe" min="0" max="10" step="1" id="teaching_spe">10
  </div>

  <div class="form-group">
    <label for="conferences">Considering your areas of interest, which conferences do you think represent the best SPE research? You may optionally include rankings and/or comments with your answer.</label>
    <textarea class="form-control" id="conferences" name="conferences" rows="2"></textarea>
  </div>

  </br>Which activities would be most interesting to you for SPE community-building? (Check all that apply.)
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_like_hopc" name="events_like_hopc">
    <label class="form-check-label" for="events_like_hopc">
      Workshops like HOPC that present published papers from various conferences
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_like_dagstuhl" name="events_like_dagstuhl">
    <label class="form-check-label" for="events_like_dagstuhl">
      Workshops/seminars that stand alone, like Dagstuhl seminars
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_w_keynote" name="events_w_keynote">
    <label class="form-check-label" for="events_w_keynote">
      Workshops with invited keynote talks
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_compete" name="events_compete">
    <label class="form-check-label" for="events_compete">
      SPE events_competes (e.g. to measurably improve performance)
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_students" name="events_students">
    <label class="form-check-label" for="events_students">
      Student research programs/events_competes
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="events_publish" name="events_publish">
    <label class="form-check-label" for="events_publish">
      New conferences/workshops that publish new peer-reviewed papers on SPE
    </label>
  </div>

</br>
  <div class="form-group">
    <label for="help_with">What activities would you like to help organize and participate in?</label>
    <textarea class="form-control" id="help_with" name="help_with" rows="2"></textarea>
  </div>


</br>
  <div class="form-group">
    <label for="rec_people">Are there any other individuals that you recommend be included in SPE community building? </label>
    <textarea class="form-control" id="rec_people" name="rec_people" rows="1"></textarea>
  </div>

</br>
<label>Do you grant permission to include your reponses in a summary report on SPE?</label>
  <div class="form-check">
    <input class="form-check-input" type="radio" name="permission" id="permission1" value="Yes_w_name">
    <label class="form-check-label" for="permission1">
      Yes, and I permit my name to be included in the report along with my responses.
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="radio"  name="permission" id="permission2" value="Yes_anon">
    <label class="form-check-label" for="permission2">
      Yes, but my responses should be anonymous.
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="radio"  name="permission" id="permission3" value="No">
    <label class="form-check-label" for="permission3">
      No, I do not permit my reponses to be included in the report.
    </label>
  </div>

</br>
  <div class="form-group">
    <label for="rec_people">Additional comments </label>
    <textarea class="form-control" id="additional_comments" name="additional_comments" rows="2"></textarea>
  </div>

</br>
Thank you!


  <div class="form-group">
    <div data-netlify-recaptcha="true"></div>
  </div>
      


  <p>
    <button type="submit" class="btn btn-primary">Submit</button>
  </p>
</form>
