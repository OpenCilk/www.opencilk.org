---
layout: layouts/page.njk
stylesheet: language-specification.css
title: OpenCilk language specification
date: 2022-07-14T21:37:03.433Z
eleventyNavigation:
  key: Language specification
---

<h1 class="title">OpenCilk Language Extension Specification<br />
    Version 1.0 (2021-02-01) </h1>
<p>Copyright &#xa9; 2020, 2021 Massachusetts Institute of Technology. All rights reserved.</p>
<p>More information about OpenCilk can be found at <a href="https://opencilk.org">
    opencilk.org</a></p>
<p>Feedback on this specification is encouraged and welcome; please send to <a href="mailto:contact@opencilk.org">
    contact@opencilk.org</a></p>

# Introduction

<p>This document is one of a set of technical
    specifications describing the OpenCilk language
    and the run-time support for the language. Together, these documents provide the
    detail needed to implement a compliant compiler. At this time the following specifications are available:</p>
<ul>
    <li>The OpenCilk Language Specification, this document</li>
    <li>The OpenCilk Application Binary Interface</li> (XXX Add link)
</ul>
<p>This document defines the OpenCilk extension to C and C++. The
    language extension is supported by a run-time user-mode work-stealing task scheduler
    which is not directly exposed to the application programmer. However, some of the
    semantics of the language and some of the guarantees provided require specific behavior
    of the task scheduler. The programmer visible parts of the language include the
    following constructs:</p>
<ol>
    <li>Four keywords (<code>cilk_scope</code>, <code>cilk_for</code>, <code>cilk_spawn</code> and <code>cilk_sync</code>)
        to express tasking</li>
    <li>Hyperobjects, which provide local views to shared objects</li>
</ol>
<p>An implementation of the language may take advantage of all parallelism resources
    available in the hardware. On a typical CPU, these include at least multiple cores
    and vector units. Some of the language constructs, e.g. <code>cilk_spawn</code>,
    utilize only core parallelism; some, e.g. SIMD loops, utilize only vector parallelism,
    and some, e.g. SIMD-enabled functions, utilize both. The defined behavior of every
    deterministic Cilk program is the same as the behavior of a similar C or C++ program
    known as the &#x201c;serialization.&#x201d; While execution of a C or C++ program
    may be considered as a linear sequence of statements, execution of a tasking program
    is in general a directed acyclic graph. Parallel control flow may yield a new kind
    of undefined behavior, a &#x201c;data race,&#x201d; whereby parts of the program
    that may execute in parallel access the same memory location in an indeterminate
    order, with at least one of the accesses being a write access. In addition, <del>throwing</del>
    <ins>if</ins> an exception <del>may result in</del> <ins>is thrown,</ins> code <del>
        being</del> <ins>may still be</ins> executed that would not have been executed
    in a serial execution.</p>
<p><ins>The word &#x201c;shall&#x201d; is used in this specification to express a diagnosable
    constraint on a Cilk Plus program.</ins></p>

# Related documents

<ol>
    <li>The OpenCilk Application Binary Interface</li>
    <li>ISO/IEC 9899:2011, Information Technology &#x2013; Programming languages &#x2013;
        C</li>
    <li>ISO/IEC 14882:2011, Information Technology &#x2013; Programming languages &#x2013;
        C++</li>
    <li><ins>OpenMP Application Program Interface, Version 4.0 - July 2013</ins></li>
</ol>

# Keywords for Tasking

<p>OpenCilk adds the following new keywords:</p>
<ul>
    <li><code>cilk_scope</code></li>
    <li><code>cilk_for</code></li>
    <li><code>cilk_sync</code></li>
    <li><code>cilk_spawn</code></li>
    
</ul>
<p>A program that uses these keywords other than as defined in the grammar extension
    below is ill-formed.</p>

## Grammar

<p>The three keywords are used in the following new productions:</p>
<dl class="bnf">
    <dt><dfn>jump-statement</dfn>:</dt>
    <dd><code>cilk_sync ;</code></dd>
</dl>
<p>The call production of the grammar is modified to permit the keyword <code>cilk_spawn</code>
    before the expression denoting the function to be called:</p>
<dl class="bnf">
    <dt><dfn>postfix-expression</dfn>:</dt>
    <dd><code>cilk_spawn</code><sub>opt</sub> <var>postfix-expression</var> <code>(</code>
        <var>expression-list</var><sub>opt</sub> <code>)</code></dd>
</dl>
<p>Consecutive <code>cilk_spawn</code> tokens are not permitted. The <var>postfix-expression</var>
    following <code>cilk_spawn</code> is called a <dfn>spawned function</dfn>. <del>The
        spawned function may be a normal function call, a member-function call, or the function-call
        (parentheses) operator of a function object (functor) or a call to a lambda expression.</del>
    Overloaded operators other than the parentheses operator may be spawned only by
    using the function-call notation (e.g., <code>operator+(arg1,arg2)</code>). There
    shall be no more than one <code>cilk_spawn</code> within a full expression. A function
    that contains a spawn statement is called a <dfn>spawning function</dfn>.</p>
<p class="note">Note: The spawned function <ins>call</ins> may be a normal function
    call, a member-function call, the function-call (parentheses) operator of a function
    object (functor), or a call to a lambda expression.</p>
<p>A program is <del>considered</del> ill formed if the <code>cilk_spawn</code> form
    of this expression appears other than in one of the following contexts:</p>
<ul>
    <li>as the <del>entire body</del> <ins>full-expression</ins> of an expression statement,</li>
    <li>as the entire right hand side of an assignment expression that is the <del>entire
        body</del> <ins>full-expression</ins> of an expression statement, or</li>
    <li>as the entire <var>initializer-clause</var> in a simple declaration <ins>for an
        object with automatic storage duration</ins>.</li>
</ul>
<p><del>(A <code>cilk_spawn</code> expression may be permitted in more contexts in
    the future.)</del> <ins>The rank of a spawned function call shall be zero. (See <a
        href="#array.sect">The section expression</a>.)</ins></p>
<p>A statement with a <code>cilk_spawn</code> on the right hand side of an assignment
    or declaration is called an <dfn><a id="defassignspawn">assignment spawn</a></dfn>
    or <dfn>initializer spawn</dfn>, respectively and the object assigned or initialized
    by the spawn is called the <dfn>receiver.</dfn></p>
<p>The iteration-statement is extended by adding another form of <code>for</code> loop:</p>
<dl class="bnf">
    <dt><dfn>grainsize-pragma</dfn>:</dt>
    <dd><code># pragma cilk grainsize =</code> <var>expression new-line</var></dd>
</dl>
<dl class="bnf">
    <dt><dfn>iteration-statement</dfn>:</dt>
    <dd><var>grainsize-pragma</var><sub>opt</sub> <code>cilk_for (</code> <var>expression</var>
        <code>;</code> <var>expression</var> <code>;</code> <var>expression</var> <code>)</code>
        <var>statement</var></dd>
    <dd><var>grainsize-pragma</var><sub>opt</sub> <code>cilk_for (</code> <var>declaration</var>
        <var>expression</var> <code>;</code> <var>expression</var> <code>)</code> <var>statement</var></dd>
</dl>
<p><ins>The three items inside parentheses in the grammar, separated by semicolons,
    are called the <dfn>initialization</dfn>, <dfn>condition</dfn>, and <dfn>increment</dfn>,
    respectively. (A semicolon is included in the grammar of <var>declaration</var>.)</ins></p>

## Semantics

### Tasking Execution Model

<p>A <dfn>strand</dfn> is a serially-executed sequence of instructions that does not
    contain a spawn point or sync point (as defined below). At a spawn point, one strand
    (the initial strand) ends and two strands (the new strands) begin. The initial strand
    <del>runs in series with</del> <ins>is sequenced before</ins> each of the new strands
    but the new strands <ins>are unsequenced with respect to one another (i.e. they</ins>
    may run in parallel with each other<ins>)</ins>. At a sync point, one or more strands
    (the initial strands) end and one strand (the new strand) begins. The initial strands
    <del>may run in parallel with one another</del> <ins>are unsequenced with respect to
        one another</ins> but each of the initial strands <del>runs in series with</del>
    <ins>is sequenced before</ins> the new strand. A single strand can be subdivided
    into a sequence of shorter strands in any manner that is convenient for modeling
    the computation. A <dfn>maximal strand</dfn> is one that cannot be included in a
    longer strand.</p>
<p>The strands in an execution of a program form a directed acyclic graph (DAG) in which
    spawn points and sync points comprise the vertices and the strands comprise the
    directed edges, with time defining the direction of each edge. (In an alternative
    DAG representation, sometimes seen in the literature, the strands comprise the vertices
    and the dependencies between the strands comprise the edges.)</p>

### Serialization rule

<p>The behavior of a deterministic OpenCilk program is defined
    in terms of its <dfn>serialization,</dfn> as defined in this section. If the serialization
    has undefined behavior, the OpenCilk program also has undefined
    behavior.</p>
<p>The strands in an execution of a program are ordered according to the order of execution
    of the equivalent code in the program's serialization. Given two strands, the <dfn>earlier</dfn>
    strand is defined as the strand that would execute first in the serial execution
    of the same program with the same inputs, even though the two strands may execute
    in either order or concurrently in the actual parallel execution. Similarly, the
    terms &#x201c;earliest,&#x201d; &#x201c;latest,&#x201d; and &#x201c;later&#x201d;
    are used to designate strands according to their serial ordering. The terms &#x201c;left,&#x201d;
    &#x201c;leftmost,&#x201d; &#x201c;right,&#x201d; and &#x201c;rightmost&#x201d; are
    equivalent to &#x201c;earlier,&#x201d; &#x201c;earliest,&#x201d; &#x201c;later,&#x201d;
    and &#x201c;latest,&#x201d; respectively.</p>
<p><strong>The serialization of a pure C or C++ program is itself.</strong></p>
<p>If a C or C++ program has defined behavior and does not use the tasking keywords
    or library functions, it is an OpenCilk with the same defined behavior.</p>
<p><strong>The serializations of <code>cilk_spawn</code> and <code>cilk_sync</code>
    are empty.</strong></p>
<p>If an OpenCilk program has defined deterministic behavior, then that behavior is
    the same as the behavior of the C or C++ program derived from the original by removing
    all instances of the keywords <code>cilk_spawn</code>, and <code>cilk_sync</code>.</p>
<p><strong>The serialization of <code>cilk_for</code> is <code>for</code>.</strong></p>
<p>If an OpenCilk program has defined deterministic behavior, then that behavior is
    the same as the behavior of the C or C++ program derived from the original by replacing
    each instance of the <code>cilk_for</code> keyword with <code>for</code>.</p>

## <del>Spawning</del> <ins>Task</ins> blocks

<p>A <del>spawning</del> <ins>task</ins> block is a region of the program subject to
    special rules. Task blocks may be nested. The body of a nested task block is not
    part of the outer task block. Task blocks never partially overlap. The body of a
    spawning function is a task block. A <code>cilk_for</code> statement is a task
    block and the body of the <code>cilk_for</code> loop is a (nested) task block.</p>
<p>Every <del>spawning</del> <ins>task</ins> block includes an implicit <code>cilk_sync</code>
    executed on exit from the block, including abnormal exit due to an exception. Destructors
    for automatic objects with scope ending at the end of the task block are invoked
    before the implicit <code>cilk_sync</code>. The receiver is assigned or initialized
    to the return value before executing the implicit <code>cilk_sync</code> at the
    end of a function. An implicit or explicit <code>cilk_sync</code> within a nested
    task block will synchronize with <code>cilk_spawn</code> statements only within
    that task block, and not with <code>cilk_spawn</code> statements in the surrounding
    task block.</p>
<del>
    <p>The scope of a label defined in a spawning block is limited to that spawning block.</p>
    <p class="note">Programmer note: Therefore, <code>goto</code> may not be used to enter
        or exit a spawning block.</p>
</del>

## <code>cilk_for</code> Loops

<ins>
    <p>The constraints and semantics of a <code>cilk_for</code> loop are the same as those
        of its serialization, unless specified otherwise.</p>
    <p>Each iteration of a <code>cilk_for</code> loop is a separate strand; they need not
        be executed serially.</p>
</ins>
<p>Within each iteration of the loop body, <del>the control variable is considered a
    unique variable whose address is no longer valid when the iteration completes.</del>
    <ins>the name of the control variable refers to a local object, as if the name were
        declared as an object within the body of the loop, with automatic storage duration
        and with the type of the original object.</ins> If the control variable is declared
    before the loop initialization, then <del>the address of the variable at the end of
        the loop is the same as the address of the variable before the loop initialization
        and</del> the <ins>final</ins> value of the control variable is the same as
    for the serialization of the program.</p>

### Syntactic constraints

<p>To simplify the grammar, some restrictions on <code>cilk_for</code> loops are stated
    here in text form. <del>The three items inside parentheses in the grammar, separated
        by semicolons, are the <var>initialization</var>, <var>condition</var>, and <var>increment</var>.</del>
    <ins>Where a constraint on an expression is expressed grammatically, parentheses around
        a required expression or sub-expression are allowed.</ins></p>
<del>
    <p>A program that contains a <code>return</code>, <code>break</code>, or <code>goto</code>
        statement that would transfer control into or out of a <code>cilk_for</code> loop
        is ill-formed.</p>
</del>
<p>The initialization shall declare or initialize a single variable, called the <dfn>
    control variable</dfn>. In C only, the control variable may be previously declared,
    but if so shall be reinitialized, i.e., assigned, in the initialization clause.
    In C++, the control variable shall be declared and initialized within the initialization
    clause of the <code>cilk_for</code> loop. <ins>The variable shall have automatic storage
        duration.</ins> <del>No storage class may be specified for the variable within the initialization
            clause. The variable shall have integral, pointer, or class type. The variable may
            not be <code>const</code> or <code>volatile</code>.</del> The variable shall
    be initialized. Initialization may be explicit, using assignment or constructor
    syntax, or implicit via a nontrivial default constructor. <del>Within each iteration
        of the loop body, the control variable is considered a unique variable whose address
        is no longer valid when the iteration completes. If the control variable is declared
        before the loop initialization, then the address of the variable at the end of the
        loop is the same as the address of the variable before the loop initialization and
        the value of the control variable is the same as for the serialization of the program.</del></p>
<del>
    <p>The condition shall have one of the following two forms:</p>
    <dl>
        <dd><var>var OP shift-expression</var></dd>
        <dd><var>shift-expression OP var</var></dd>
    </dl>
    <p>where <var>var</var> is the control variable, optionally enclosed in parentheses.
        The operator denoted <var>OP</var> shall be one of <code>!=</code>, <code>&lt;=</code>,
        <code>&lt;</code>, <code>&gt;=</code>, or <code>&gt;</code>. The <var>shift-expression</var>
        that is not the control variable is called the <dfn>loop limit</dfn>.</p>
</del><ins>
    <p>The condition shall have one of the following forms:</p>
    <dl>
        <dd><var>expression</var> <code>&lt;</code> <var>expression</var></dd>
        <dd><var>expression</var> <code>&gt;</code> <var>expression</var></dd>
        <dd><var>expression</var> <code>&lt;=</code> <var>expression</var></dd>
        <dd><var>expression</var> <code>&gt;=</code> <var>expression</var></dd>
        <dd><var>expression</var> <code>!=</code> <var>expression</var></dd>
    </dl>
    <p>Exactly one of the operands of the comparison operator shall be just the name of
        the loop's control variable. The operand that is not the control variable is called
        the <dfn>limit expression</dfn>. <ins>Any implicit conversion applied to that operand
            is not considered part of the limit expression.</ins></p>
</ins>
<p>The loop increment shall have one of the following forms: <del>where <var>var</var>
    is the loop control variable, optionally enclosed in parentheses, and <var>incr</var>
    is a <var>conditional-expression</var> with integral or enum type. The table indicates
    the <dfn>stride</dfn> corresponding to the syntactic form.</del></p>
<del>
    <table>
        <thead>
            <tr>
                <th>Syntax</th>
                <th>Stride</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>++</code><var>var</var></td>
                <td><code>+1</code></td>
            </tr>
            <tr>
                <td><var>var</var><code>++</code></td>
                <td><code>+1</code></td>
            </tr>
            <tr>
                <td><code>--</code><var>var</var></td>
                <td><code>-1</code></td>
            </tr>
            <tr>
                <td><var>var</var><code>--</code></td>
                <td><code>-1</code></td>
            </tr>
            <tr>
                <td><var>var</var> <code>+=</code> <var>incr</var></td>
                <td><var>incr</var></td>
            </tr>
            <tr>
                <td><var>var</var> <code>-=</code> <var>incr</var></td>
                <td><code>-(</code><var>incr</var><code>)</code></td>
            </tr>
        </tbody>
    </table>
    <p>The notion of stride exists for exposition only and does not need to be computed.
        In particular, for the case of <var>var</var> <code>-=</code> <var>incr</var>, a
        program may be well formed even if <var>incr</var> is unsigned.</p>
</del><ins>
    <dl>
        <dd><code>++</code> <var>identifier</var></dd>
        <dd><var>identifier</var> <code>++</code></dd>
        <dd><code>--</code> <var>identifier</var></dd>
        <dd><var>identifier</var> <code>--</code></dd>
        <dd><var>identifier</var> <code>+=</code> <var>expression</var></dd>
        <dd><var>identifier</var> <code>-=</code> <var>expression</var></dd>
    </dl>
    <p>The variable modified by the increment shall be the control variable.</p>
</ins>
<p>A program that contains a <code>return</code>, <code>break</code>, <code>goto</code>
    <ins>or <code>switch</code></ins> statement that would transfer control into or
    out of a <code>cilk_for</code> loop is ill-formed.</p>

### Requirements on types and operators

<p><del>The type of <var>var</var> shall be copy constructible. (For the purpose of
    specification, all C types are considered copy constructible.)</del> <ins>The control
        variable shall have unqualified integral, pointer, or copy-constructible class type.</ins></p>
<p>The initialization, condition, and increment parts of a <code>cilk_for</code> shall
    <del>be defined such that the total number of iterations (loop count) can be determined
        before beginning the loop execution. Specifically, the parts of the <code>cilk_for</code>
        loop shall</del> meet all of the semantic requirements of the corresponding
    serial <code>for</code> statement. In addition, depending on the syntactic form
    of the condition, a <code>cilk_for</code> adds the following requirements on the
    types of <del><var>var</var></del> <ins>the control variable</ins>, <del><var>limit</var></del>
    <ins>the limit expression</ins>, and <del><var>stride</var></del> <ins>the stride.</ins>
    <del>(and by extension <var>incr</var>), and</del></p>
<p>The loop count is computed as follows, evaluated in infinite integer precision <ins>
    when the control variable and limit both have integral or pointer type</ins>. <del>(</del>
    In the following table, <del><var>first</var> is the value of <var>var</var> immediately
        after initialization,</del> <ins>&#x201c;<var>var</var>&#x201d; stands for an expression
            with the type and value of the control variable, &#x201c;<var>limit</var>&#x201d;
            stands for an expression with the type and value of the limit expression, and &#x201c;<var>stride</var>&#x201d;
            stands for an expression with the type and value of the stride expression. The loop
            count is computed after the loop initialization is performed, and before the control
            variable is modified by the loop. The loop count expression shall be well-formed,
            and shall have integral type. When a stride expression is present, if the divisor
            of the division is not greater than zero, the behavior is undefined.</ins>
    <del>)</del></p>
<del>
    <table>
        <thead>
            <tr>
                <th>Condition syntax</th>
                <th>Requirements</th>
                <th>Loop count</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <pre class="noncode"><var>var</var> <code>&lt;</code> <var>limit</var>
<var>limit</var> <code>&gt;</code> <var>var</var></pre>
					</td>
					<td>(<var>limit</var>) <code>-</code> (<var>first</var>) shall be well-formed and shall
						yield an integral <var>difference_type</var>;<br />
						<var>stride</var> shall be &gt; 0</td>
					<td>
						<pre class="noncode">(( <var>limit</var> ) <code>-</code> ( <var>first</var> )) <code>/</code> <var>stride</var></pre>
					</td>
				</tr>
				<tr>
					<td>
						<pre class="noncode"><var>var</var> <code>&gt;</code> <var>limit</var>
<var>limit</var> <code>&lt;</code> <var>var</var></pre>
					</td>
					<td>(<var>first</var>) <code>-</code> (<var>limit</var>) shall be well-formed and shall
						yield an integral <var>difference_type</var>;<br />
						<var>stride</var> shall be &lt; 0</td>
					<td>
						<pre class="noncode">(( <var>first</var> ) <code>-</code> ( <var>limit</var> )) <code>/</code> <code>-</code><var>stride</var></pre>
					</td>
				</tr>
				<tr>
					<td>
						<pre class="noncode"><var>var</var> <code>&lt;=</code> <var>limit</var>
<var>limit</var> <code>&gt;=</code> <var>var</var></pre>
					</td>
					<td>(<var>limit</var>) <code>-</code> (<var>first</var>) shall be well-formed and shall
						yield an integral <var>difference_type</var>;<br />
						<var>stride</var> shall be &gt; 0</td>
					<td>
						<pre class="noncode">(( <var>limit</var> ) <code>-</code> ( <var>first</var> ) <code>+</code> <code>1</code>) <code>/</code> <var>stride</var></pre>
					</td>
				</tr>
				<tr>
					<td>
						<pre class="noncode"><var>var</var> <code>&gt;=</code> <var>limit</var>
<var>limit</var> <code>&lt;=</code> <var>var</var></pre>
					</td>
					<td>(<var>first</var>) <code>-</code> (<var>limit</var>) shall be well-formed and shall
						yield an integral <var>difference_type</var>;<br />
						<var>stride</var> shall be &lt; 0</td>
					<td>
						<pre class="noncode">(( <var>first</var> ) <code>-</code> ( <var>limit</var> ) <code>+</code> <code>1</code>) <code>/</code> <code>-</code><var>stride</var></pre>
					</td>
				</tr>
				<tr>
					<td>
						<pre class="noncode"><var>var</var> <code>!=</code> <var>limit</var>
<var>limit</var> <code>!=</code> <var>var</var></pre>
					</td>
					<td>(<var>limit</var>) <code>-</code> (<var>first</var>) and (<var>first</var>) <code>
						-</code> (<var>limit</var>) shall be well-formed and yield the same integral <var>difference_type</var>;<br />
						<var>stride</var> shall be != 0</td>
					<td>
						<pre class="noncode">if <var>stride</var> is positive
then ((<var>limit</var>) <code>-</code> (<var>first</var>)) <code>/</code> <var>stride</var>
else ((<var>first</var>) <code>-</code> (<var>limit</var>)) <code>/</code> <code>-</code><var>stride</var></pre>
					</td>
				</tr>
			</tbody>
		</table>
	</del><ins>
		<table border="1">
			<caption>Loop count expression<!--/-->
				and value</caption>
			<thead>
				<tr>
					<th>Form of<!--/-->
						condition</th>
					<th colspan="4">Form of<!--/-->
						increment</th>
				</tr>
				<tr>
					<th></th>
					<th><var>var</var><code>++</code><br />
						<code>++</code><var>var</var></th>
					<th><var>var</var><code>--</code><br />
						<code>--</code><var>var</var></th>
					<th><var>var</var> <code>+=<!--/--></code> <var>stride</var></th>
					<th><var>var</var> <code>-=<!--/--></code> <var>stride</var></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<th>
						<pre class="noncode"><var>var</var> <code>&lt;</code> <var>limit</var>
<var>limit</var> <code>&gt;</code> <var>var</var></pre>
					</th>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>))</pre>
					</td>
					<td>n/a</td>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>)<code>-1</code>)<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>)<code>-1</code>)<code>/-</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
				</tr>
				<tr>
					<th>
						<pre class="noncode"><var>var</var> <code>&gt;</code> <var>limit</var>
<var>limit</var> <code>&lt;</code> <var>var</var></pre>
					</th>
					<td>n/a</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>))</pre>
					</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>)<code>-1</code>)<code>/-</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>)<code>-1</code>)<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
				</tr>
				<tr>
					<th>
						<pre class="noncode"><var>var</var> <code>&lt;=</code> <var>limit</var>
<var>limit</var> <code>&gt;=</code> <var>var</var></pre>
					</th>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>))<code>+1</code></pre>
					</td>
					<td>n/a</td>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>))<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>))<code>/-</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
				</tr>
				<tr>
					<th>
						<pre class="noncode"><var>var</var> <code>&gt;=</code> <var>limit</var>
<var>limit</var> <code>&lt;=</code> <var>var</var></pre>
					</th>
					<td>n/a</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>))<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>))<code>/-</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>))<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
				</tr>
				<tr>
					<th>
						<pre class="noncode"><var>var</var> <code>!=</code> <var>limit</var>
<var>limit</var> <code>!=</code> <var>var</var></pre>
					</th>
					<td>
						<pre class="noncode">((<var>limit</var>)<code>-</code>(<var>var</var>))</pre>
					</td>
					<td>
						<pre class="noncode">((<var>var</var>)<code>-</code>(<var>limit</var>))</pre>
					</td>
					<td>
						<pre class="noncode">((<var>stride</var>)<code>&lt;0</code>) <code>?</code>
((<var>var</var>)<code>-</code>(<var>limit</var>)<code>-1</code>)<code>/</code><code>-</code>(<var>stride</var>)<code>+1</code> <code>:</code>
((<var>limit</var>)<code>-</code>(<var>var</var>)<code>-1</code>)<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
					<td>
						<pre class="noncode">((<var>stride</var>)<code>&lt;0</code>) <code>?</code>
((<var>limit</var>)<code>-</code>(<var>var</var>)<code>-1</code>)<code>/</code><code>-</code>(<var>stride</var>)<code>+1</code> <code>:</code>
((<var>var</var>)<code>-</code>(<var>limit</var>)<code>-1</code>)<code>/</code>(<var>stride</var>)<code>+1</code></pre>
					</td>
				</tr>
			</tbody>
		</table>
	</ins>
	<p><del>The <var>incr</var> expression shall have integral or enumeration type.</del>
		<ins>The type of the difference between the limit expression and the control variable
			is the <dfn>subtraction type</dfn>, which shall be integral. When the condition
			operation is <code>!=</code>, (<var>limit</var>)<code>-</code>(<var>var</var>) and
			(<var>var</var>)<code>-</code>(<var>limit</var>) shall have the same type. The stride
			shall be convertible to the subtraction type.</ins></p>
	<p><ins>For some expression X with the same type as the subtraction type</ins>, if the
		loop increment uses operator <code>++</code> or <code>+=</code>, the expression:</p>
	<pre><var>var</var> += <del>(<var>difference_type</var>)(<var>incr</var>)</del> <ins>X</ins></pre>
	<p>shall be well-formed; if <del>the loop increment</del> <ins>it</ins> uses operator
		<code>--</code> or <code>-=</code>, the expression</p>
	<pre><var>var</var> -= <del>(<var>difference_type</var>)(<var>incr</var>)</del> <ins>X</ins></pre>
	<p>shall be well-formed. The loop is <del>a use</del> <ins>an odr-use</ins> of the required
		operator <ins><code>+=</code> or <code>-=</code></ins> function.</p>
	
### Dynamic constraints

<del>
    <p>If the stride does not meet the requirements in the table above, the behavior is
        undefined. If this condition can be determined statically, the compiler is encouraged
        (but not required) to issue a warning. (Note that the incorrect loop might occur
        in an unexecuted branch, e.g., of a function template, and thus should not cause
        a compilation failure in all cases.)</p>
</del>
<p>If the control variable is modified other than as a side effect of evaluating the
    loop increment expression, the behavior of the program is undefined.</p>
<p>If <var>X</var> and <var>Y</var> are values of <var><del>var</del></var> <ins>the
    control variable</ins> that occur in consecutive evaluations of the loop condition
    in the serialization, then <ins>the behavior is undefined if</ins></p>
<pre class="noncode">((<var>limit</var>) <code>-</code> <var>X</var>) <code>-</code> ((<var>limit</var>) <code>-</code> <var>Y</var>)</pre>
<p>evaluated in infinite integer precision, <del>shall</del> <ins>does not</ins> equal
    the stride. If the condition expression is true on entry to the loop, then <ins>the
        behavior is undefined if</ins> the <ins>computed</ins> loop count <del>shall be non-negative</del>
    <ins>is not greater than zero</ins>. <ins>If the computed loop count is not representable
        as a value of type <code>unsigned long long</code>, the behavior is undefined.</ins></p>
<p class="note">Programmer note: Unsigned wraparound is not allowed.</p>
<p><ins>If the body of the loop is executed, </ins>the increment and limit expressions
    may be evaluated <del>fewer</del> <ins>a different number of</ins> times than in
    the serialization. If different evaluations of the same expression yield different
    values, the behavior of the program is undefined.</p>
<p>The copy constructor for the control variable may be executed more times than in
    the serialization.</p>
<p>If evaluation of the increment or limit expression, or a required <code>operator+=</code>
    or <code>operator-=</code> throws an exception, the behavior of the program is undefined.</p>
<p>If the loop body throws an exception that is not caught within the same iteration
    of the loop, it is unspecified which other loop iterations execute, <ins>but no other
        iteration is terminated early</ins>. If multiple loop iterations throw exceptions
    that are not caught in the loop body, the <code>cilk_for</code> statement throws
    the exception that would have occurred first in the serialization of the program.</p>

### Grainsize pragma

<p>A <code>cilk_for</code> <var>iteration-statement</var> may optionally be preceded
    by a <var>grainsize-pragma</var>. The grainsize pragma shall immediately precede
    a <code>cilk_for</code> loop and may not appear anywhere else in a program, except
    that other pragmas that appertain to the <code>cilk_for</code> loop may appear
    between the <var>grainsize-pragma</var> and the <code>cilk_for</code> loop. The
    expression in the grainsize pragma shall evaluate to a type convertible to <code>long</code>.</p>
<p>The presence of the pragma provides a hint to the runtime specifying the number of
    serial iterations desired in each chunk of the parallel loop. <del>The grainsize expression
        is evaluated at runtime.</del> <ins>The grainsize expression need not be evaluated.
            If it is evaluated, that evaluation is sequenced after the execution of the statement
            preceding the loop, is sequenced before any execution of the loop body, and is unsequenced
            with respect to the loop initialization and the evaluation of the limit and stride
            expressions.</ins> If there is no grainsize pragma, or if the grainsize
    evaluates to 0, then the runtime will pick a grainsize using its own internal heuristics.
    If the grainsize evaluates to a negative value, the behavior is unspecified. (The
    meaning of negative grainsizes is reserved for future extensions.) The grainsize
    pragma applies only to the <code>cilk_for</code> statement that immediately follows
    it &#x2013; the grain sizes for other <code>cilk_for</code> statements are not
    affected.</p>

## Spawn

<p>The <code>cilk_spawn</code> keyword suggests to the implementation that an executed
    statement or part of a statement may be run in parallel with following statements.
    A consequence of this parallelism is that the program may exhibit undefined behavior
    not present in the serialization. Execution of a <code>cilk_spawn</code> keyword
    is called a <dfn>spawn</dfn>. Execution of a <code>cilk_sync</code> statement is
    called a <dfn>sync</dfn>. <del>A statement</del> <ins>An expression statement or declaration
        statement</ins> that contains a spawn is called a <dfn>spawning statement</dfn>.
    <ins>In a declaration containing a <code>cilk_spawn</code> keyword, the initialization
        of each object declared is treated as a separate statement.</ins></p>
<p>The <dfn><a id="deffollowingsync">following sync</a></dfn> of a <code>cilk_spawn</code>
    refers to the next <code>cilk_sync</code> executed (dynamically, not lexically)
    in the same task block. Which spawn the sync follows is implied from context. The
    following sync may be the implicit <code>cilk_sync</code> at the end of a task
    block.</p>
<p>A <dfn><a id="defspawnpoint">spawn point</a></dfn> is a C sequence point at which
    a control flow fork is considered to have taken place. Any operations within the
    spawning expression that are not required by the C/C++ standards to be sequenced
    after the spawn point <del>shall be executed</del> <ins>are sequenced</ins> before
    the spawn point. The strand that begins at the statement immediately following the
    spawning statement (in execution order) is called the <dfn>continuation</dfn> of
    the spawn. The sequence of operations within the spawning statement that are sequenced
    after the spawn point comprise the <dfn>child</dfn> of the spawn. The scheduler
    may execute the child and the continuation in parallel. Informally, the <dfn>parent</dfn>
    is the task block containing the initial strand, the spawning statements, and their
    continuations but excluding the children of all of the spawns. The children of the
    spawns within a single task block are <dfn>siblings</dfn> of one another.</p>
<p>The spawn points associated with different spawning statements are as follows:
</p>
<ul>
    <li>The body of a <code>cilk_for</code> loop is a spawning statement with spawn point
        at the end of the loop condition test.</li>
    <li>An expression statement containing a single <code>cilk_spawn</code> has a spawn
        point at the sequence point at the call to the spawned function. Any unnamed temporary
        variables created prior to the spawn point are not destroyed until after the spawn
        point (i.e., the destructors are invoked in the child).</li>
    <li>A declaration statement in which an identifier is initialized or assigned with a
        result of a function call that is being spawned has a spawn point at the sequence
        point at the call to the spawned function. A declaration statement may consist of
        multiple comma separated declarations. Each of them may or may not have a spawn,
        and there can be at most one spawn per expression. The conversion of the function
        return value, if necessary, and the assignment or initialization of the receiver
        takes place after the spawn point (i.e., in the child). Any unnamed temporary variables
        created prior to the spawn point are not destroyed until after the spawn point (i.e.,
        their destructors are invoked in the child).</li>
</ul>
<p>For example, in the following two statements:</p>
<pre>x[g()] = cilk_spawn f(a + b);
a++;</pre>
	<p>The call to function <code>f</code> is the spawn point and the statement <code>a++;</code>
		is the continuation. The expression <code>a + b</code> and the initialization of
		the temporary variable holding that value, and the evaluation of <code>x\[g()]</code>
		take place before the spawn point. The execution of <code>f</code>, the assignment
		to <code>x\[g()]</code>, and the destruction of the temporary variable holding <code>
			a + b</code> take place in the child.</p>
	<p>If a statement is followed by an implicit sync, that sync is the spawn continuation.</p>
	<p class="note">Programmer note: The sequencing may be more clear if</p>
	<pre>x[g()] = cilk_spawn f(a + b);</pre>
	<p class="note">is considered to mean</p>
	<pre>{
	// <em>Evaluate arguments and receiver address before spawn point</em>
	T tmp = a + b; // <em>T is the type of a + b</em>
	U &amp;r = x[g()]; // <em>U is the type of x[0]</em>
	cilk_spawn { r = f(tmp); tmp.~T(); }
}</pre>
	<p>A <code>setjmp</code>/<code>longjmp</code> call pair within the same task block has
		undefined behavior if a spawn or sync is executed between the <code>setjmp</code>
		and the <code>longjmp</code>. A <code>setjmp</code>/<code>longjmp</code> call pair
		that crosses a task block boundary has undefined behavior. A <code>goto</code> statement
		is not permitted to enter or exit a task block.</p>

## Sync

<p>A sync statement indicates that all children of the current task block must finish
    executing before execution may continue within the task block. The new strand coming
    out of the <code>cilk_sync</code> is not running in parallel with any child strands,
    but may still be running in parallel with parent and sibling strands (other children
    of the calling function).</p>
<p>There is an implicit sync at the end of every task block. If a spawning statement
    appears within a try block, a sync is implicitly executed <del>at the end of</del>
    <ins>on exit from</ins> that try block, as if the body of the try were a task block.
    If a task block has no children at the time of a sync, then the sync has no observable
    effect. (The compiler may elide an explicit or implicit sync if it can statically
    determine that the sync will have no observable effect.)</p>
<p class="note">Programmer note: Because implicit syncs follow destructors, writing
    <code>cilk_sync</code> at the end of a function may produce a different effect
    than the implicit sync. In particular, if an assignment spawn or initializer spawn
    is used to modify a local variable, the function will generally need an explicit
    <code>cilk_sync</code> to avoid a race between assignment to the local variable
    by the spawned function and destruction of the local variable by the parent function.</p>

## Exceptions

<p>There is an implicit <code>cilk_sync</code> before a <del><code>throw</code>, after
    the exception object has been constructed.</del> <ins><var>try-block</var>.</ins></p>
<p>If a spawned function terminates with an exception, the exception propagates from
    the point of the corresponding sync.</p>
<p>When several exceptions are pending and not yet caught, later exception objects (in
    the serial execution order of the program) are destructed in an unspecified order
    before the earliest exception is caught.</p>

# Hyperobjects

## Description

<p>Cilk <ins>Plus</ins> defines a category of objects called &#x201c;hyperobjects&#x201d;.
    Hyperobjects allow thread-safe access to shared objects by giving each <del>parallel</del>
    strand <ins>running in parallel</ins> a separate instance of the object.</p>
<p>Parallel code uses a hyperobject by performing a <dfn>hyperobject lookup</dfn> operation.
    The hyperobject lookup returns a reference to an object, called a <dfn>view,</dfn>
    that is guaranteed not to be shared with any other active strands in the program.
    The sequencing of a hyperobject lookup within an expression is not specified. The
    runtime system creates a view when needed, using callback functions provided by
    the hyperobject type. When strands synchronize, the hyperobject views are merged
    into a single view, using another callback function provided by the hyperobject
    type.</p>
<p>The view of a hyperobject visible to a program may change at any spawn or sync (including
    the implicit spawns and syncs within a <code>cilk_for</code> loop). The identity
    (address) of the view does not change within a single strand. The view of a given
    hyperobject visible within a given strand is said to be <dfn>associated</dfn> with
    that view. A hyperobject has the same view before the first spawn within a task
    block as after a sync within the same task block, even though the thread ID may
    not be the same (i.e., hyperobject views are not tied to threads). A hyperobject
    has the same view upon entering and leaving a <code>cilk_for</code> loop and within
    the first iteration (at least) of the <code>cilk_for</code> loop. A special view
    is associated with a hyperobject when the hyperobject is initially created. This
    special view is called the <dfn>leftmost view</dfn> or <dfn>earliest view</dfn>
    because it is always visible to the leftmost (earliest) descendent in the depth-first,
    left-to-right traversal of the program's spawn tree. The leftmost view is given
    an initial value when the hyperobject is created.</p>
<p class="note">Programmer note: If two expressions compute the same address for a view,
    then they have not been scheduled in parallel. This property yields one of the simplest
    ways by which a program can observe the runtime behavior of the scheduler.</p>
<p class="note">Implementation note: An implementation can optimize hyperobject lookups
    by performing them only when a view has (or might have) changed. This optimization
    can be facilitated by attaching implementation-specific attributes to the hyperobject
    creation, lookup, and/or destruction operations.</p>

## Reducers

<p>The vast majority of hyperobjects belong to a category known as &#x201c;reducers.&#x201d;
    Each reducer type provides a <code>reduce</code> callback operation that merges
    two views in a manner specific to the reducer. For a pair of views <var>V<sub>1</sub></var>
    and <var>V<sub>2</sub></var>, the result of calling <code>reduce(</code><var>V<sub>1</sub></var><code>,</code>
    <var>V<sub>2</sub></var><code>)</code> is notated as <var>V<sub>1</sub>&#x2297;V<sub>2</sub></var>.
    Each reducer also provides an <code>identity</code> callback operation that initializes
    a new view.</p>
<p>The <code>reduce</code> callback for a &#x201c;classical&#x201d; reducer implements
    an operation &#x2297; such that (<var>a&#x2297;b</var>)&#x2297;<var>c==a</var>&#x2297;(<var>b&#x2297;c</var>)
    (i.e., &#x2297; is associative). The view-initialization callback for such a reducer
    sets the view to an identity value <var>I</var> such that <var>I&#x2297;v==v</var>
    and <var>v&#x2297;I==v</var> for any value <var>v</var> of <var>value_type</var>.
    Given an associative &#x2297; and an identity <var>I</var>, the triplet (<var>value_type</var>,
    &#x2297;, <var>I</var>) describes a mathematical <dfn>monoid</dfn>. For example,
    (<code>int</code>, <code>+</code>, <code>0</code>) is a monoid, as is (<code>list</code>,
    <code>concatenate</code>, <var>empty</var>). If each individual view, <var>R</var>,
    of a classical reducer is modified using only expressions that are equivalent to
    <var>R</var>&#x2190;<var>R</var>&#x2297;<var>v</var> (where <var>v</var> is of <var>
        value_type</var>), then the reducer computes the same value in the parallel
    program as would be computed in the serialization of the program. (In actuality,
    the &#x201c;&#x2297;&#x201d; in the expression &#x201c;<var>R</var>&#x2190;<var>R</var>&#x2297;<var>v</var>&#x201d;
    can represent a set of mutually-associative operations. For example, <code>+=</code>
    and <code>-=</code> are mutually associative.) For example, a spawned function or
    <code>cilk_for</code> body can append items onto the view of a list reducer with
    monoid (<code>list</code>, <code>concatenate</code>, <var>empty</var>). At the end
    of the parallel section of code, the reducer's view contains the same list items
    in the same order as would be generated in a serial execution of the same code.</p>
<p>Given a set of strands entering a sync, <var>S<sub>1</sub>,S<sub>2</sub>,S<sub>3</sub>,&#x2026;S<sub>n</sub></var>,
    associated with views <var>V<sub>1</sub>,V<sub>2</sub>,V<sub>3</sub>,&#x2026;V<sub>n</sub></var>,
    respectively such that <var>S<sub>i</sub></var> is earlier in the serial ordering
    than <var>S<sub>i+1</sub></var>, a single view, <var>W</var>, emerges from the sync
    with value <var>W&#x2190;V<sub>1</sub>&#x2297;V<sub>2</sub>&#x2297;V<sub>3</sub>&#x2297;&#x2026;&#x2297;V<sub>n</sub></var>,
    such that the left-to-right order is maintained but the grouping (associativity)
    of the operations is unspecified. The timing of this &#x201c;reduction&#x201d; is
    unspecified &#x2013; in particular, subsequences typically will be computed asynchronously
    as child tasks complete. Every view except the one emerging from the sync is destroyed
    after the merge. If any of the strands does not have an associated view, then the
    invocation of the <code>reduce</code> callback function can be elided (i.e., the
    missing view is treated as an identity).</p>
<p>A strand is never associated with more than one view for a given reducer, but multiple
    strands can be associated with the same view if those strands are not scheduled
    in parallel (at run time). Specifically, for a given reducer, the association of
    a strand to a view of the reducer obeys the following rules:</p>
<ol>
    <li>The strand that initializes the reducer is associated with the leftmost view.</li>
    <li>If two strands execute in series (i.e., both strands are part of a larger strand),
        then both are associated with the same view.</li>
    <li>The child strand of a spawn is associated with the same view as the strand that
        entered the spawn.</li>
    <li>If the continuation strand of a spawn is scheduled in parallel with the child, then
        the continuation strand is associated with a new view, initialized using <code>identity</code>.
        The implementation may create the new view at any time up until the first hyperobject
        lookup following the spawn. If the continuation strand does not perform a hyperobject
        lookup, then the implementation is not required to create a view for that strand.</li>
    <li>If the continuation strand of a spawn is not scheduled in parallel with the child
        strand (i.e., the child and the continuation execute in series), then the continuation
        strand is associated with the same view as the child strand.</li>
    <li>The strand that emerges from a sync is associated with the same view as the leftmost
        strand entering the sync.</li>
</ol>
<p>Even before the final reduction, the leftmost view of a reducer will contain the
    same value as in the serial execution. Other views, however, will contain partial
    values that are different from the serial execution.</p>
<p>If &#x2297; is not associative or if <code>identity</code> does not yield a true
    identity value then the result of a set of reductions will be non-deterministic
    (i.e., it will vary based on runtime scheduling). Such &#x201c;non-classical&#x201d;
    reducers are nevertheless occasionally useful. Note that, for a classical reducer,
    the &#x2297; operator needs to be associative, but does not need to be commutative.</p>


# Disclaimer and other legal information

<p>Copyright (c) 2020 Massachusetts Institute of Technology</p>

<p>Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal with the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:</p>

<p>The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.</p>

<p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.</p>

# Acknowledgements

<p> We gratefully acknowledge Intel Corporation for generously allowing this OpenCilk document to incorporate
material from the following Intel document number 324396-003USr, which may be available here: <a href=https://www.cilkplus.org/sites/default/files/open_specifications/Intel_Cilk_plus_lang_spec_1.2.htm>
    https://www.cilkplus.org/sites/default/files/open_specifications/Intel_Cilk_plus_lang_spec_1.2.htm</a></p>

<p>The OpenCilk project was sponsored in part by the United States Air Force Research Laboratory and was accomplished under Cooperative Agreement Number FA8750-19-2-1000.  The views and conclusions contained in this document are those of the authors and should not be interpreted as representing the official policies, either expressed or implied, of the United States Air Force or the U.S. Government.  The U.S. Government is authorized to reproduce and distribute reprints for Government purposes notwithstanding any copyright notation herein.</p>
