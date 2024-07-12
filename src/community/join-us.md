---
layout: layouts/page.njk
sidebar: toc
title: Join us
eleventyNavigation:
  key: Join us
  order: 1
---

The OpenCilk project welcomes your expertise and enthusiasm. Please fill out the form below to get started. Thank you for your interest!

<form name="join-form" method="POST" data-netlify="true">
  <div class="form-group">
    <label for="name" name="name">Name</label>
    <input type="text" class="form-control" id="name" placeholder="Fib O'Nacci">
  </div>
  <div class="form-group">
    <label for="email" name="email">Email address</label>
    <input type="email" class="form-control" id="email" placeholder="onacci@exemplary.edu">
  </div>
  <div class="form-group">
    <label for="company" name="company">Organization</label>
    <input type="text" class="form-control" id="company" placeholder="Exemplary Institute">
  </div>
  <label>More about your work (Check all that apply.)</label>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="faculty">
    <label class="form-check-label" for="faculty" name="faculty">
      Faculty
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="postdoc">
    <label class="form-check-label" for="postdoc" name="postdoc">
      Postdoc
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="research_scientist">
    <label class="form-check-label" for="research_scientist" name="research_scientist">
      Research Scientist
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="student">
    <label class="form-check-label" for="student" name="student">
      Student
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="ta">
    <label class="form-check-label" for="ta" name="ta">
      Teaching Assistant
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="Industry">
    <label class="form-check-label" for="Industry" name="industry">
      Industry
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="government">
    <label class="form-check-label" for="government" name="government">
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
    0<input type="range" class="form-range" min="0" max="10" step="1" id="spe-important-to-me">10
  </div>
  <div class="form-group">
    <label for="me-important-to-spe">My research is an important part of advancing SPE.</label></br>
    0<input type="range" class="form-range" min="0" max="10" step="1" id="me-important-to-spe">10
  </div>
  <div class="form-group">
    <label for="advancing-spe">I am interested in coalescing a community of researchers to advance SPE as scientific field in its own right.</label></br>
    0<input type="range" class="form-range" min="0" max="10" step="1" id="advancing-spe">10
  </div>
  <div class="form-group">
    <label for="teaching-spe">I am interested in teaching SPE.</label></br>
    0<input type="range" class="form-range" min="0" max="10" step="1" id="teaching-spe">10
  </div>

  <div class="form-group">
    <label for="conferences">Considering your areas of interest, which conferences do you think represent the best SPE research? You may optionally include rankings and/or comments with your answer.</label>
    <textarea class="form-control" id="conferences" rows="2"></textarea>
  </div>

  </br>Which activities would be most interesting to you for SPE community-building? (Check all that apply.)
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="hopc">
    <label class="form-check-label" for="hopc">
      Workshops like HOPC that present published papers from various conferences
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="dagstuhl">
    <label class="form-check-label" for="dagstuhl">
      Workshops/seminars that stand alone, like Dagstuhl seminars
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="keynote">
    <label class="form-check-label" for="keynote">
      Workshops with invited keynote talks
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="competition">
    <label class="form-check-label" for="competition">
      SPE competitions (e.g. to measurably improve performance)
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="students">
    <label class="form-check-label" for="students">
      Student research programs/competitions
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" id="publishing">
    <label class="form-check-label" for="publishing">
      New conferences/workshops that publish new peer-reviewed papers on SPE
    </label>
  </div>

</br>
  <div class="form-group">
    <label for="helping">What activities would you like to help organize and participate in?</label>
    <textarea class="form-control" id="helping" rows="2"></textarea>
  </div>


</br>
  <div class="form-group">
    <label for="recommend">Are there any other individuals that you recommend be included in SPE community building? </label>
    <textarea class="form-control" id="recommend" rows="1"></textarea>
  </div>

</br>
<label>Do you grant permission to include your reponses in a summary report on SPE?</label>
  <div class="form-check">
    <input class="form-check-input" type="radio" name="permission" id="permission1">
    <label class="form-check-label" for="permission1">
      Yes, and I permit my name to be included in the report along with my responses.
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="radio"  name="permission" id="permission2">
    <label class="form-check-label" for="permission2">
      Yes, but my responses should be anonymous.
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="radio"  name="permission" id="permission3">
    <label class="form-check-label" for="permission3">
      No, I do not permit my reponses to be included in the report.
    </label>
  </div>

</br>
  <div class="form-group">
    <label for="recommend">Additional comments </label>
    <textarea class="form-control" id="additional_comments" rows="2"></textarea>
  </div>

</br>
Thank you!

  <p>
    <button type="submit" class="btn btn-primary">Submit</button>
  </p>
</form>
