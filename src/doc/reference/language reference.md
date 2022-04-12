---
title: OpenCilk language specification
eleventyNavigation:
  key: Language specification
---

Here is content from https://cilk.mit.edu/docs/OpenCilkLanguageExtensionSpecification.htm, converted from HTML to markdown. There are glitches in the transformation, so this is a work in progress. For purposes of comparison, [here is the same language reference](/doc/reference/lang-ref-html/), but based on the HTML without going through a conversion to markdown.


Copyright © 2020, 2021 Massachusetts Institute of Technology. All rights
reserved.

More information about OpenCilk can be found at
[opencilk.org](https://opencilk.org)

Feedback on this specification is encouraged and welcome; please send to
<contact@opencilk.org>


# <span id="intro">Introduction</span>

This document is one of a set of technical specifications describing the
OpenCilk language and the run-time support for the language. Together,
these documents provide the detail needed to implement a compliant
compiler. At this time the following specifications are available:

  - The OpenCilk Language Specification, this document
  - The OpenCilk Application Binary Interface

This document defines the OpenCilk extension to C and C++. The language
extension is supported by a run-time user-mode work-stealing task
scheduler which is not directly exposed to the application programmer.
However, some of the semantics of the language and some of the
guarantees provided require specific behavior of the task scheduler. The
programmer visible parts of the language include the following
constructs:

1.  Three keywords (`_Cilk_spawn`, `_Cilk_sync` and `_Cilk_for`) to
    express tasking
2.  Hyperobjects, which provide local views to shared objects

An implementation of the language may take advantage of all parallelism
resources available in the hardware. On a typical CPU, these include at
least multiple cores and vector units. Some of the language constructs,
e.g. `_Cilk_spawn`, utilize only core parallelism; some, e.g. SIMD
loops, utilize only vector parallelism, and some, e.g. SIMD-enabled
functions, utilize both. The defined behavior of every deterministic
Cilk program is the same as the behavior of a similar C or C++ program
known as the “serialization.” While execution of a C or C++ program may
be considered as a linear sequence of statements, execution of a tasking
program is in general a directed acyclic graph. Parallel control flow
may yield a new kind of undefined behavior, a “data race,” whereby parts
of the program that may execute in parallel access the same memory
location in an indeterminate order, with at least one of the accesses
being a write access. In addition, ~~throwing~~
<span class="underline">if</span> an exception ~~may result in~~
<span class="underline">is thrown,</span> code ~~being~~
<span class="underline">may still be</span> executed that would not have
been executed in a serial execution.

<span class="underline">The word “shall” is used in this specification
to express a diagnosable constraint on a Cilk Plus program.</span>

# <span id="docs">Related documents</span>

1.  The OpenCilk Application Binary Interface
2.  ISO/IEC 9899:2011, Information Technology – Programming languages –
    C
3.  ISO/IEC 14882:2011, Information Technology – Programming languages –
    C++
4.  <span class="underline">OpenMP Application Program Interface,
    Version 4.0 - July 2013</span>

# <span id="keywd">Keywords for Tasking</span>

OpenCilk adds the following new keywords:

  - `_Cilk_sync`
  - `_Cilk_spawn`
  - `_Cilk_for`

A program that uses these keywords other than as defined in the grammar
extension below is ill-formed.

## <span id="keywd.alias">Keyword Aliases</span>

The header `<cilk/cilk.h>` defines the following aliases for the Cilk
keywords:

    #define cilk_spawn _Cilk_spawn
    #define cilk_sync  _Cilk_sync
    #define cilk_for   _Cilk_for

## <span id="keywd.gram">Grammar</span>

The three keywords are used in the following new productions:

  - jump-statement:  
    `_Cilk_sync ;`

The call production of the grammar is modified to permit the keyword
`_Cilk_spawn` before the expression denoting the function to be called:

  - postfix-expression:  
    `_Cilk_spawn`<sub>opt</sub> postfix-expression `(`
    expression-list<sub>opt</sub> `)`

Consecutive `_Cilk_spawn` tokens are not permitted. The
postfix-expression following `_Cilk_spawn` is called a spawned function.
~~The spawned function may be a normal function call, a member-function
call, or the function-call (parentheses) operator of a function object
(functor) or a call to a lambda expression.~~ Overloaded operators other
than the parentheses operator may be spawned only by using the
function-call notation (e.g., `operator+(arg1,arg2)`). There shall be no
more than one `_Cilk_spawn` within a full expression. A function that
contains a spawn statement is called a spawning function.

Note: The spawned function <span class="underline">call</span> may be a
normal function call, a member-function call, the function-call
(parentheses) operator of a function object (functor), or a call to a
lambda expression.

A program is ~~considered~~ ill formed if the `_Cilk_spawn` form of this
expression appears other than in one of the following contexts:

  - as the ~~entire body~~
    <span class="underline">full-expression</span> of an expression
    statement,
  - as the entire right hand side of an assignment expression that is
    the ~~entire body~~ <span class="underline">full-expression</span>
    of an expression statement, or
  - as the entire initializer-clause in a simple declaration
    <span class="underline">for an object with automatic storage
    duration</span>.

~~(A `_Cilk_spawn` expression may be permitted in more contexts in the
future.)~~ <span class="underline">The rank of a spawned function call
shall be zero. (See [The section expression](#array.sect).)</span>

A statement with a `_Cilk_spawn` on the right hand side of an assignment
or declaration is called an <span id="defassignspawn">assignment
spawn</span> or initializer spawn, respectively and the object assigned
or initialized by the spawn is called the receiver.

The iteration-statement is extended by adding another form of `for`
loop:

  - grainsize-pragma:  
    `# pragma cilk grainsize =` expression new-line

<!-- end list -->

  - iteration-statement:  
    grainsize-pragma<sub>opt</sub> `_Cilk_for (` expression `;`
    expression `;` expression `)` statement
    grainsize-pragma<sub>opt</sub> `_Cilk_for (` declaration expression
    `;` expression `)` statement

<span class="underline">The three items inside parentheses in the
grammar, separated by semicolons, are called the initialization,
condition, and increment, respectively. (A semicolon is included in the
grammar of declaration.)</span>

## <span id="keywd.seman">Semantics</span>

### <span id="keywd.seman.model">Tasking Execution Model</span>

A strand is a serially-executed sequence of instructions that does not
contain a spawn point or sync point (as defined below). At a spawn
point, one strand (the initial strand) ends and two strands (the new
strands) begin. The initial strand ~~runs in series with~~
<span class="underline">is sequenced before</span> each of the new
strands but the new strands <span class="underline">are unsequenced with
respect to one another (i.e. they</span> may run in parallel with each
other<span class="underline">)</span>. At a sync point, one or more
strands (the initial strands) end and one strand (the new strand)
begins. The initial strands ~~may run in parallel with one another~~
<span class="underline">are unsequenced with respect to one
another</span> but each of the initial strands ~~runs in series with~~
<span class="underline">is sequenced before</span> the new strand. A
single strand can be subdivided into a sequence of shorter strands in
any manner that is convenient for modeling the computation. A maximal
strand is one that cannot be included in a longer strand.

The strands in an execution of a program form a directed acyclic graph
(DAG) in which spawn points and sync points comprise the vertices and
the strands comprise the directed edges, with time defining the
direction of each edge. (In an alternative DAG representation, sometimes
seen in the literature, the strands comprise the vertices and the
dependencies between the strands comprise the edges.)

### <span id="keywd.seman.serial">Serialization rule</span>

The behavior of a deterministic OpenCilk program is defined in terms of
its serialization, as defined in this section. If the serialization has
undefined behavior, the OpenCilk program also has undefined behavior.

The strands in an execution of a program are ordered according to the
order of execution of the equivalent code in the program's
serialization. Given two strands, the earlier strand is defined as the
strand that would execute first in the serial execution of the same
program with the same inputs, even though the two strands may execute in
either order or concurrently in the actual parallel execution.
Similarly, the terms “earliest,” “latest,” and “later” are used to
designate strands according to their serial ordering. The terms “left,”
“leftmost,” “right,” and “rightmost” are equivalent to “earlier,”
“earliest,” “later,” and “latest,” respectively.

**The serialization of a pure C or C++ program is itself.**

If a C or C++ program has defined behavior and does not use the tasking
keywords or library functions, it is an OpenCilk with the same defined
behavior.

**The serializations of `_Cilk_spawn` and `_Cilk_sync` are empty.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by removing all instances of the keywords
`_Cilk_spawn`, and `_Cilk_sync`.

**The serialization of `_Cilk_for` is `for`.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by replacing each instance of the `_Cilk_for` keyword
with `for`.

## <span id="keywd.block">~~Spawning~~ <span class="underline">Task</span> blocks</span>

A ~~spawning~~ <span class="underline">task</span> block is a region of
the program subject to special rules. Task blocks may be nested. The
body of a nested task block is not part of the outer task block. Task
blocks never partially overlap. The body of a spawning function is a
task block. A `_Cilk_for` statement is a task block and the body of the
`_Cilk_for` loop is a (nested) task block.

Every ~~spawning~~ <span class="underline">task</span> block includes an
implicit `_Cilk_sync` executed on exit from the block, including
abnormal exit due to an exception. Destructors for automatic objects
with scope ending at the end of the task block are invoked before the
implicit `_Cilk_sync`. The receiver is assigned or initialized to the
return value before executing the implicit `_Cilk_sync` at the end of a
function. An implicit or explicit `_Cilk_sync` within a nested task
block will synchronize with `_Cilk_spawn` statements only within that
task block, and not with `_Cilk_spawn` statements in the surrounding
task block.

The scope of a label defined in a spawning block is limited to that
spawning block.

Programmer note: Therefore, `goto` may not be used to enter or exit a
spawning block.

## <span id="keywd.loops">`_Cilk_for` Loops</span>

The constraints and semantics of a `_Cilk_for` loop are the same as
those of its serialization, unless specified otherwise.

Each iteration of a `_Cilk_for` loop is a separate strand; they need not
be executed serially.

Within each iteration of the loop body, ~~the control variable is
considered a unique variable whose address is no longer valid when the
iteration completes.~~ <span class="underline">the name of the control
variable refers to a local object, as if the name were declared as an
object within the body of the loop, with automatic storage duration and
with the type of the original object.</span> If the control variable is
declared before the loop initialization, then ~~the address of the
variable at the end of the loop is the same as the address of the
variable before the loop initialization and~~ the
<span class="underline">final</span> value of the control variable is
the same as for the serialization of the program.

### <span id="keywd.loops.syntax">Syntactic constraints</span>

To simplify the grammar, some restrictions on `_Cilk_for` loops are
stated here in text form. ~~The three items inside parentheses in the
grammar, separated by semicolons, are the initialization, condition, and
increment.~~ <span class="underline">Where a constraint on an expression
is expressed grammatically, parentheses around a required expression or
sub-expression are allowed.</span>

A program that contains a `return`, `break`, or `goto` statement that
would transfer control into or out of a `_Cilk_for` loop is ill-formed.

The initialization shall declare or initialize a single variable, called
the control variable. In C only, the control variable may be previously
declared, but if so shall be reinitialized, i.e., assigned, in the
initialization clause. In C++, the control variable shall be declared
and initialized within the initialization clause of the `_Cilk_for`
loop. <span class="underline">The variable shall have automatic storage
duration.</span> ~~No storage class may be specified for the variable
within the initialization clause. The variable shall have integral,
pointer, or class type. The variable may not be `const` or `volatile`.~~
The variable shall be initialized. Initialization may be explicit, using
assignment or constructor syntax, or implicit via a nontrivial default
constructor. ~~Within each iteration of the loop body, the control
variable is considered a unique variable whose address is no longer
valid when the iteration completes. If the control variable is declared
before the loop initialization, then the address of the variable at the
end of the loop is the same as the address of the variable before the
loop initialization and the value of the control variable is the same as
for the serialization of the program.~~

The condition shall have one of the following two forms:

var OP shift-expression

shift-expression OP var

where var is the control variable, optionally enclosed in parentheses.
The operator denoted OP shall be one of `!=`, `<=`, `<`, `>=`, or `>`.
The shift-expression that is not the control variable is called the loop
limit.

The condition shall have one of the following forms:

expression `<` expression

expression `>` expression

expression `<=` expression

expression `>=` expression

expression `!=` expression

Exactly one of the operands of the comparison operator shall be just the
name of the loop's control variable. The operand that is not the control
variable is called the limit expression. <span class="underline">Any
implicit conversion applied to that operand is not considered part of
the limit expression.</span>

The loop increment shall have one of the following forms: ~~where var is
the loop control variable, optionally enclosed in parentheses, and incr
is a conditional-expression with integral or enum type. The table
indicates the stride corresponding to the syntactic form.~~

| Syntax        | Stride      |
| ------------- | ----------- |
| `++`var       | `+1`        |
| var`++`       | `+1`        |
| `--`var       | `-1`        |
| var`--`       | `-1`        |
| var `+=` incr | incr        |
| var `-=` incr | `-(`incr`)` |

The notion of stride exists for exposition only and does not need to be
computed. In particular, for the case of var `-=` incr, a program may be
well formed even if incr is unsigned.

`++` identifier

identifier `++`

`--` identifier

identifier `--`

identifier `+=` expression

identifier `-=` expression

The variable modified by the increment shall be the control variable.

A program that contains a `return`, `break`, `goto`
<span class="underline">or `switch`</span> statement that would transfer
control into or out of a `_Cilk_for` loop is ill-formed.

### <span id="keywd.loops.reqs">Requirements on types and operators</span>

~~The type of var shall be copy constructible. (For the purpose of
specification, all C types are considered copy constructible.)~~
<span class="underline">The control variable shall have unqualified
integral, pointer, or copy-constructible class type.</span>

The initialization, condition, and increment parts of a `_Cilk_for`
shall ~~be defined such that the total number of iterations (loop count)
can be determined before beginning the loop execution. Specifically, the
parts of the `_Cilk_for` loop shall~~ meet all of the semantic
requirements of the corresponding serial `for` statement. In addition,
depending on the syntactic form of the condition, a `_Cilk_for` adds the
following requirements on the types of ~~var~~
<span class="underline">the control variable</span>, ~~limit~~
<span class="underline">the limit expression</span>, and ~~stride~~
<span class="underline">the stride.</span> ~~(and by extension incr),
and~~

The loop count is computed as follows, evaluated in infinite integer
precision <span class="underline">when the control variable and limit
both have integral or pointer type</span>. ~~(~~ In the following table,
~~first is the value of var immediately after initialization,~~
<span class="underline">“var” stands for an expression with the type and
value of the control variable, “limit” stands for an expression with the
type and value of the limit expression, and “stride” stands for an
expression with the type and value of the stride expression. The loop
count is computed after the loop initialization is performed, and before
the control variable is modified by the loop. The loop count expression
shall be well-formed, and shall have integral type. When a stride
expression is present, if the divisor of the division is not greater
than zero, the behavior is undefined.</span> ~~)~~

<table>
<colgroup>
<col style="width: 33%" />
<col style="width: 33%" />
<col style="width: 33%" />
</colgroup>
<thead>
<tr class="header">
<th>Condition syntax</th>
<th>Requirements</th>
<th>Loop count</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><pre class="c"><code>var &lt; limit
limit &gt; var</code></pre></td>
<td>(limit) <code>-</code> (first) shall be well-formed and shall yield an integral difference_type;<br />
stride shall be &gt; 0</td>
<td><pre class="c"><code>(( limit ) - ( first )) / stride</code></pre></td>
</tr>
<tr class="even">
<td><pre class="c"><code>var &gt; limit
limit &lt; var</code></pre></td>
<td>(first) <code>-</code> (limit) shall be well-formed and shall yield an integral difference_type;<br />
stride shall be &lt; 0</td>
<td><pre class="c"><code>(( first ) - ( limit )) / -stride</code></pre></td>
</tr>
<tr class="odd">
<td><pre class="c"><code>var &lt;= limit
limit &gt;= var</code></pre></td>
<td>(limit) <code>-</code> (first) shall be well-formed and shall yield an integral difference_type;<br />
stride shall be &gt; 0</td>
<td><pre class="c"><code>(( limit ) - ( first ) + 1) / stride</code></pre></td>
</tr>
<tr class="even">
<td><pre class="c"><code>var &gt;= limit
limit &lt;= var</code></pre></td>
<td>(first) <code>-</code> (limit) shall be well-formed and shall yield an integral difference_type;<br />
stride shall be &lt; 0</td>
<td><pre class="c"><code>(( first ) - ( limit ) + 1) / -stride</code></pre></td>
</tr>
<tr class="odd">
<td><pre class="c"><code>var != limit
limit != var</code></pre></td>
<td>(limit) <code>-</code> (first) and (first) <code>                         -</code> (limit) shall be well-formed and yield the same integral difference_type;<br />
stride shall be != 0</td>
<td><pre class="c"><code>if stride is positive
then ((limit) - (first)) / stride
else ((first) - (limit)) / -stride</code></pre></td>
</tr>
</tbody>
</table>

Loop count expression and value

Form of condition

Form of increment

var`++`  
`++`var

var`--`  
`--`var

var `+=` stride

var `-=` stride

``` c
var < limit
limit > var
```

``` c
((limit)-(var))
```

n/a

``` c
((limit)-(var)-1)/(stride)+1
```

``` c
((limit)-(var)-1)/-(stride)+1
```

``` c
var > limit
limit < var
```

n/a

``` c
((var)-(limit))
```

``` c
((var)-(limit)-1)/-(stride)+1
```

``` c
((var)-(limit)-1)/(stride)+1
```

``` c
var <= limit
limit >= var
```

``` c
((limit)-(var))+1
```

n/a

``` c
((limit)-(var))/(stride)+1
```

``` c
((limit)-(var))/-(stride)+1
```

``` c
var >= limit
limit <= var
```

n/a

``` c
((var)-(limit))+1
```

``` c
((var)-(limit))/-(stride)+1
```

``` c
((var)-(limit))/(stride)+1
```

``` c
var != limit
limit != var
```

``` c
((limit)-(var))
```

``` c
((var)-(limit))
```

``` c
((stride)<0) ?
((var)-(limit)-1)/-(stride)+1 :
((limit)-(var)-1)/(stride)+1
```

``` c
((stride)<0) ?
((limit)-(var)-1)/-(stride)+1 :
((var)-(limit)-1)/(stride)+1
```

~~The incr expression shall have integral or enumeration type.~~
<span class="underline">The type of the difference between the limit
expression and the control variable is the subtraction type, which shall
be integral. When the condition operation is `!=`, (limit)`-`(var) and
(var)`-`(limit) shall have the same type. The stride shall be
convertible to the subtraction type.</span>

<span class="underline">For some expression X with the same type as the
subtraction type</span>, if the loop increment uses operator `++` or
`+=`, the expression:

    var += (difference_type)(incr) X

shall be well-formed; if ~~the loop increment~~
<span class="underline">it</span> uses operator `--` or `-=`, the
expression

    var -= (difference_type)(incr) X

shall be well-formed. The loop is ~~a use~~ <span class="underline">an
odr-use</span> of the required operator <span class="underline">`+=` or
`-=`</span> function.

### <span id="keywd.loops.dynam">Dynamic constraints</span>

If the stride does not meet the requirements in the table above, the
behavior is undefined. If this condition can be determined statically,
the compiler is encouraged (but not required) to issue a warning. (Note
that the incorrect loop might occur in an unexecuted branch, e.g., of a
function template, and thus should not cause a compilation failure in
all cases.)

If the control variable is modified other than as a side effect of
evaluating the loop increment expression, the behavior of the program is
undefined.

If X and Y are values of ~~var~~ <span class="underline">the control
variable</span> that occur in consecutive evaluations of the loop
condition in the serialization, then <span class="underline">the
behavior is undefined if</span>

``` c
((limit) - X) - ((limit) - Y)
```

evaluated in infinite integer precision, ~~shall~~
<span class="underline">does not</span> equal the stride. If the
condition expression is true on entry to the loop, then
<span class="underline">the behavior is undefined if</span> the
<span class="underline">computed</span> loop count ~~shall be
non-negative~~ <span class="underline">is not greater than zero</span>.
<span class="underline">If the computed loop count is not representable
as a value of type `unsigned long long`, the behavior is
undefined.</span>

Programmer note: Unsigned wraparound is not allowed.

<span class="underline">If the body of the loop is executed,</span> the
increment and limit expressions may be evaluated ~~fewer~~
<span class="underline">a different number of</span> times than in the
serialization. If different evaluations of the same expression yield
different values, the behavior of the program is undefined.

The copy constructor for the control variable may be executed more times
than in the serialization.

If evaluation of the increment or limit expression, or a required
`operator+=` or `operator-=` throws an exception, the behavior of the
program is undefined.

If the loop body throws an exception that is not caught within the same
iteration of the loop, it is unspecified which other loop iterations
execute, <span class="underline">but no other iteration is terminated
early</span>. If multiple loop iterations throw exceptions that are not
caught in the loop body, the `_Cilk_for` statement throws the exception
that would have occurred first in the serialization of the program.

### <span id="keywd.loops.grain">Grainsize pragma</span>

A `_Cilk_for` iteration-statement may optionally be preceded by a
grainsize-pragma. The grainsize pragma shall immediately precede a
`_Cilk_for` loop and may not appear anywhere else in a program, except
that other pragmas that appertain to the `_Cilk_for` loop may appear
between the grainsize-pragma and the `_Cilk_for` loop. The expression in
the grainsize pragma shall evaluate to a type convertible to `long`.

The presence of the pragma provides a hint to the runtime specifying the
number of serial iterations desired in each chunk of the parallel loop.
~~The grainsize expression is evaluated at runtime.~~
<span class="underline">The grainsize expression need not be evaluated.
If it is evaluated, that evaluation is sequenced after the execution of
the statement preceding the loop, is sequenced before any execution of
the loop body, and is unsequenced with respect to the loop
initialization and the evaluation of the limit and stride
expressions.</span> If there is no grainsize pragma, or if the grainsize
evaluates to 0, then the runtime will pick a grainsize using its own
internal heuristics. If the grainsize evaluates to a negative value, the
behavior is unspecified. (The meaning of negative grainsizes is reserved
for future extensions.) The grainsize pragma applies only to the
`_Cilk_for` statement that immediately follows it – the grain sizes for
other `_Cilk_for` statements are not affected.

## <span id="keywd.spawn">Spawn</span>

The `_Cilk_spawn` keyword suggests to the implementation that an
executed statement or part of a statement may be run in parallel with
following statements. A consequence of this parallelism is that the
program may exhibit undefined behavior not present in the serialization.
Execution of a `_Cilk_spawn` keyword is called a spawn. Execution of a
`_Cilk_sync` statement is called a sync. ~~A statement~~
<span class="underline">An expression statement or declaration
statement</span> that contains a spawn is called a spawning statement.
<span class="underline">In a declaration containing a `_Cilk_spawn`
keyword, the initialization of each object declared is treated as a
separate statement.</span>

The <span id="deffollowingsync">following sync</span> of a `_Cilk_spawn`
refers to the next `_Cilk_sync` executed (dynamically, not lexically) in
the same task block. Which spawn the sync follows is implied from
context. The following sync may be the implicit `_Cilk_sync` at the end
of a task block.

A <span id="defspawnpoint">spawn point</span> is a C sequence point at
which a control flow fork is considered to have taken place. Any
operations within the spawning expression that are not required by the
C/C++ standards to be sequenced after the spawn point ~~shall be
executed~~ <span class="underline">are sequenced</span> before the spawn
point. The strand that begins at the statement immediately following the
spawning statement (in execution order) is called the continuation of
the spawn. The sequence of operations within the spawning statement that
are sequenced after the spawn point comprise the child of the spawn. The
scheduler may execute the child and the continuation in parallel.
Informally, the parent is the task block containing the initial strand,
the spawning statements, and their continuations but excluding the
children of all of the spawns. The children of the spawns within a
single task block are siblings of one another.

The spawn points associated with different spawning statements are as
follows:

  - The body of a `_Cilk_for` loop is a spawning statement with spawn
    point at the end of the loop condition test.
  - An expression statement containing a single `_Cilk_spawn` has a
    spawn point at the sequence point at the call to the spawned
    function. Any unnamed temporary variables created prior to the spawn
    point are not destroyed until after the spawn point (i.e., the
    destructors are invoked in the child).
  - A declaration statement in which an identifier is initialized or
    assigned with a result of a function call that is being spawned has
    a spawn point at the sequence point at the call to the spawned
    function. A declaration statement may consist of multiple comma
    separated declarations. Each of them may or may not have a spawn,
    and there can be at most one spawn per expression. The conversion of
    the function return value, if necessary, and the assignment or
    initialization of the receiver takes place after the spawn point
    (i.e., in the child). Any unnamed temporary variables created prior
    to the spawn point are not destroyed until after the spawn point
    (i.e., their destructors are invoked in the child).

For example, in the following two statements:

    x[g()] = _Cilk_spawn f(a + b);
    a++;

The call to function `f` is the spawn point and the statement `a++;` is
the continuation. The expression `a + b` and the initialization of the
temporary variable holding that value, and the evaluation of `x[g()]`
take place before the spawn point. The execution of `f`, the assignment
to `x[g()]`, and the destruction of the temporary variable holding `  a
+ b ` take place in the child.

If a statement is followed by an implicit sync, that sync is the spawn
continuation.

Programmer note: The sequencing may be more clear if

    x[g()] = _Cilk_spawn f(a + b);

is considered to mean

    {
        // Evaluate arguments and receiver address before spawn point
        T tmp = a + b; // T is the type of a + b
        U &r = x[g()]; // U is the type of x[0]
        _Cilk_spawn { r = f(tmp); tmp.~T(); }
    }

A `setjmp`/`longjmp` call pair within the same task block has undefined
behavior if a spawn or sync is executed between the `setjmp` and the
`longjmp`. A `setjmp`/`longjmp` call pair that crosses a task block
boundary has undefined behavior. A `goto` statement is not permitted to
enter or exit a task block.

## <span id="keywd.sync">Sync</span>

A sync statement indicates that all children of the current task block
must finish executing before execution may continue within the task
block. The new strand coming out of the `_Cilk_sync` is not running in
parallel with any child strands, but may still be running in parallel
with parent and sibling strands (other children of the calling
function).

There is an implicit sync at the end of every task block. If a spawning
statement appears within a try block, a sync is implicitly executed ~~at
the end of~~ <span class="underline">on exit from</span> that try block,
as if the body of the try were a task block. If a task block has no
children at the time of a sync, then the sync has no observable effect.
(The compiler may elide an explicit or implicit sync if it can
statically determine that the sync will have no observable effect.)

Programmer note: Because implicit syncs follow destructors, writing
`_Cilk_sync` at the end of a function may produce a different effect
than the implicit sync. In particular, if an assignment spawn or
initializer spawn is used to modify a local variable, the function will
generally need an explicit `_Cilk_sync` to avoid a race between
assignment to the local variable by the spawned function and destruction
of the local variable by the parent function.

## <span id="keywd.except">Exceptions</span>

There is an implicit `_Cilk_sync` before a ~~`throw`, after the
exception object has been constructed.~~
<span class="underline">try-block.</span>

If a spawned function terminates with an exception, the exception
propagates from the point of the corresponding sync.

When several exceptions are pending and not yet caught, later exception
objects (in the serial execution order of the program) are destructed in
an unspecified order before the earliest exception is caught.

# <span id="hyper">Hyperobjects</span>

## <span id="hyper.descr">Description</span>

Cilk <span class="underline">Plus</span> defines a category of objects
called “hyperobjects”. Hyperobjects allow thread-safe access to shared
objects by giving each ~~parallel~~ strand
<span class="underline">running in parallel</span> a separate instance
of the object.

Parallel code uses a hyperobject by performing a hyperobject lookup
operation. The hyperobject lookup returns a reference to an object,
called a view, that is guaranteed not to be shared with any other active
strands in the program. The sequencing of a hyperobject lookup within an
expression is not specified. The runtime system creates a view when
needed, using callback functions provided by the hyperobject type. When
strands synchronize, the hyperobject views are merged into a single
view, using another callback function provided by the hyperobject type.

The view of a hyperobject visible to a program may change at any spawn
or sync (including the implicit spawns and syncs within a `_Cilk_for`
loop). The identity (address) of the view does not change within a
single strand. The view of a given hyperobject visible within a given
strand is said to be associated with that view. A hyperobject has the
same view before the first spawn within a task block as after a sync
within the same task block, even though the thread ID may not be the
same (i.e., hyperobject views are not tied to threads). A hyperobject
has the same view upon entering and leaving a `_Cilk_for` loop and
within the first iteration (at least) of the `_Cilk_for` loop. A special
view is associated with a hyperobject when the hyperobject is initially
created. This special view is called the leftmost view or earliest view
because it is always visible to the leftmost (earliest) descendent in
the depth-first, left-to-right traversal of the program's spawn tree.
The leftmost view is given an initial value when the hyperobject is
created.

Programmer note: If two expressions compute the same address for a view,
then they have not been scheduled in parallel. This property yields one
of the simplest ways by which a program can observe the runtime behavior
of the scheduler.

Implementation note: An implementation can optimize hyperobject lookups
by performing them only when a view has (or might have) changed. This
optimization can be facilitated by attaching implementation-specific
attributes to the hyperobject creation, lookup, and/or destruction
operations.

## <span id="hyper.reduce">Reducers</span>

The vast majority of hyperobjects belong to a category known as
“reducers.” Each reducer type provides a `reduce` callback operation
that merges two views in a manner specific to the reducer. For a pair of
views V<sub>1</sub> and V<sub>2</sub>, the result of calling
`reduce(`V<sub>1</sub>`,` V<sub>2</sub>`)` is notated as
V<sub>1</sub>⊗V<sub>2</sub>. Each reducer also provides an `identity`
callback operation that initializes a new view.

The `reduce` callback for a “classical” reducer implements an operation
⊗ such that (a⊗b)⊗c==a⊗(b⊗c) (i.e., ⊗ is associative). The
view-initialization callback for such a reducer sets the view to an
identity value I such that I⊗v==v and v⊗I==v for any value v of
value\_type. Given an associative ⊗ and an identity I, the triplet
(value\_type, ⊗, I) describes a mathematical monoid. For example,
(`int`, `+`, `0`) is a monoid, as is (`list`, `concatenate`, empty). If
each individual view, R, of a classical reducer is modified using only
expressions that are equivalent to R←R⊗v (where v is of value\_type),
then the reducer computes the same value in the parallel program as
would be computed in the serialization of the program. (In actuality,
the “⊗” in the expression “R←R⊗v” can represent a set of
mutually-associative operations. For example, `+=` and `-=` are mutually
associative.) For example, a spawned function or `_Cilk_for` body can
append items onto the view of a list reducer with monoid (`list`,
`concatenate`, empty). At the end of the parallel section of code, the
reducer's view contains the same list items in the same order as would
be generated in a serial execution of the same code.

Given a set of strands entering a sync,
S<sub>1</sub>,S<sub>2</sub>,S<sub>3</sub>,…S<sub>n</sub>, associated
with views V<sub>1</sub>,V<sub>2</sub>,V<sub>3</sub>,…V<sub>n</sub>,
respectively such that S<sub>i</sub> is earlier in the serial ordering
than S<sub>i+1</sub>, a single view, W, emerges from the sync with value
W←V<sub>1</sub>⊗V<sub>2</sub>⊗V<sub>3</sub>⊗…⊗V<sub>n</sub>, such that
the left-to-right order is maintained but the grouping (associativity)
of the operations is unspecified. The timing of this “reduction” is
unspecified – in particular, subsequences typically will be computed
asynchronously as child tasks complete. Every view except the one
emerging from the sync is destroyed after the merge. If any of the
strands does not have an associated view, then the invocation of the
`reduce` callback function can be elided (i.e., the missing view is
treated as an identity).

A strand is never associated with more than one view for a given
reducer, but multiple strands can be associated with the same view if
those strands are not scheduled in parallel (at run time). Specifically,
for a given reducer, the association of a strand to a view of the
reducer obeys the following rules:

1.  The strand that initializes the reducer is associated with the
    leftmost view.
2.  If two strands execute in series (i.e., both strands are part of a
    larger strand), then both are associated with the same view.
3.  The child strand of a spawn is associated with the same view as the
    strand that entered the spawn.
4.  If the continuation strand of a spawn is scheduled in parallel with
    the child, then the continuation strand is associated with a new
    view, initialized using `identity`. The implementation may create
    the new view at any time up until the first hyperobject lookup
    following the spawn. If the continuation strand does not perform a
    hyperobject lookup, then the implementation is not required to
    create a view for that strand.
5.  If the continuation strand of a spawn is not scheduled in parallel
    with the child strand (i.e., the child and the continuation execute
    in series), then the continuation strand is associated with the same
    view as the child strand.
6.  The strand that emerges from a sync is associated with the same view
    as the leftmost strand entering the sync.

Even before the final reduction, the leftmost view of a reducer will
contain the same value as in the serial execution. Other views, however,
will contain partial values that are different from the serial
execution.

If ⊗ is not associative or if `identity` does not yield a true identity
value then the result of a set of reductions will be non-deterministic
(i.e., it will vary based on runtime scheduling). Such “non-classical”
reducers are nevertheless occasionally useful. Note that, for a
classical reducer, the ⊗ operator needs to be associative, but does not
need to be commutative.

## <span id="hyper.cpp">Hyperobjects in C++</span>

### <span id="hyper.cpp.syntax">C++ hyperobject syntax</span>

Note: The syntax described here is the syntax used in the Intel
products. Intel is considering a different syntax for future, either in
addition to or instead of the syntax described below.

At present, reducers <span class="underline">and holders</span> are the
only kind of hyperobject supported. In C++, every reducer ~~hyperobject
has a hyperobject type, which~~ <span class="underline">type</span> is
an instantiation of the `cilk::reducer` class
template<span class="underline">, which is defined in the header
`<cilk/reducer.h>`</span>. The `cilk::reducer` class template has a
single template type parameter, `Monoid`, which shall be a class type.
<span class="underline">(See [C++ Monoid class
requirements](#hyper.cpp.monoid), below.)</span>

For a given monoid, M, the type `cilk::reducer<`M`>` defines a
hyperobject type. The `cilk::reducer` class template provides
~~constructors, a destructor, and~~ (`const` and non-`const` versions
of) ~~`value_type& operator()`~~
<span class="underline">`operator*()`</span> and `value_type& view()`,
both of which return ~~a~~ <span class="underline">an lvalue</span>
reference to the current view<span class="underline">, and
`operator->()`, which returns the address of the current view</span>.

A ~~hyperobject~~ <span class="underline">reducer</span> is created by
defining an instance of `cilk::reducer<`M`>`:

    cilk::reducer<M> hv(args);

Where args is a list of M`::valueview_type` constructor arguments used
to initialize the leftmost view of `hv`. A hyperobject lookup is
performed by invoking the member function, `view()` or member
`operator*()` <span class="underline">or `operator->()`</span> on the
hyperobject, as in the following examples:

    hv.view().append(elem);
    (*hv).append(elem);
    hv->append(elem); hv().append(elem);

In these examples, `append` is an operation to be applied to the current
view of `hv`, and is presumably consistent with the associative
operation defined in the monoid, M.

Modifying a hyperobject view in a way that is not consistent with the
associative operation in the monoid can lead to subtle bugs. For
example, addition is not associative with multiplication, so performing
a multiplication on the view of a summing reducer will almost certainly
produce incorrect results. To prevent this kind of error, it is ~~common
to wrap reducers in proxy classes that expose~~
<span class="underline">possible for the monoid to define a separate
`view_type` class that wraps the `value_type` and exposes</span> only
the valid associative operations. <span class="underline">(See
[Monoid](#hyper.cpp.monoid) and [View](#hyper.cpp.view) class
requirements, below.)</span> All of the reducers included in the
standard reducer library have such wrappers.

### <span class="underline"><span id="hyper.cpp.reducer">C++ `reducer` class template</span></span>

<span class="underline">Where the below table indicates that the
signature of a function includes the form `Args&&...`, in an
implementation that supports C++ variadic templates, the function shall
be defined as a variadic function template. In an implementation that
does not support variadic templates, the function shall be defined as a
set of templates taking from 0 to N arguments of type `const Arg &`,
where N is at least 4.</span>

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Member</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><pre><code>typename Monoid</code></pre></td>
<td>Template parameter</td>
</tr>
<tr class="even">
<td><pre><code>typedef
typename Monoid::value_type
    value_type;</code></pre></td>
<td>Typedef for the type of the data being reduced.</td>
</tr>
<tr class="odd">
<td><pre><code>typedef
typename Monoid::view_type
    view_type;</code></pre></td>
<td>Typedef for the type actually returned by a hyperobject lookup. <code>view_type</code> can be the same as <code>value_type</code> (see below).</td>
</tr>
<tr class="even">
<td><pre><code>template&lt;typename... Args&gt;
reducer(const Args&amp;&amp;... args);</code></pre></td>
<td>Default-initialize the monoid and construct the leftmost view using constructor arguments, args.</td>
</tr>
<tr class="odd">
<td><pre><code>template&lt;typename... Args&gt;
reducer(const Monoid&amp; m,
    const Args&amp;&amp;... args);</code></pre></td>
<td>Initialize the monoid from m and construct the leftmost view using constructor arguments, args. This constructor is useful only for the rare monoid type that contains state. The monoid state is shared by all views of the reducer.</td>
</tr>
<tr class="even">
<td><pre><code>Monoid&amp; monoid();
Monoid const&amp; monoid() const;</code></pre></td>
<td>Return the monoid instance for this reducer. The same monoid instance is returned for a given reducer regardless of which strand invoked this accessor. This accessor is useful only for the rare monoid type that contains state.</td>
</tr>
<tr class="odd">
<td><pre><code>view_type&amp; view();
view_type&amp; view() const;</code></pre></td>
<td>Return an lvalue reference to the current view (i.e., the view associated with the currently-executing strand).</td>
</tr>
<tr class="even">
<td><pre><code>void move_in(value_type&amp; obj);</code></pre></td>
<td>Replace the value in the current view with obj. The value of obj after this operation is unspecified. Note that using this operation in parallel with other operations on the same reducer will cause the final reducer value to be indeterminate.</td>
</tr>
<tr class="odd">
<td><pre><code>void move_out(value_type&amp; obj);</code></pre></td>
<td>Replace the value of obj with the value of the current view. The value of the view after this operation is unspecified. Note that using this operation in parallel with other operations on the same reducer will place an indeterminate value in obj and cause the final reducer value to be indeterminate.</td>
</tr>
<tr class="even">
<td><pre><code>void set_value(const value_type&amp; obj);</code></pre></td>
<td>Replace the value in the current view with obj. Note that using this operation in parallel with other operations on the same reducer will cause the final reducer value to be indeterminate.</td>
</tr>
<tr class="odd">
<td><pre><code>type get_value() const;</code></pre></td>
<td>Return the value of the current view. Note that using this operation in parallel with other operations on the same reducer will return an indeterminate value. The return type is <code>const value_type&amp;</code> if <code>view_type</code> is identical to <code>value_type</code>; otherwise the return value is the same as that returned by <code>view_type::view_get_value()</code>.</td>
</tr>
</tbody>
</table>

### <span class="underline"><span id="hyper.cpp.monoid">C++ Monoid class requirements</span></span>

To define a reducer, a program defines a monoid class with public
members representing the monoid, (T, ⊗, identity) as follows:

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th><span class="underline">Member name/signature</span></th>
<th><span class="underline">Purpose</span></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><pre><code>value_type</code></pre></td>
<td>typedef for T<span class="underline">, the type of the data being reduced</span></td>
</tr>
<tr class="even">
<td><pre><code>view_type</code></pre></td>
<td><span class="underline">typedef for the type actually returned by a hyperobject lookup. <code>view_type</code> can be the same as <code>value_type</code> (see below).</span></td>
</tr>
<tr class="odd">
<td><pre><code>reduce(value_type* left,
    value_type* right)</code></pre></td>
<td>evaluate “<code>*</code>left <code>= *</code>left ⊗ <code>*</code>right”</td>
</tr>
<tr class="even">
<td><pre><code>identity(value_type* p)</code></pre></td>
<td>construct identity object at <code>*</code>p</td>
</tr>
<tr class="odd">
<td><pre><code>destroy(value_type* p)</code></pre></td>
<td>call the destructor on the object <code>*</code>p</td>
</tr>
<tr class="even">
<td><pre><code>allocate(size_t size)</code></pre></td>
<td>return a pointer to size bytes of raw memory<span class="underline">; return type shall be <code>void*</code></span></td>
</tr>
<tr class="odd">
<td><pre><code>deallocate(value_type void* p)</code></pre></td>
<td>deallocate the raw memory at <code>*</code>p<span class="underline">, where p is a value returned by a previous call to <code>allocate</code></span></td>
</tr>
</tbody>
</table>

If any of the above functions do not modify the state of the monoid
(most monoids carry no state), then those functions may be declared
`static` or `const`. The monoid type may derive from an instantiation of
`cilk::monoid_base<T,V>`, which defines `value_type`
<span class="underline">and `view_type` as aliases for `T` and `V`,
respectively (where `  V ` defaults to `T`),</span> and provides default
implementations for `identity`, `destroy`, `allocate`, and `deallocate`.
The derived class needs to define `reduce` and ~~override only~~ those
functions for which the default is incorrect.

### <span class="underline"><span id="hyper.cpp.view">C++ View class requirements</span></span>

<span class="underline">By default, `view_type` is the same as
`value_type`. Commonly, however, it is a wrapper around `value_type`
that presents a more limited interface in order to achieve a measure of
static safety. For example, for a summing reducer, `view_type` might
support `+=` and `++` but not operations like `*=` that are inconsistent
with a summing reduction. Other times, `view_type` holds a more complex
type that allows for more efficient reduction operations.</span>

<span class="underline">When `view_type` is identical to `value_type`
the reducer imposes no further requirements on it beyond those already
required by the `identity` and `reduce` operations in the monoid.</span>

<span class="underline">When `view_type` differs from `value_type`, then
`  view_type ` must provide the following member functions:</span>

<table>
<colgroup>
<col style="width: 50%" />
<col style="width: 50%" />
</colgroup>
<thead>
<tr class="header">
<th>Signature</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><pre><code>view_move_in(value_type&amp; v)</code></pre></td>
<td><span class="underline">Clear the existing contents of the view and replace it with the value v. After calling this function, the new value of v is unspecified (but valid).</span></td>
</tr>
<tr class="even">
<td><pre><code>view_move_out(value_type&amp; v)</code></pre></td>
<td><span class="underline">Move the value of the view into v. After calling this function, the new value of the view is unspecified.</span></td>
</tr>
<tr class="odd">
<td><pre><code>view_set_value(const value_type&amp; v)</code></pre></td>
<td><span class="underline">Set the value of the view to v.</span></td>
</tr>
<tr class="even">
<td><pre><code>view_get_value() const</code></pre></td>
<td><span class="underline">Return the value of the view, either as an rvalue or as a const lvalue.</span></td>
</tr>
</tbody>
</table>

### <span id="hyper.cpp.behave">C++ hyperobject behavior</span>

An object of type M`::value_type` is constructed by the `  reducer `
constructor. This object is called the initial view or leftmost view of
the hyperobject. When a hyperobject goes out of scope, the destructor is
called on the leftmost view. It is unspecified whether M`::allocate` and
M`::deallocate` are called to allocate and deallocate the leftmost view
(they are not called in the current Intel implementation).

The implementation may create a view at any spawn that has been
scheduled in parallel, or may lazily defer creation until the first
access within a strand. The implementation creates a view by calling
M`::allocate` followed by M`::identity`. (This is in addition to the
initial view created by construction of the hyperobject.) The calls to
M`::allocate` and M`::identity` are part of the strand for the purpose
of establishing the absence of a data race.

At any sync or at the end of any spawned (child) function, the runtime
may merge two views by calling M`::reduce(`left`,` right`)`, where right
is the earliest remaining view that is later than left. The M`::reduce`
function is expected to store the merged result in the left view. After
the merge, the runtime destroys the right view by calling M`::destroy`
followed by M`::deallocate`. Every view except the leftmost view is
passed exactly once as the second argument to `reduce`. The calls to
M`::reduce`, M`::destroy` and M`::deallocate` happen after completion of
both of the strands that formerly owned the left and right views.

If a monoid member function executes a hyperobject lookup (directly or
through a function call), the behavior of the program is undefined.

For purposes of establishing the absence of a data race, a hyperobject
view is considered a distinct object in each parallel strand. A
hyperobject lookup is considered a read of the hyperobject.

## <span id="hyper.c">Hyperobjects in C</span>

### <span id="hyper.c.syntax">C hyperobject syntax</span>

Note: The syntax described here is the syntax used in the Intel
products. Intel is considering a different syntax for future, either in
addition to or instead of the syntax described below.

The C mechanism for defining and using hyperobjects depends on a small
number of typedefs and preprocessor macros provided in the ~~Cilk
library~~ <span class="underline">header `<cilk/reducer.h>`</span>. C
does not have the template capabilities of C++ and thus has a less
abstract hyperobject syntax. Unlike C++, each C hyperobject variable is
unique – there is no named type that unites similar hyperobjects. There
is, however, an implicit “hyperobject type” defined by the operations
that comprise the hyperobjects' monoid. The provided macros facilitate
creating reducer variables, which are the only type of hyperobject
currently supported. The terms “reducer” and “hyperobject” are used
interchangeably in this section.

To define a C reducer, the program defines three functions representing
operations on a monoid (T, ⊗, identity):

    void T_reduce(void* r, void* left, void* right);
    void T_identity(void* r, void* view);
    void T_destroy(void* r, void* view);

The names of these functions are for illustration purposes only and must
be chosen, as usual, to avoid conflicts with other identifiers. The
purposes of these functions are as follows:

| <span class="underline">Function tag</span> | <span class="underline">Purpose</span>                |
| ------------------------------------------- | ----------------------------------------------------- |
| T\_reduce                                   | Evaluate “`*(T*)`left `= *(T*)` left ⊗ `*(T*)` right” |
| T\_identity                                 | Initialize a T value to identity                      |
| T\_destroy                                  | Clean up (destroy) a T value                          |

The r argument to each of these functions is a pointer to the actual
reducer variable and is usually ignored. Since most C types do not
require cleanup on destruction, the T\_destroy function often does
nothing. As a convenience, the Cilk library makes this common
implementation available as a library function,
`__cilkrts_hyperobject_noop_destroy`.

A reducer, `hv`, is defined and given an initial value, init, using the
`CILK_C_DECLARE_REDUCER` and `CILK_C_INIT_REDUCER` macros as follows:

    CILK_C_DECLARE_REDUCER(T) hv =
        CILK_C_INIT_REDUCER(T_identity, T_reduce, T_destroy,
            init);

The init expression is used to initialize the leftmost reducer view. The
`CILK_C_DECLARE_REDUCER` macro defines a `struct` and can be used in a
`typedef` or `extern` declaration as well:

    extern CILK_C_DECLARE_REDUCER(T) hv;

The `CILK_C_INIT_REDUCER` macro expands to a static initializer for a
hyperobject of any type. After initialization, the leftmost view of the
reducer is available as hv`.value`.

~~If~~ <span class="underline">The behavior is undefined if</span> a
reducer ~~is local to a function, it shall be~~
<span class="underline">with automatic storage duration is not</span>
registered before first use using the `CILK_C_REGISTER_REDUCER` macro
and unregistered after its last use using the
`CILK_C_UNREGISTER_REDUCER` macro:

    CILK_C_REGISTER_REDUCER(hv);
    /* use hv here */
    CILK_C_UNREGISTER_REDUCER(hv);

For the purpose of registration and unregistration, first use and last
use are defined with respect to the serialization of the program.
<span class="underline">If</span> the reducer view immediately before
unregistration ~~shall be~~ <span class="underline">is not</span> the
same (<span class="underline">does not</span> have the same address) as
the reducer view immediately after registration,
<span class="underline">the behavior is undefined</span>. In practice,
this means that any spawns after the registration have been synced
before the unregistration and that no spawns before the registration
have been synced before the unregistration. Registration and
unregistration are optional for reducers declared in global scope. The
`value` member of the reducer continues to be available after
unregistration, but a hyperobject lookup on an unregistered reducer
results in undefined behavior unless the reducer is registered again.

A hyperobject lookup is performed using the `REDUCER_VIEW` macro:

    REDUCER_VIEW(hv) += expr;

As in the case of a C++ reducer, modifying a reducer other than through
the correct associative operations can cause bugs. Unfortunately, C does
not have sufficient abstraction mechanisms to prevent this kind of
error. Nevertheless, the Cilk library provides wrapper macros to
simplify the declaration and initialization, though not the safety, of
library-provided reducers in C. For example, you can define and
initialize a summing reducer this way:

    CILK_C_DECLARE_REDUCER(long) hv =
        REDUCER_OPADD_INIT(long, 0);

A C reducer can be declared, defined, and accessed within C++ code, but
a C++ reducer cannot be used within C code.

### <span id="hyper.c.behave">C hyperobject behavior</span>

The macro `CILK_C_DECLARE_REDUCER(T)` defines a `struct` with a data
member of type T, named `value`. The macro
`CILK_C_INIT_REDUCER(T,I,R,D,V)` expands to a braced-init-list
appropriate for initializing a variable, hv, of structure type declared
with `CILK_C_DECLARE_REDUCER(T)` such that hv, can be recognized by the
runtime system as a C reducer with value type T, identity function I,
reduction function R, destroy function D, and initial value V.

Invoking `CILK_C_REGISTER_REDUCER(hv)` makes a call into the runtime
system that registers hv`.value` as the initial, or leftmost, view of
the C hyperobject hv. The macro `CILK_C_UNREGISTER_REDUCER(hv)` makes a
call into the runtime system that removes hyperobject hv from the
runtime system's internal map. Attempting to access hv after it has been
unregistered will result in undefined behavior. If a hyperobject is
never registered, the leftmost view will be associated with the program
strand before the very first spawn in the program and will follow the
leftmost branch of the execution DAG. This association is typically
useful only for hyperobjects in global scope.

The implementation may create a view at ~~any spawn~~
<span class="underline">the start of any strand</span> that has been
scheduled in parallel, or may lazily defer creation until the first
access within a strand. The implementation creates a view by allocating
it with `malloc`, then calling the identity function specified in the
reducer initialization. (This is in addition to the initial view created
by construction of the reducer.) The call to the identity function is
part of the strand for the purpose of establishing the absence of a data
race.

At any sync or at the end of any spawned (child) function, the runtime
may merge two views by calling the reduction function (specified in the
reducer initialization) on the values left and right, where right is the
earliest remaining view that is later than left. The reduction function
is expected to store the merged result in the left view. After the
merge, the runtime destroys the right view by calling the destroy
function for the hyperobject, then deallocates it using `free`. Every
view except the leftmost view is passed exactly once as the second
argument the reduction function. The calls to reduction and destroy
functions happen after completion of both of the strands that formerly
owned the left and right views.

If a monoid function executes a hyperobject lookup, the behavior of the
program is undefined.

For purposes of establishing the absence of a data race, a hyperobject
view is considered a distinct object in each parallel strand. A
hyperobject lookup is considered a read of the hyperobject.

-----

# <span id="legal">Disclaimer and other legal information</span>

Copyright (c) 2020 Massachusetts Institute of Technology

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal with the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# <span id="ack">Acknowledgements</span>

We gratefully acknowledge Intel Corporation for generously allowing this
OpenCilk document to incorporate material from the following Intel
document number 324396-003USr, which may be available here:
<https://www.cilkplus.org/sites/default/files/open_specifications/Intel_Cilk_plus_lang_spec_1.2.htm>

The OpenCilk project was sponsored in part by the United States Air
Force Research Laboratory and was accomplished under Cooperative
Agreement Number FA8750-19-2-1000. The views and conclusions contained
in this document are those of the authors and should not be interpreted
as representing the official policies, either expressed or implied, of
the United States Air Force or the U.S. Government. The U.S. Government
is authorized to reproduce and distribute reprints for Government
purposes notwithstanding any copyright notation herein.

## Introduction

This document is one of a set of technical specifications describing the
OpenCilk language and the run-time support for the language. Together,
these documents provide the detail needed to implement a compliant
compiler. At this time the following specifications are available:

-   The OpenCilk Language Specification, this document
-   The OpenCilk Application Binary Interface

This document defines the OpenCilk extension to C and C++. The language
extension is supported by a run-time user-mode work-stealing task
scheduler which is not directly exposed to the application programmer.
However, some of the semantics of the language and some of the
guarantees provided require specific behavior of the task scheduler. The
programmer visible parts of the language include the following
constructs:

1.  Three keywords (`_Cilk_spawn`, `_Cilk_sync` and `_Cilk_for`) to
    express tasking
2.  Hyperobjects, which provide local views to shared objects

An implementation of the language may take advantage of all parallelism
resources available in the hardware. On a typical CPU, these include at
least multiple cores and vector units. Some of the language constructs,
e.g. `_Cilk_spawn`, utilize only core parallelism; some, e.g. SIMD
loops, utilize only vector parallelism, and some, e.g. SIMD-enabled
functions, utilize both. The defined behavior of every deterministic
Cilk program is the same as the behavior of a similar C or C++ program
known as the "serialization." While execution of a C or C++ program may
be considered as a linear sequence of statements, execution of a tasking
program is in general a directed acyclic graph. Parallel control flow
may yield a new kind of undefined behavior, a "data race," whereby parts
of the program that may execute in parallel access the same memory
location in an indeterminate order, with at least one of the accesses
being a write access. In addition, ~~throwing~~ [if]{.underline} an
exception ~~may result in~~ [is thrown,]{.underline} code ~~being~~ [may
still be]{.underline} executed that would not have been executed in a
serial execution.

[The word "shall" is used in this specification to express a diagnosable
constraint on a Cilk Plus program.]{.underline}

## Related documents

1.  The OpenCilk Application Binary Interface
2.  ISO/IEC 9899:2011, Information Technology -- Programming languages
    -- C
3.  ISO/IEC 14882:2011, Information Technology -- Programming languages
    -- C++
4.  [OpenMP Application Program Interface, Version 4.0 - July
    2013]{.underline}

## Keywords for Tasking

OpenCilk adds the following new keywords:

-   `_Cilk_sync`
-   `_Cilk_spawn`
-   `_Cilk_for`

A program that uses these keywords other than as defined in the grammar
extension below is ill-formed.

### Keyword Aliases

The header `<cilk/cilk.h>` defines the following aliases for the Cilk
keywords:

    #define cilk_spawn _Cilk_spawn
    #define cilk_sync  _Cilk_sync
    #define cilk_for   _Cilk_for

### Grammar

The three keywords are used in the following new productions:

jump-statement:
:   `_Cilk_sync ;`

The call production of the grammar is modified to permit the keyword
`_Cilk_spawn` before the expression denoting the function to be called:

postfix-expression:
:   `_Cilk_spawn`~opt~ postfix-expression `(` expression-list~opt~ `)`

Consecutive `_Cilk_spawn` tokens are not permitted. The
postfix-expression following `_Cilk_spawn` is called a spawned function.
~~The spawned function may be a normal function call, a member-function
call, or the function-call (parentheses) operator of a function object
(functor) or a call to a lambda expression.~~ Overloaded operators other
than the parentheses operator may be spawned only by using the
function-call notation (e.g., `operator+(arg1,arg2)`). There shall be no
more than one `_Cilk_spawn` within a full expression. A function that
contains a spawn statement is called a spawning function.

Note: The spawned function [call]{.underline} may be a normal function
call, a member-function call, the function-call (parentheses) operator
of a function object (functor), or a call to a lambda expression.

A program is ~~considered~~ ill formed if the `_Cilk_spawn` form of this
expression appears other than in one of the following contexts:

-   as the ~~entire body~~ [full-expression]{.underline} of an
    expression statement,
-   as the entire right hand side of an assignment expression that is
    the ~~entire body~~ [full-expression]{.underline} of an expression
    statement, or
-   as the entire initializer-clause in a simple declaration [for an
    object with automatic storage duration]{.underline}.

~~(A `_Cilk_spawn` expression may be permitted in more contexts in the
future.)~~ [The rank of a spawned function call shall be zero. (See [The
section expression](#array.sect).)]{.underline}

A statement with a `_Cilk_spawn` on the right hand side of an assignment
or declaration is called an assignment spawn or
initializer spawn, respectively and the object assigned or initialized
by the spawn is called the receiver.

The iteration-statement is extended by adding another form of `for`
loop:

grainsize-pragma:
:   `# pragma cilk grainsize =` expression new-line

<!-- -->

iteration-statement:
:   grainsize-pragma~opt~ `_Cilk_for (` expression `;` expression `;`
    expression `)` statement
:   grainsize-pragma~opt~ `_Cilk_for (` declaration expression `;`
    expression `)` statement

[The three items inside parentheses in the grammar, separated by
semicolons, are called the initialization, condition, and increment,
respectively. (A semicolon is included in the grammar of
declaration.)]{.underline}

### Semantics

#### Tasking Execution Model

A strand is a serially-executed sequence of instructions that does not
contain a spawn point or sync point (as defined below). At a spawn
point, one strand (the initial strand) ends and two strands (the new
strands) begin. The initial strand ~~runs in series with~~ [is sequenced
before]{.underline} each of the new strands but the new strands [are
unsequenced with respect to one another (i.e. they]{.underline} may run
in parallel with each other[)]{.underline}. At a sync point, one or more
strands (the initial strands) end and one strand (the new strand)
begins. The initial strands ~~may run in parallel with one another~~
[are unsequenced with respect to one another]{.underline} but each of
the initial strands ~~runs in series with~~ [is sequenced
before]{.underline} the new strand. A single strand can be subdivided
into a sequence of shorter strands in any manner that is convenient for
modeling the computation. A maximal strand is one that cannot be
included in a longer strand.

The strands in an execution of a program form a directed acyclic graph
(DAG) in which spawn points and sync points comprise the vertices and
the strands comprise the directed edges, with time defining the
direction of each edge. (In an alternative DAG representation, sometimes
seen in the literature, the strands comprise the vertices and the
dependencies between the strands comprise the edges.)

#### [Serialization rule]

The behavior of a deterministic OpenCilk program is defined in terms of
its serialization, as defined in this section. If the serialization has
undefined behavior, the OpenCilk program also has undefined behavior.

The strands in an execution of a program are ordered according to the
order of execution of the equivalent code in the program\'s
serialization. Given two strands, the earlier strand is defined as the
strand that would execute first in the serial execution of the same
program with the same inputs, even though the two strands may execute in
either order or concurrently in the actual parallel execution.
Similarly, the terms "earliest," "latest," and "later" are used to
designate strands according to their serial ordering. The terms "left,"
"leftmost," "right," and "rightmost" are equivalent to "earlier,"
"earliest," "later," and "latest," respectively.

**The serialization of a pure C or C++ program is itself.**

If a C or C++ program has defined behavior and does not use the tasking
keywords or library functions, it is an OpenCilk with the same defined
behavior.

**The serializations of `_Cilk_spawn` and `_Cilk_sync` are empty.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by removing all instances of the keywords
`_Cilk_spawn`, and `_Cilk_sync`.

**The serialization of `_Cilk_for` is `for`.**

If an OpenCilk program has defined deterministic behavior, then that
behavior is the same as the behavior of the C or C++ program derived
from the original by replacing each instance of the `_Cilk_for` keyword
with `for`.
