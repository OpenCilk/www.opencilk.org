---
layout: layouts/page.njk
author: Dorothy Curtis
stylesheet: language-specification.css
title: OpenCilk language specification
tagline: For people who need to know grammatical details about how Cilk is
  integrated with C.
date: 2022-07-14T21:37:03.433Z
tags:
  - Grammar
eleventyNavigation:
  key: Language specification
---
<h1 class="title">OpenCilk Language Extension Specification<br />
    Version 1.0 (2021-02-01) </h1>
<p>Copyright &#xa9; 2020, 2021, 2022 Massachusetts Institute of Technology. All rights reserved.</p>
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
    <li>Four keywords (<code>_Cilk_scope</code>, _Cilk_spawn</code>, <code>_Cilk_sync</code> and <code>_Cilk_for</code>)
        to express tasking</li>
    <li>Hyperobjects, which provide local views to shared objects</li>
</ol>
<p>An implementation of the language may take advantage of all parallelism resources
    available in the hardware. On a typical CPU, these include at least multiple cores
    and vector units. Some of the language constructs, e.g. <code>_Cilk_spawn</code>,
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
    <li><code>_Cilk_scope</code></li>
    <li><code>_Cilk_sync</code></li>
    <li><code>_Cilk_spawn</code></li>
    <li><code>_Cilk_for</code></li>
</ul>
<p>A program that uses these keywords other than as defined in the grammar extension
    below is ill-formed.</p>

## Keyword Aliases

<p>The header <code>&lt;cilk/cilk.h&gt;</code> defines the following aliases for the
    Cilk keywords:</p>
<pre>#define cilk_scope _Cilk_scope
#define cilk_spawn _Cilk_spawn
#define cilk_sync  _Cilk_sync
#define cilk_for   _Cilk_for</pre>

## Grammar

<p>The three keywords are used in the following new productions:</p>
<dl class="bnf">
    <dt><dfn>jump-statement</dfn>:</dt>
    <dd><code>_Cilk_sync ;</code></dd>
</dl>
<p>The call production of the grammar is modified to permit the keyword <code>_Cilk_spawn</code>
    before the expression denoting the function to be called:</p>
<dl class="bnf">
    <dt><dfn>postfix-expression</dfn>:</dt>
    <dd><code>_Cilk_spawn</code><sub>opt</sub> <var>postfix-expression</var> <code>(</code>
        <var>expression-list</var><sub>opt</sub> <code>)</code></dd>
</dl>
<p>Consecutive <code>_Cilk_spawn</code> tokens are not permitted. The <var>postfix-expression</var>
    following <code>_Cilk_spawn</code> is called a <dfn>spawned function</dfn>. <del>The
        spawned function may be a normal function call, a member-function call, or the function-call
        (parentheses) operator of a function object (functor) or a call to a lambda expression.</del>
    Overloaded operators other than the parentheses operator may be spawned only by
    using the function-call notation (e.g., <code>operator+(arg1,arg2)</code>). There
    shall be no more than one <code>_Cilk_spawn</code> within a full expression. A function
    that contains a spawn statement is called a <dfn>spawning function</dfn>.</p>
<p class="note">Note: The spawned function <ins>call</ins> may be a normal function
    call, a member-function call, the function-call (parentheses) operator of a function
    object (functor), or a call to a lambda expression.</p>
<p>A program is <del>considered</del> ill formed if the <code>_Cilk_spawn</code> form
    of this expression appears other than in one of the following contexts:</p>
<ul>
    <li>as the <del>entire body</del> <ins>full-expression</ins> of an expression statement,</li>
    <li>as the entire right hand side of an assignment expression that is the <del>entire
        body</del> <ins>full-expression</ins> of an expression statement, or</li>
    <li>as the entire <var>initializer-clause</var> in a simple declaration <ins>for an
        object with automatic storage duration</ins>.</li>
</ul>
<p><del>(A <code>_Cilk_spawn</code> expression may be permitted in more contexts in
    the future.)</del> <ins>The rank of a spawned function call shall be zero. (See <a
        href="#array.sect">The section expression</a>.)</ins></p>
<p>A statement with a <code>_Cilk_spawn</code> on the right hand side of an assignment
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
    <dd><var>grainsize-pragma</var><sub>opt</sub> <code>_Cilk_for (</code> <var>expression</var>
        <code>;</code> <var>expression</var> <code>;</code> <var>expression</var> <code>)</code>
        <var>statement</var></dd>
    <dd><var>grainsize-pragma</var><sub>opt</sub> <code>_Cilk_for (</code> <var>declaration</var>
        <var>expression</var> <code>;</code> <var>expression</var> <code>)</code> <var>statement</var></dd>
</dl>
<p><ins>The three items inside parentheses in the grammar, separated by semicolons,
    are called the <dfn>initialization</dfn>, <dfn>condition</dfn>, and <dfn>increment</dfn>,
    respectively. (A semicolon is included in the grammar of <var>declaration</var>.)</ins></p>

A new form of Statement is introduced:

_Cilk_scope { Statement* }

Statements within _Cilk_scope are executed as usual.  There is an implicit _Cilk_sync at the end of the statements included within _Cilk_scope.

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
<p><strong>The serializations of <code>_Cilk_spawn</code> and <code>_Cilk_sync</code>
    are empty.</strong></p>
<p>If an OpenCilk program has defined deterministic behavior, then that behavior is
    the same as the behavior of the C or C++ program derived from the original by removing
    all instances of the keywords <code>_Cilk_spawn</code>, and <code>_Cilk_sync</code>.</p>
<p><strong>The serialization of <code>_Cilk_for</code> is <code>for</code>.</strong></p>
<p>If an OpenCilk program has defined deterministic behavior, then that behavior is
    the same as the behavior of the C or C++ program derived from the original by replacing
    each instance of the <code>_Cilk_for</code> keyword with <code>for</code>.</p>

## <del>Spawning</del> <ins>Task</ins> blocks

<p>A <del>spawning</del> <ins>task</ins> block is a region of the program subject to
    special rules. Task blocks may be nested. The body of a nested task block is not
    part of the outer task block. Task blocks never partially overlap. The body of a
    spawning function is a task block. A <code>_Cilk_for</code> statement is a task
    block and the body of the <code>_Cilk_for</code> loop is a (nested) task block.</p>
<p>Every <del>spawning</del> <ins>task</ins> block includes an implicit <code>_Cilk_sync</code>
    executed on exit from the block, including abnormal exit due to an exception. Destructors
    for automatic objects with scope ending at the end of the task block are invoked
    before the implicit <code>_Cilk_sync</code>. The receiver is assigned or initialized
    to the return value before executing the implicit <code>_Cilk_sync</code> at the
    end of a function. An implicit or explicit <code>_Cilk_sync</code> within a nested
    task block will synchronize with <code>_Cilk_spawn</code> statements only within
    that task block, and not with <code>_Cilk_spawn</code> statements in the surrounding
    task block.</p>
<del>
    <p>The scope of a label defined in a spawning block is limited to that spawning block.</p>
    <p class="note">Programmer note: Therefore, <code>goto</code> may not be used to enter
        or exit a spawning block.</p>
</del>

## <code>_Cilk_for</code> Loops

<ins>
    <p>The constraints and semantics of a <code>_Cilk_for</code> loop are the same as those
        of its serialization, unless specified otherwise.</p>
    <p>Each iteration of a <code>_Cilk_for</code> loop is a separate strand; they need not
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

<p>To simplify the grammar, some restrictions on <code>_Cilk_for</code> loops are stated
    here in text form. <del>The three items inside parentheses in the grammar, separated
        by semicolons, are the <var>initialization</var>, <var>condition</var>, and <var>increment</var>.</del>
    <ins>Where a constraint on an expression is expressed grammatically, parentheses around
        a required expression or sub-expression are allowed.</ins></p>
<del>
    <p>A program that contains a <code>return</code>, <code>break</code>, or <code>goto</code>
        statement that would transfer control into or out of a <code>_Cilk_for</code> loop
        is ill-formed.</p>
</del>
<p>The initialization shall declare or initialize a single variable, called the <dfn>
    control variable</dfn>. In C only, the control variable may be previously declared,
    but if so shall be reinitialized, i.e., assigned, in the initialization clause.
    In C++, the control variable shall be declared and initialized within the initialization
    clause of the <code>_Cilk_for</code> loop. <ins>The variable shall have automatic storage
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
    out of a <code>_Cilk_for</code> loop is ill-formed.</p>

### Requirements on types and operators

<p><del>The type of <var>var</var> shall be copy constructible. (For the purpose of
    specification, all C types are considered copy constructible.)</del> <ins>The control
        variable shall have unqualified integral, pointer, or copy-constructible class type.</ins></p>
<p>The initialization, condition, and increment parts of a <code>_Cilk_for</code> shall
    <del>be defined such that the total number of iterations (loop count) can be determined
        before beginning the loop execution. Specifically, the parts of the <code>_Cilk_for</code>
        loop shall</del> meet all of the semantic requirements of the corresponding
    serial <code>for</code> statement. In addition, depending on the syntactic form
    of the condition, a <code>_Cilk_for</code> adds the following requirements on the
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
    that are not caught in the loop body, the <code>_Cilk_for</code> statement throws
    the exception that would have occurred first in the serialization of the program.</p>

### Grainsize pragma

<p>A <code>_Cilk_for</code> <var>iteration-statement</var> may optionally be preceded
    by a <var>grainsize-pragma</var>. The grainsize pragma shall immediately precede
    a <code>_Cilk_for</code> loop and may not appear anywhere else in a program, except
    that other pragmas that appertain to the <code>_Cilk_for</code> loop may appear
    between the <var>grainsize-pragma</var> and the <code>_Cilk_for</code> loop. The
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
    pragma applies only to the <code>_Cilk_for</code> statement that immediately follows
    it &#x2013; the grain sizes for other <code>_Cilk_for</code> statements are not
    affected.</p>

## Spawn

<p>The <code>_Cilk_spawn</code> keyword suggests to the implementation that an executed
    statement or part of a statement may be run in parallel with following statements.
    A consequence of this parallelism is that the program may exhibit undefined behavior
    not present in the serialization. Execution of a <code>_Cilk_spawn</code> keyword
    is called a <dfn>spawn</dfn>. Execution of a <code>_Cilk_sync</code> statement is
    called a <dfn>sync</dfn>. <del>A statement</del> <ins>An expression statement or declaration
        statement</ins> that contains a spawn is called a <dfn>spawning statement</dfn>.
    <ins>In a declaration containing a <code>_Cilk_spawn</code> keyword, the initialization
        of each object declared is treated as a separate statement.</ins></p>
<p>The <dfn><a id="deffollowingsync">following sync</a></dfn> of a <code>_Cilk_spawn</code>
    refers to the next <code>_Cilk_sync</code> executed (dynamically, not lexically)
    in the same task block. Which spawn the sync follows is implied from context. The
    following sync may be the implicit <code>_Cilk_sync</code> at the end of a task
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
    <li>The body of a <code>_Cilk_for</code> loop is a spawning statement with spawn point
        at the end of the loop condition test.</li>
    <li>An expression statement containing a single <code>_Cilk_spawn</code> has a spawn
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
<pre>x[g()] = _Cilk_spawn f(a + b);
a++;</pre>
	<p>The call to function <code>f</code> is the spawn point and the statement <code>a++;</code>
		is the continuation. The expression <code>a + b</code> and the initialization of
		the temporary variable holding that value, and the evaluation of <code>x\\\\[g()]</code>
		take place before the spawn point. The execution of <code>f</code>, the assignment
		to <code>x\\\\[g()]</code>, and the destruction of the temporary variable holding <code>
			a + b</code> take place in the child.</p>
	<p>If a statement is followed by an implicit sync, that sync is the spawn continuation.</p>
	<p class="note">Programmer note: The sequencing may be more clear if</p>
	<pre>x[g()] = _Cilk_spawn f(a + b);</pre>
	<p class="note">is considered to mean</p>
	<pre>{
	// <em>Evaluate arguments and receiver address before spawn point</em>
	T tmp = a + b; // <em>T is the type of a + b</em>
	U &amp;r = x[g()]; // <em>U is the type of x[0]</em>
	_Cilk_spawn { r = f(tmp); tmp.~T(); }
}</pre>
	<p>A <code>setjmp</code>/<code>longjmp</code> call pair within the same task block has
		undefined behavior if a spawn or sync is executed between the <code>setjmp</code>
		and the <code>longjmp</code>. A <code>setjmp</code>/<code>longjmp</code> call pair
		that crosses a task block boundary has undefined behavior. A <code>goto</code> statement
		is not permitted to enter or exit a task block.</p>

## Sync

<p>A sync statement indicates that all children of the current task block must finish
    executing before execution may continue within the task block. The new strand coming
    out of the <code>_Cilk_sync</code> is not running in parallel with any child strands,
    but may still be running in parallel with parent and sibling strands (other children
    of the calling function).</p>
<p>There is an implicit sync at the end of every task block. If a spawning statement
    appears within a try block, a sync is implicitly executed <del>at the end of</del>
    <ins>on exit from</ins> that try block, as if the body of the try were a task block.
    If a task block has no children at the time of a sync, then the sync has no observable
    effect. (The compiler may elide an explicit or implicit sync if it can statically
    determine that the sync will have no observable effect.)</p>
<p class="note">Programmer note: Because implicit syncs follow destructors, writing
    <code>_Cilk_sync</code> at the end of a function may produce a different effect
    than the implicit sync. In particular, if an assignment spawn or initializer spawn
    is used to modify a local variable, the function will generally need an explicit
    <code>_Cilk_sync</code> to avoid a race between assignment to the local variable
    by the spawned function and destruction of the local variable by the parent function.</p>

## Exceptions

<p>There is an implicit <code>_Cilk_sync</code> before a <del><code>throw</code>, after
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
    the implicit spawns and syncs within a <code>_Cilk_for</code> loop). The identity
    (address) of the view does not change within a single strand. The view of a given
    hyperobject visible within a given strand is said to be <dfn>associated</dfn> with
    that view. A hyperobject has the same view before the first spawn within a task
    block as after a sync within the same task block, even though the thread ID may
    not be the same (i.e., hyperobject views are not tied to threads). A hyperobject
    has the same view upon entering and leaving a <code>_Cilk_for</code> loop and within
    the first iteration (at least) of the <code>_Cilk_for</code> loop. A special view
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
    <code>_Cilk_for</code> body can append items onto the view of a list reducer with
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

## Hyperobjects in C++

### C++ hyperobject syntax

<del>
    <p class="note">Note: The syntax described here is the syntax used in the Intel products.
        Intel is considering a different syntax for future, either in addition to or instead
        of the syntax described below.</p>
</del>
<p>At present, reducers <ins>and holders</ins> are the only kind of hyperobject supported.
    In C++, every reducer <del>hyperobject has a hyperobject type, which</del> <ins>type</ins>
    is an instantiation of the <code>cilk::reducer</code> class template<ins>, which is
        defined in the header <code>&lt;cilk/reducer.h&gt;</code></ins>. The <code>cilk::reducer</code>
    class template has a single template type parameter, <code>Monoid</code>, which
    shall be a class type. <ins>(See <a href="#hyper.cpp.monoid">C++ Monoid class requirements</a>,
        below.)</ins></p>
<p>For a given monoid, <var>M</var>, the type <code>cilk::reducer&lt;</code><var>M</var><code>&gt;</code>
    defines a hyperobject type. The <code>cilk::reducer</code> class template provides
    <del>constructors, a destructor, and</del> (<code>const</code> and non-<code>const</code>
    versions of) <del><code>value_type&amp; operator()</code></del> <ins><code>operator*()</code></ins>
    and <code><del>value_type&amp; </del>view()</code>, both of which return <del>a</del>
    <ins>an lvalue</ins> reference to the current view<ins>, and <code>operator-&gt;()</code>,
        which returns the address of the current view</ins>.</p>
<p>A <del>hyperobject</del> <ins>reducer</ins> is created by defining an instance of
    <code>cilk::reducer&lt;</code><var>M</var><code>&gt;</code>:</p>
<pre>cilk::reducer&lt;<var>M</var>&gt; hv(<var>args</var>);</pre>
<p>Where <var>args</var> is a list of <var>M</var><code>::<del>value</del><ins>view</ins>_type</code>
    constructor arguments used to initialize the leftmost view of <code>hv</code>. A
    hyperobject lookup is performed by invoking the member function, <code>view()</code>
    or member <code>operator<ins>*</ins>()</code> <ins>or <code>operator-&gt;()</code></ins>
    on the hyperobject, as in the following examples:</p>
<pre>hv.view().append(elem);
<ins>(*hv).append(elem);</ins>
<ins>hv-&gt;append(elem);</ins><del> hv().append(elem);</del></pre>
	<p>In these examples, <code>append</code> is an operation to be applied to the current
		view of <code>hv</code>, and is presumably consistent with the associative operation
		defined in the monoid, <var>M</var>.</p>
	<p>Modifying a hyperobject view in a way that is not consistent with the associative
		operation in the monoid can lead to subtle bugs. For example, addition is not associative
		with multiplication, so performing a multiplication on the view of a summing reducer
		will almost certainly produce incorrect results. To prevent this kind of error,
		it is <del>common to wrap reducers in proxy classes that expose</del> <ins>possible
			for the monoid to define a separate <code>view_type</code> class that wraps the
			<code>value_type</code> and exposes</ins> only the valid associative operations.
		<ins>(See <a href="#hyper.cpp.monoid">Monoid</a> and <a href="#hyper.cpp.view">View</a>
			class requirements, below.)</ins> All of the reducers included in the standard
		reducer library have such wrappers.</p>

### <ins>C++ <code>reducer</code> class template</ins>

<p><ins>Where the below table indicates that the signature of a function includes the
    form <code>Args&amp;&amp;...</code>, in an implementation that supports C++ variadic
    templates, the function shall be defined as a variadic function template. In an
    implementation that does not support variadic templates, the function shall be defined
    as a set of templates taking from 0 to N arguments of type <code>const Arg &amp;</code>,
    where N is at least 4.</ins></p>
<ins>
    <table border="1">
        <thead>
            <tr>
                <th>Member</th>
                <th>Purpose</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <pre>typename Monoid</pre>
                </td>
                <td>Template parameter</td>
            </tr>
            <tr>
                <td>
                    <pre>typedef
typename Monoid::value_type
value_type;</pre>
                </td>
                <td>Typedef for the type of the data being reduced.</td>
            </tr>
            <tr>
                <td>
                    <pre>typedef
typename Monoid::view_type
view_type;</pre>
                </td>
                <td>Typedef for the type actually returned by a hyperobject lookup. <code>view_type</code>
                    can be the same as <code>value_type</code> (see below).</td>
            </tr>
            <tr>
                <td>
                    <pre>template&lt;typename... <var>Args</var>&gt;
reducer(const <var>Args</var>&amp;&amp;... <var>args</var>);</pre>
                </td>
                <td>Default-initialize the monoid and construct the leftmost view using constructor
                    arguments, <var>args</var>.</td>
            </tr>
            <tr>
                <td>
                    <pre>template&lt;typename... <var>Args</var>&gt;
reducer(const Monoid&amp; <var>m</var>,
const Args&amp;&amp;... <var>args</var>);</pre>
                </td>
                <td>Initialize the monoid from <var>m</var> and construct the leftmost view using constructor
                    arguments, <var>args</var>. This constructor is useful only for the rare monoid
                    type that contains state. The monoid state is shared by all views of the reducer.
                </td>
            </tr>
            <tr>
                <td>
                    <pre>Monoid&amp; monoid();
Monoid const&amp; monoid() const;</pre>
                </td>
                <td>Return the monoid instance for this reducer. The same monoid instance is returned
                    for a given reducer regardless of which strand invoked this accessor. This accessor
                    is useful only for the rare monoid type that contains state.</td>
            </tr>
            <tr>
                <td>
                    <pre>view_type&amp; view();
view_type&amp; view() const;</pre>
                </td>
                <td>Return an lvalue reference to the current view (i.e., the view associated with the
                    currently-executing strand).</td>
            </tr>
            <tr>
                <td>
                    <pre>void move_in(value_type&amp; <var>obj</var>);</pre>
                </td>
                <td>Replace the value in the current view with <var>obj</var>. The value of <var>obj</var>
                    after this operation is unspecified. Note that using this operation in parallel
                    with other operations on the same reducer will cause the final reducer value to
                    be indeterminate.</td>
            </tr>
            <tr>
                <td>
                    <pre>void move_out(value_type&amp; <var>obj</var>);</pre>
                </td>
                <td>Replace the value of <var>obj</var> with the value of the current view. The value
                    of the view after this operation is unspecified. Note that using this operation
                    in parallel with other operations on the same reducer will place an indeterminate
                    value in <var>obj</var> and cause the final reducer value to be indeterminate.
                </td>
            </tr>
            <tr>
                <td>
                    <pre>void set_value(const value_type&amp; <var>obj</var>);</pre>
                </td>
                <td>Replace the value in the current view with <var>obj</var>. Note that using this
                    operation in parallel with other operations on the same reducer will cause the final
                    reducer value to be indeterminate.</td>
            </tr>
            <tr>
                <td>
                    <pre><var>type</var> get_value() const;</pre>
                </td>
                <td>Return the value of the current view. Note that using this operation in parallel
                    with other operations on the same reducer will return an indeterminate value. The
                    return type is <code>const value_type&amp;</code> if <code>view_type</code> is identical
                    to <code>value_type</code>; otherwise the return value is the same as that returned
                    by <code>view_type::view_get_value()</code>.</td>
            </tr>
        </tbody>
    </table>
</ins>

### <ins>C++ Monoid class requirements</ins>

<p>To define a reducer, a program defines a monoid class with public members representing
    the monoid, (<var>T</var>, &#x2297;, <var>identity</var>) as follows:</p>
<table border="1">
    <thead>
        <tr>
            <th><ins>Member name/signature</ins></th>
            <th><ins>Purpose</ins></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <pre>value_type</pre>
            </td>
            <td>typedef for <var>T</var><ins>, the type of the data being reduced</ins></td>
        </tr>
        <tr>
            <td><ins>
                <pre>view_type</pre>
            </ins></td>
            <td><ins>typedef for the type actually returned by a hyperobject lookup. <code>view_type</code>
                can be the same as <code>value_type</code> (see below).</ins> </td>
        </tr>
        <tr>
            <td>
                <pre>reduce(value_type* <var>left</var>,
value_type* <var>right</var>)</pre>
            </td>
            <td>evaluate &#x201c;<code>*</code><var>left</var> <code>= *</code><var>left</var> &#x2297;
                <code>*</code><var>right</var>&#x201d;</td>
        </tr>
        <tr>
            <td>
                <pre>identity(value_type* <var>p</var>)</pre>
            </td>
            <td>construct <var>identity</var> object at <code>*</code><var>p</var></td>
        </tr>
        <tr>
            <td>
                <pre>destroy(value_type* <var>p</var>)</pre>
            </td>
            <td>call the destructor on the object <code>*</code><var>p</var></td>
        </tr>
        <tr>
            <td>
                <pre>allocate(size_t <var>size</var>)</pre>
            </td>
            <td>return a pointer to <var>size</var> bytes of raw memory<ins>; return type shall
                be <code>void*</code></ins></td>
        </tr>
        <tr>
            <td>
                <pre>deallocate(<del>value_type</del> <ins>void</ins>* <var>p</var>)</pre>
            </td>
            <td>deallocate the raw memory at <code>*</code><var>p</var><ins>, where <var>p</var>
                is a value returned by a previous call to <code>allocate</code></ins></td>
        </tr>
    </tbody>
</table>
<p>If any of the above functions do not modify the state of the monoid (most monoids
    carry no state), then those functions may be declared <code>static</code> or <code>const</code>.
    The monoid type may derive from an instantiation of <code>cilk::monoid_base&lt;<var>T</var><ins>,<var>V</var></ins>&gt;</code>,
    which defines <code>value_type</code> <ins>and <code>view_type</code> as aliases for
        <code><var>T</var></code> and <code><var>V</var></code>, respectively (where <code><var>
            V</var></code> defaults to <code><var>T</var></code>),</ins> and provides
    default implementations for <code>identity</code>, <code>destroy</code>, <code>allocate</code>,
    and <code>deallocate</code>. The derived class needs to define <code>reduce</code>
    and <del>override only</del> those functions for which the default is incorrect.</p>

### <ins>C++ View class requirements</ins>

<p><ins>By default, <code>view_type</code> is the same as <code>value_type</code>. Commonly,
    however, it is a wrapper around <code>value_type</code> that presents a more limited
    interface in order to achieve a measure of static safety. For example, for a summing
    reducer, <code>view_type</code> might support <code>+=</code> and <code>++</code>
    but not operations like <code>*=</code> that are inconsistent with a summing reduction.
    Other times, <code>view_type</code> holds a more complex type that allows for more
    efficient reduction operations.</ins></p>
<p><ins>When <code>view_type</code> is identical to <code>value_type</code> the reducer
    imposes no further requirements on it beyond those already required by the <code>identity</code>
    and <code>reduce</code> operations in the monoid.</ins></p>
<p><ins>When <code>view_type</code> differs from <code>value_type</code>, then <code>
    view_type</code> must provide the following member functions:</ins></p>
<table border="1">
    <thead>
        <tr>
            <th>Signature</th>
            <th>Purpose</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><ins>
                <pre>view_move_in(value_type&amp; <var>v</var>)</pre>
            </ins></td>
            <td><ins>Clear the existing contents of the view and replace it with the value <var>
                v</var>. After calling this function, the new value of <var>v</var> is unspecified
                (but valid).</ins></td>
        </tr>
        <tr>
            <td><ins>
                <pre>view_move_out(value_type&amp; <var>v</var>)</pre>
            </ins></td>
            <td><ins>Move the value of the view into <var>v</var>. After calling this function,
                the new value of the view is unspecified.</ins></td>
        </tr>
        <tr>
            <td><ins>
                <pre>view_set_value(const value_type&amp; <var>v</var>)</pre>
            </ins></td>
            <td><ins>Set the value of the view to <var>v</var>.</ins></td>
        </tr>
        <tr>
            <td><ins>
                <pre>view_get_value() const</pre>
            </ins></td>
            <td><ins>Return the value of the view, either as an rvalue or as a const lvalue.</ins>
            </td>
        </tr>
    </tbody>
</table>

### C++ hyperobject behavior

<p>An object of type <var>M</var><code>::value_type</code> is constructed by the <code>
    reducer</code> constructor. This object is called the initial view or leftmost view
    of the hyperobject. When a hyperobject goes out of scope, the destructor is called
    on the leftmost view. It is unspecified whether <var>M</var><code>::allocate</code>
    and <var>M</var><code>::deallocate</code> are called to allocate and deallocate
    the leftmost view (they are not called in the current Intel implementation).</p>
<p>The implementation may create a view at any spawn that has been scheduled in parallel,
    or may lazily defer creation until the first access within a strand. The implementation
    creates a view by calling <var>M</var><code>::allocate</code> followed by <var>M</var><code>::identity</code>.
    (This is in addition to the initial view created by construction of the hyperobject.)
    The calls to <var>M</var><code>::allocate</code> and <var>M</var><code>::identity</code>
    are part of the strand for the purpose of establishing the absence of a data race.</p>
<p>At any sync or at the end of any spawned (child) function, the runtime may merge
    two views by calling <var>M</var><code>::reduce(</code><var>left</var><code>,</code>
    <var>right</var><code>)</code>, where <var>right</var> is the earliest remaining
    view that is later than <var>left</var>. The <var>M</var><code>::reduce</code> function
    is expected to store the merged result in the <var>left</var> view. After the merge,
    the runtime destroys the <var>right</var> view by calling <var>M</var><code>::destroy</code>
    followed by <var>M</var><code>::deallocate</code>. Every view except the leftmost
    view is passed exactly once as the second argument to <code>reduce</code>. The calls
    to <var>M</var><code>::reduce</code>, <var>M</var><code>::destroy</code> and <var>M</var><code>::deallocate</code>
    happen after completion of both of the strands that formerly owned the left and
    right views.</p>
<p>If a monoid member function executes a hyperobject lookup (directly or through a
    function call), the behavior of the program is undefined.</p>
<p>For purposes of establishing the absence of a data race, a hyperobject view is considered
    a distinct object in each parallel strand. A hyperobject lookup is considered a
    read of the hyperobject.</p>

## Hyperobjects in C

### C hyperobject syntax

<del>
    <p class="note">Note: The syntax described here is the syntax used in the Intel products.
        Intel is considering a different syntax for future, either in addition to or instead
        of the syntax described below.</p>
</del>
<p>The C mechanism for defining and using hyperobjects depends on a small number of
    typedefs and preprocessor macros provided in the <del>Cilk library</del> <ins>header
        <code>&lt;cilk/reducer.h&gt;</code></ins>. C does not have the template capabilities
    of C++ and thus has a less abstract hyperobject syntax. Unlike C++, each C hyperobject
    variable is unique &#x2013; there is no named type that unites similar hyperobjects.
    There is, however, an implicit &#x201c;hyperobject type&#x201d; defined by the operations
    that comprise the hyperobjects' monoid. The provided macros facilitate creating
    reducer variables, which are the only type of hyperobject currently supported. The
    terms &#x201c;reducer&#x201d; and &#x201c;hyperobject&#x201d; are used interchangeably
    in this section.</p>
<p>To define a C reducer, the program defines three functions representing operations
    on a monoid (<var>T</var>, &#x2297;, <var>identity</var>):</p>
<pre>void <var>T_reduce</var>(void* <var>r</var>, void* <var>left</var>, void* <var>right</var>);
void <var>T_identity</var>(void* <var>r</var>, void* <var>view</var>);
void <var>T_destroy</var>(void* <var>r</var>, void* <var>view</var>);</pre>
	<p>The names of these functions are for illustration purposes only and must be chosen,
		as usual, to avoid conflicts with other identifiers. The purposes of these functions
		are as follows:</p>
	<table border="1">
		<thead>
			<tr>
				<th><ins>Function tag</ins></th>
				<th><ins>Purpose</ins></th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><var>T_reduce</var></td>
				<td>Evaluate &#x201c;<code>\\\\*(T\\\\*)</code><var>left</var> <code>= \\\\*(T\\\\*)</code> <var>left</var>
					&#x2297; <code>\\\\*(T\\\\*)</code> <var>right</var>&#x201d;</td>
			</tr>
			<tr>
				<td><var>T_identity</var></td>
				<td>Initialize a <var>T</var> value to <var>identity</var></td>
			</tr>
			<tr>
				<td><var>T_destroy</var></td>
				<td>Clean up (destroy) a <var>T</var> value</td>
			</tr>
		</tbody>
	</table>
	<p>The <var>r</var> argument to each of these functions is a pointer to the actual reducer
		variable and is usually ignored. Since most C types do not require cleanup on destruction,
		the <var>T_destroy</var> function often does nothing. As a convenience, the Cilk
		library makes this common implementation available as a library function, <code>__cilkrts_hyperobject_noop_destroy</code>.</p>
	<p>A reducer, <code>hv</code>, is defined and given an initial value, <var>init</var>,
		using the <code>CILK_C_DECLARE_REDUCER</code> and <code>CILK_C_INIT_REDUCER</code>
		macros as follows:</p>
	<pre>CILK_C_DECLARE_REDUCER(<var>T</var>) hv =
	CILK_C_INIT_REDUCER(<var>T_identity</var>, <var>T_reduce</var>, <var>T_destroy</var>,
		<var>init</var>);</pre>
	<p>The <var>init</var> expression is used to initialize the leftmost reducer view. The
		<code>CILK_C_DECLARE_REDUCER</code> macro defines a <code>struct</code> and can
		be used in a <code>typedef</code> or <code>extern</code> declaration as well:</p>
	<pre>extern CILK_C_DECLARE_REDUCER(<var>T</var>) hv;</pre>
	<p>The <code>CILK_C_INIT_REDUCER</code> macro expands to a static initializer for a
		hyperobject of any type. After initialization, the leftmost view of the reducer
		is available as <var>hv</var><code>.value</code>.</p>
	<p><del>If</del> <ins>The behavior is undefined if</ins> a reducer <del>is local to
		a function, it shall be</del> <ins>with automatic storage duration is not</ins>
		registered before first use using the <code>CILK_C_REGISTER_REDUCER</code> macro
		and unregistered after its last use using the <code>CILK_C_UNREGISTER_REDUCER</code>
		macro:</p>
	<pre>CILK_C_REGISTER_REDUCER(<var>hv</var>);
<em>/* use hv here */</em>
CILK_C_UNREGISTER_REDUCER(<var>hv</var>);</pre>
	<p>For the purpose of registration and unregistration, <dfn>first use</dfn> and <dfn>
		last use</dfn> are defined with respect to the serialization of the program. <ins>If</ins>
		the reducer view immediately before unregistration <del>shall be</del> <ins>is not</ins>
		the same (<ins>does not</ins> have the same address) as the reducer view immediately
		after registration, <ins>the behavior is undefined</ins>. In practice, this means
		that any spawns after the registration have been synced before the unregistration
		and that no spawns before the registration have been synced before the unregistration.
		Registration and unregistration are optional for reducers declared in global scope.
		The <code>value</code> member of the reducer continues to be available after unregistration,
		but a hyperobject lookup on an unregistered reducer results in undefined behavior
		unless the reducer is registered again.</p>
	<p>A hyperobject lookup is performed using the <code>REDUCER_VIEW</code> macro:</p>
	<pre>REDUCER_VIEW(<var>hv</var>) += <var>expr</var>;</pre>
	<p>As in the case of a C++ reducer, modifying a reducer other than through the correct
		associative operations can cause bugs. Unfortunately, C does not have sufficient
		abstraction mechanisms to prevent this kind of error. Nevertheless, the Cilk library
		provides wrapper macros to simplify the declaration and initialization, though not
		the safety, of library-provided reducers in C. For example, you can define and initialize
		a summing reducer this way:</p>
	<pre>CILK_C_DECLARE_REDUCER(long) hv =
	REDUCER_OPADD_INIT(long, 0);</pre>
	<p>A C reducer can be declared, defined, and accessed within C++ code, but a C++ reducer
		cannot be used within C code.</p>

### C hyperobject behavior

<p>The macro <code>CILK_C_DECLARE_REDUCER(<var>T</var>)</code> defines a <code>struct</code>
    with a data member of type <var>T</var>, named <code>value</code>. The macro <code>CILK_C_INIT_REDUCER(<ins><var>T</var>,</ins><var>I</var>,<var>R</var>,<var>D</var>,<var>V</var>)</code>
    expands to a <var>braced-init-list</var> appropriate for initializing a variable,
    <var>hv</var>, of structure type declared with <code>CILK_C_DECLARE_REDUCER(<var>T</var>)</code>
    such that <var>hv</var>, can be recognized by the runtime system as a C reducer
    with value type <var>T</var>, identity function <var>I</var>, reduction function
    <var>R</var>, destroy function <var>D</var>, and initial value <var>V</var>.</p>
<p>Invoking <code>CILK_C_REGISTER_REDUCER(<var>hv</var>)</code> makes a call into the
    runtime system that registers <var>hv</var><code>.value</code> as the initial, or
    leftmost, view of the C hyperobject <var>hv</var>. The macro <code>CILK_C_UNREGISTER_REDUCER(<var>hv</var>)</code>
    makes a call into the runtime system that removes hyperobject <var>hv</var> from
    the runtime system's internal map. Attempting to access <var>hv</var> after it has
    been unregistered will result in undefined behavior. If a hyperobject is never registered,
    the leftmost view will be associated with the program strand before the very first
    spawn in the program and will follow the leftmost branch of the execution DAG. This
    association is typically useful only for hyperobjects in global scope.</p>
<p>The implementation may create a view at <del>any spawn</del> <ins>the start of any
    strand</ins> that has been scheduled in parallel, or may lazily defer creation until
    the first access within a strand. The implementation creates a view by allocating
    it with <code>malloc</code>, then calling the identity function specified in the
    reducer initialization. (This is in addition to the initial view created by construction
    of the reducer.) The call to the identity function is part of the strand for the
    purpose of establishing the absence of a data race.</p>
<p>At any sync or at the end of any spawned (child) function, the runtime may merge
    two views by calling the reduction function (specified in the reducer initialization)
    on the values <var>left</var> and <var>right</var>, where <var>right</var> is the
    earliest remaining view that is later than <var>left</var>. The reduction function
    is expected to store the merged result in the <var>left</var> view. After the merge,
    the runtime destroys the <var>right</var> view by calling the destroy function for
    the hyperobject, then deallocates it using <code>free</code>. Every view except
    the leftmost view is passed exactly once as the second argument the reduction function.
    The calls to reduction and destroy functions happen after completion of both of
    the strands that formerly owned the left and right views.</p>
<p>If a monoid function executes a hyperobject lookup, the behavior of the program is
    undefined.</p>
<p>For purposes of establishing the absence of a data race, a hyperobject view is considered
    a distinct object in each parallel strand. A hyperobject lookup is considered a
    read of the hyperobject.</p>
<hr />

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