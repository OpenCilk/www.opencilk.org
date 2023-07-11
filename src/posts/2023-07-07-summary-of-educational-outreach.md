---
layout: layouts/post.njk
title: (title)
tagline: (tagline)
author: John Owens
date: 2023-07-07T00:00:00.000Z
attribution: false
---
Over the past year, the OpenCilk Academic Board has conducted focused interviews with more than a dozen faculty worldwide. We believe that a key part of our effort to create a community around performance engineering is teaching students. We hope that we can produce students ready to meet the significant need of the computing community by developing a high-quality curriculum in performance engineering, and ensure that curriculum can be easily adopted by faculty at both research- and teaching-focused schools.

We are fortunate to be able to begin a curriculum with the outstanding MIT course led by Charles Leiserson over the past twenty years. Many faculty with whom we spoke were interested in the educational side of performance engineering specifically because of your class (and that's how I found this community as well).

In our outreach, we focused on the following questions:

- What constitutes a performance engineering curriculum?
- What are the obstacles to faculty offering performance engineering course material?
- What materials can we provide to the community that helps faculty teach performance engineering?
- What are the directions we should take a performance engineering curriculum?

The majority of our outreach was to North American faculty at R1 (research-focused) universities, but we were also able to talk to faculty outside of North America and to faculty at teaching-focused universities. Because we talked to faculty who had already expressed interest in the topic, and/or had been recommended as having an interest by other faculty, we naturally had a positive reception.

----

# Curriculum

In general, faculty agreed that the syllabus for the MIT course was broad and appropriate. Faculty appreciate that this course spans multiple levels of the stack (architecture, programming systems, theory), in contrast to much of the computer science and engineering curriculum that focuses on one level only. (Faculty feel that both single-layer and multi-layer courses in the curriculum are relevant and appropriate, but multi-layer courses are less common.)

Some (but not all) faculty would expect to teach only a subset of the MIT course, for several (totally reasonable) reasons:

- The material they would leave out would have been well-covered in previous courses
- They don't have a background in the material they would leave out
- They prefer to focus more deeply on a subset of the MIT course material
- They would include other material and thus could not cover all the material from the MIT course

There was a significant hope for a "modular" performance engineering curriculum where different pieces of material could be easily integrated into an existing course.

## What should we add to the curriculum?

The primary topics mentioned were distributed computing (multi-socket and certainly multi-node, including frameworks like Spark), GPUs, and performance engineering of networks and I/O. We would like to provide a roadmap for faculty who approach this material from a theory perspective and from a parallel-programming perspective; both perspectives have many faculty who teach that course and if we provided a smooth on-ramp to add performance-engineering material, that would be well-received.

### Specific topics mentioned beyond the scope of the MIT course

- Vectorization, although I understand MIT has recently added this topic to their course. I believe the important outcome of this material is for students to understand what the compiler can do (automatically) with respect to vectorization and what it cannot. I have looked at [Google Highway](https://github.com/google/highway) as an interesting abstraction. The Google team noted LLVM's [Vectors and Extended Vectors](https://clang.llvm.org/docs/LanguageExtensions.html#vectors-and-extended-vectors).
- C++ performance issues, e.g., in-place vs. insert, constructors, pass-by-value vs. pass-by-reference.
- Better intuition on how to think about programming in Cilk
- Test suites and test-driven development, which MIT covers in the software-engineering prerequisite to its performance-engineering course.
- Performance issues with managed languages, with Rust mentioned most often. Garbage collection.
    - JavaScript has ~little uptake in universities but is highly optimized and highly important in industry because of its use in web browsers. The kind of virtual-machine environment used in JavaScript would be useful for students to know.
- A focus on traditional (parallel) computing primitives (e.g., scatter, gather, map, reduce, sort) and then how those are implemented in different parallel programming models
- Benchmarks: different levels of benchmarks, how they're useful, what are the characteristics of good ones
- Performance counters.
- How security interacts with performance engineering
- A lab on performance debugging. (This could be a walk-through in a complex project: how can we start with something that's not performing well where we don't know why and dig down until we do?)
- Industry feedback on what should be included in a compiler lecture: Icache alignment, which is hard for C compilers to optimize; data layout; calling conventions; SOA vs. AOS.
- Entire courses on:
    - Virtual machine design, where students build a compiler that supports VM, including an object model and a garbage collector ([Mario Wolczko's fall 2015 UC Berkeley course](http://www.wolczko.com/CS294/index.html))
	- GPU performance engineering
	- Case studies, using skills from the intro course to address real-world / complex problems (from industry)

### Specific tools mentioned that are useful

Nearly every faculty member and industry expert noted "perf", the Unix profiler, was a critical tool to teach. Other recommended tools:

- Cilk internal tools (Cilkscale, Cilk*)
- PAPI (hardware counters)
- Cachegrind (cache behavior)
- vTune (Intel)
- Google pprof
- [uops.info](https://uops.info/uiCA.html)
- Google's [Perfetto](https://perfetto.dev/) ("System profiling, app tracing and trace analysis")
- Emery Berger uses and teaches [Coz](https://arxiv.org/abs/1608.03676) in his class

### Profiling vs. instrumenting

The MIT course focuses on using performance tools (e.g., profilers) to measure performance, identify bottlenecks, and address them. Such tools (broadly) don't modify source code but instead measure.

One of our faculty contacts instead described his philosophy of _instrumenting_ code rather than _profiling_ it. He inserts measurement code (instrumentation) into his source code to understand how it is running.

Both approaches are valuable and it was an interesting discussion within the OpenCilk group on the need to also teach instrumentation. This is certainly an interesting topic for an additional lecture.

## Sharing course material

Many (but not all) faculty, because of time pressure, will eagerly begin their course preparation with course material developed by other faculty. (I never would have considered teaching this course without such material.) In general faculty are theoretically interested in sharing their course material but nervous about making it available to the whole world; the faculty concern with the latter is having some degree of control over their material. Limited sharing with a known community seems to be a good middle ground.

Thus we are addressing this by asking faculty to share their material in a private share accessible to other faculty within the performance engineering community. We attempt to set a good example by sharing our material at the outset. Faculty have been positively responsive to this plan.

## Long-term curriculum goal

The goal of a modular performance engineering curriculum is laudable. The MIT course is already fairly modular (in my opinion); the list of topics is clear and distinct and most lectures are self-contained. The ideal curriculum, though, has the following characteristics:

- **A broader set of material**. The current course focuses primarily on single-socket CPUs. Many of the interested faculty come from a supercomputing or distributed-computing background and teach parallel programming or theory. The current course does not address network or I/O performance. And most faculty mentioned performance engineering of GPUs as a necessary component.
- **Material at different levels of detail**. Any topic in the current course could likely be turned into an entire course, and probably has. In an ideal curriculum, any particular topic would have material at multiple levels: (for instance) 20 minutes of lecture material, one lecture, three lectures. Another word for this goal is a _hierarchical_ curriculum.
- **A dependency tree of material**. For both the existing course and in adding future material, we should carefully understand the knowledge that must be covered before presenting any particular piece of material. What we need is a dependency tree: if you want to present X, that's dependent on Y and Z, and Z is dependent on A. Such a tree will hopefully allow instructors to mix and match material with confidence.
- **Faculty who "own" or manage particular lectures or materials**. On some topics, faculty are experts, and readily and gladly update their own course material year after year. We face a tension of existing instructors wanting to entirely "own" their own courses but also wanting to incorporate up-to-date and thoughtfully written material from others. One possible direction we could go is to allow faculty to take charge of particular aspects of the curriculum and commit to update materials and answer questions about them. Our hope is that for an expert faculty member, this is not burdensome but instead a willing task, and that the collective efforts of many expert faculty members will create a greater good for all.

## Relevant projects we heard about during our conversations

- https://csinparallel.org/index.html
    - [Patternlets](https://csinparallel.org/csinparallel/modules/patternlets.html) were the best received outcome of CSinParallel
- https://eduwrench.ics.hawaii.edu/pedagogic_modules/multi_core_computing/
- https://accidentallyquadratic.tumblr.com/
- https://lemire.me/blog/
- http://cs-materials.herokuapp.com/
- https://bridgesuncc.github.io/newassignments.html
- [NERSC training](https://www.nersc.gov/users/training/events/)

# Faculty obstacles to teaching

At R1 schools, the primary obstacle to adding a new course or new course material is faculty time. Unanimously faculty indicated their time to develop new courses or material is quite limited, and additionally not rewarded well by their universities. Many faculty have little ability to choose their teaching assignments (they are needed to teach existing classes), and computer science and engineering departments today often have large enrollments so faculty are often unable to add new courses when their current courses are in high demand.

That being said, faculty were enthusiastic about both the need for the material and the existing (MIT) course that teaches it. They were also enthusiastic about the topic and that the scope of the topic was (at least) the size of an entire course. Many faculty expressed optimism that the combination of a clear benefit/need for this curriculum and their interest in teaching it would allow them to regularly teach such a course in the future (though not necessarily immediately).

In general faculty felt this course was best suited as an upper-division undergraduate course (although at my university I am advocating it as a "mezzanine course" for new grad students and advanced undergrads, and I first taught it as a graduate course). One faculty member noted that the largest body of degree-holders that enter industry are BS degrees and thus we should focus on that cohort of students. Other faculty noted the growth of their (online) MS programs and that this material would be useful there. (Finally, some departments also offer industry-focused courses and this material potentially fits that need.)

The OpenCilk team has discussed targeting newly hired faculty at R1 schools, as these faculty often have the ability to introduce a new course as they begin their teaching careers, and would likely be receptive to a high-quality course with ample available course material.

## What is different about teaching schools?

- Teaching schools have limited computing resources---R1 schools likely have large compute resources on campus / from the labs of faculty, but teaching schools lack these.
- Departments also have very little resources (e.g., to fund cloud compute time), although many teaching schools require lab fees.
- Teaching schools may have more flexibility to offer new courses if they fill needs in the curriculum. However, given teaching-school constraints, it may be more successful to target how to integrate our material into existing courses rather than introduce new courses.
- Their major challenge is that faculty are stretched thin in terms of their existing teaching assignments. One professor noted that in fact, at teaching schools, faculty are often asked to teach material that is far from their experience or teaching interest.
- Faculty are more invested in sharing their teaching experience in an academic setting such as SigCSE

## Training

Our team settled early on training professors to teach performance engineering as a key part of our effort. We had lengthy discussions about this, and I present my views:

- Faculty are extremely busy and any training is a significant commitment on their part. Any effort we make must be scheduled well in advance and attract a critical mass of faculty to be worth the time that all instructors and attendees would put into the event. The disaster scenario is a well-planned training where only three people attend.
- For faculty to commit, we must present to them an experience that is clearly worth their time. Attractive elements include:
    - (Likely) a summer timeframe, because it is too hard to schedule a good time for a large fraction of faculty during the academic year
	- Location. Two attractive alternatives:
	    - Just before or after a popular conference
		- A location where faculty would happily visit. Hawaii was mentioned more than once.
	- A group of faculty who would be happy to spend time together. I'm confident that the faculty with whom we spoke over the past year would be fast friends with many common interests, and if a significant number of them committed to going, other faculty within and without the group we spoke to would find spending a few days with that group highly attractive.
	- A timeframe that delivered a lot of value per hour spent. We have not internally discussed the right timeframe; I tend to think one or two days would be a good length of time. And it would take a significant amount of effort on our part to make our training valuable.
	- Travel costs covered at least, with possibly a stipend.
- The contents of such a training are challenging given that nearly all faculty involved in our discussions have never attended nor led teacher training. The default training would be "explain the material, go over the syllabus" but that is not nearly as helpful in my opinion as more focused material on helping faculty teach it better / use their time more wisely. (For instance, it is straightforward to ask faculty to read the syllabus and peruse the slides ahead of time.) More valuable is guidance that the trainers can convey that is best suited for an in-person setting: here are the sticky points of teaching this material, here is the string of student questions you'll get, here's where you want to guide students with this material. The goal of training should not be "familiarize faculty with the material" (that's nice, but that's not most important); instead perhaps lessons learned from teaching the material, and feedback from students and how that should influence future curriculum development.
- Teaching-university faculty have fairly different goals and interests from R1 faculty. Teaching-university faculty are rewarded by their institutions for training and for attending training, and have had significant success in organizing training. In addition their funding model is more geared to attending such training (R1 faculty grants or department/college resources would rarely cover attending training). Successful previous teaching-university workshops have been:
    - (Workshop series 1): Regional (short travel needs) and paying for food/housing
	- (Workshop series 2): Stipends for both attending AND (additionally) coming back the next year and presenting adopted material.

Beyond the training efforts above, few faculty (and very few without an MIT lineage) have any Cilk experience at all. (I did not when I taught my course. I think it's possible to teach this material without practical experience, but it is not ideal.) Online materials for faculty to learn what _they_ need to know about Cilk would be ideal. One faculty member specifically noted he wanted a "NOT gentle introduction to Cilk, one that is hands-on". He does not want "hello world" in Cilk because then if that's all he knows, he can't help students beyond that.

### TA Training

One faculty member noted his concern that his _TAs_ did not have any experience with some of the technologies in this course, notably Cilk. He was (reasonably!) concerned with introducing these technologies into his course and his TAs not being able to support them. The OpenCilk group should absolutely have online training materials for TAs that tell TAs what they need to know to supervise OpenCilk instruction and projects.

Another faculty member listed three hopes he has for his TAs:

- Guide students when they are solving homework problems / projects
- Grading homeworks / projects and timing them
- Providing useful comments and suggestions on student code


## Textbook

Several faculty expressed a strong desire for a textbook. Several others were clear they don't care if there's a textbook. And several others felt a textbook would be useful but is not required. Everyone agreed there was no appropriate current textbook.

## Grading

Grading, and the use of TAs to make detailed grading viable, is a significant concern. Infrastructure for auto-grading assignments (measuring their correctness and performance) would be appreciated.

## OpenCilk and long-term viability

Many faculty were enthusiastic about OpenCilk as a powerful way to program multicore machines. However, they were understandably concerned about teaching a technology where they felt students would have little ability to use that technology once they reach industry. The largest computing companies today simply don't use OpenCilk. The reasons that OpenCilk is not in LLVM (or other widely used technologies that are used in these companies) and thus unavailable to programmers at those companies are long, complex, and well beyond the scope of this document. But, it is clear to me that the long-term impact of OpenCilk is gated by its ability to live within standard toolchains and thus be available in generic industry computing environments (e.g., using a standard compiler toolchain).

Professors mentioned that students' intuition on Cilk could be improved, and that the community would benefit from a single (new) paper that summarizes Cilk as a programming model and implementation and discusses design decisions. If we built Cilk from scratch tomorrow for the first time, how would we write it up?

## OpenCilk as a pinnacle

The MIT course treats OpenCilk as the pinnacle of parallel-programming environments. OpenCilk is beautiful, both theoretically and in practice, and honestly is a joy to teach. But, I found myself lacking a broader context of the scope of multicore parallel programming environment. I would like to see more of a taxonomy of the type of parallel computing problems (e.g., OpenCilk excels at divide-and-conquer, but how about structured-grid computation? sparse matrix operations?) and different programming models and how they approach points in this taxonomy, and why certain models are a good fit for certain kinds of problems. This is especially important for students who may (soon!) work in companies where OpenCilk is not available, and who may need to choose other environments.

# Materials

Faculty had a broad variety of materials they would find useful in preparing a performance engineering course. Some were obvious, some less so.

(Personally, when I taught this class for the first time, I benefited greatly from PowerPoint lecture slides, from recordings of the course that used those slides, and from the assignments that were used in one instance of the course. The MIT teaching staff also shared their AWS setup, which we adapted for our course's use.)

## Lecture slides and videos

The MIT course's lecture slides have been developed over many years and are superb. The combination of lecture slides and videos of those lectures being delivered are the single most important item that we can provide. MIT uses PowerPoint and I converted them to Keynote but PowerPoint is, generally, the most portable.

## Assignments

MIT divided student work into two categories: assignments, which are more about learning the tools and the software environment, and projects, which are larger and more open-ended. I adapted existing MIT assignments and projects into the work I gave students, and also wrote one project.

A library of existing projects that are interesting and educational for students is highly desirable. The worse-case scenario for faculty is for a non-expert faculty member to attempt to develop a new project, to spend significant time on it, and to eventually decide it is not a good project. The faculty member can't get that time back and is often up against a deadline in the first place. Existing projects both save time and eliminate that worst-case scenario. The challenge is even greater when developing Cilk projects because almost no faculty members are expert enough at Cilk to know at the outset if a project is good or not. Timely feedback from the Cilk team would take little time from that team but would greatly help faculty avoid developing non-viable projects.

MIT's philosophy in writing projects is to give students working code that fulfills the project description but is unoptimized and/or slow and/or unparallelized. Students are then responsible to improve project performance. This is a good philosophy (in my opinion) but it does require identifying projects where the performance gap between initial code and final code is both large and interesting from a course-materials perspective (e.g.,  parallelization using Cilk is an interesting and appropriate parallelization).

## Case studies

One topic that came up during our discussions with the Google Chrome team is their need to optimize existing code. In contrast, most course assignments involve writing new code, not analyzing and testing existing code. Through our discussions, we collectively believe it would be highly valuable to the performance-engineering community to have a set of _case studies_: existing code that is slow, for some reason, where students must profile and/or instrument this code to find where it is inefficient and fix it. For the Chrome team, and likely by extension for many industry scenarios where performance is vital, this is a significant part of their job. University courses do not teach this. Now, identifying and writing good case studies is an enormous challenge; it seems imposing to be able to write one from scratch, but the alternative is identifying such a performance-improvement opportunity in the wild, and that is equally imposing. Faculty also noted that once such an assignment is released, it is no longer able to be reused. All that being said, business schools rely heavily on case studies in their instruction; we should consider why and how they are used; and more effort on our part to identify interesting case studies and see how they can be used in the curriculum is time well spent.

Georgia Tech's [Scientific Software Engineering Center](https://ssecenter.cc.gatech.edu/) might be a source for case studies.

## Computing resources

Teaching performance engineering requires accurately measuring performance. The MIT course stresses reproducible, consistent measurements by configuring servers to allow this ("quiescing"). We believe quiesced servers are an important aspect of performance-engineering course assignments, but it means that a performance engineering class can almost certainly not use generic department-supplied computing environments without effort. (For instance, the typical department computing resource is a pool of Unix workstations that allow local and remote logins; it is very difficult to get good performance measurements when many students can be logged into, and running jobs on, the same machine.)

We began our outreach with two tentative paths toward providing course computing resources that would allow accurate and repeatable performance measurements. The first is using a cloud provider (e.g., AWS). The second is internal university computing resources. Both, of course, have pros and cons.

### Using a cloud provider

The benefit of a cloud provider is that it "only" costs money but does not require internal department resources, either computers or sysadmin time. That being said, setup is not trivial, but we can provide our instructions for others.

We expect computing demand to vary significantly during an academic term (with peaks near assignment deadlines). Cloud providers are able to provide elastic service and easily handle this variance.

When I taught my course at UC Davis, we used AWS for student assignments. UC Davis has an AWS relationship already so billing and student account creation were more straightforward than if we did not have this relationship. MIT also has used AWS. Our cost was $155 per enrolled student over an academic quarter (ten weeks).

This option is perhaps best for departments that have a little more cash than time or computing resources. It is also probably more straightforward for departments that want to offer an experimental (one-time) course before committing to adding it to their curriculum.

The OpenCilk team also had informal discussions with a cloud computing provider with the hopes that such a provider could supply a customized service so that complex configuration was not necessary. While this has not been successful to date, it remains a future option.

### Local machine resources

The other alternative is configuring local machines within a department. Because of quiescing requirements, this machine or machines would likely be a server with managed access. UC Davis has turned to this alternative for our next offering. We will configure a single server to be used only for this class for the entire academic term, and control access to this server via a job submission interface (Slurm).

This option is perhaps best for departments that have a server or servers that can be dedicated to the course for the entire academic term.

### A third option: NSF ACCESS

One of our faculty contacts noted his success with the [NSF ACCESS](https://access-ci.org/) program for student assignments ([request here](https://allocations.access-ci.org/prepare-requests-overview)). He also noted that part of his responsibility as an instructor when using ACCESS was making his educational materials available to the ACCESS program and presumably the computing community. (This is an excellent tradeoff!)

We have not yet investigated the suitability of ACCESS for quiesced servers or for a typical student computing load in a performance engineering course.

### Cost sharing

The OpenCilk team also discussed pursuing grant funding with which we could subsidize computing time for newly-introduced performance engineering courses at other universities. We hope this would help faculty convince their departments of both external interest in the course material as well as a vested interest into making it easier for the department to offer the course. Our idea of a subsidy (rather than fully covering the cost) was to ensure that the department also had a (financial) interest in the course, although of course many models are possible here.

# Industry feedback

- "New candidates (university grads) can’t use perf, don’t know assembly." "If you've never done this before, it takes a long time to learn. ... takes 6--12 months to get really effective."
- "The most common problems we saw with new engineers were (1) lack of performance skills, and (2) a complete and abject fear of parallelism."
- Industry teams use many tools including homegrown ones, but "perf" is ubiquitous. Many homegrown tools are built simply to solve a particular problem and can be thrown away afterwards---"build the simplest tool that does the job".
- The skills needed to be a good performance engineer overlap substantially with the skills needed to be a good security expert.
- New college graduates should:
    - "Have an appetite to dig beyond the 'obvious thing'."
    - Work in a VM space on some industry product (e.g., JVM)
	- Have built something successfully, improved something successfully. Signal that they are capable on the technical level. Not so many candidates work in the VM space.
    - “Performance work”. Similar skills: security people who can exploit a VM/compiler.
    - Understand lowest level of C++, e.g., pointers, performance tools.
- Many many candidates have never seen C++ and don't understand memory allocation. Much C++ code looks like it was written by a Java or Python programmer (this is undesirable).
