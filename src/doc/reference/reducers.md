---
title: Reducers
author: John F. Carr
---

## Reducers

_Reducers_ are a new data type to help programmers avoid _{% defn
"data race", "data races" %}_.  Data races happen when one thread
modifies an object while a second thread is using it.  According to
the C and C++ language standards a race is undefined behavior.  Your
program can give incorrect results, crash, or worse.  A counter may
not increment reliably or a linked list may become corrupt.

A reducer is a special case of a more general type known as a
_hyperobject_.  Different types of hyperobjects are used depending on
the desired semantics.

Reducers are used when the final value in a variable is built up from
a series of independent modifications.  The modifications should all
be of the same kind, such as by adding a number to an accumulator or
appending an item to a list.  As long as the operation is
_associative_ (`A ⊕ (B ⊕ C) = (A ⊕ B) ⊕ C`) the final result will be
correct.

Formally, a reducer is a mathematical object called a _{% defn
"monoid" %}_.  A reducer has a type (e.g., `double`), an _identity_
value (`0.0`), and an associative binary operation (`+`).  The
operation does not need to be commutative.  A reducer can hold a list
with the binary operation being concatenation.

### Reducers and views

OpenCilk ensures that every reference to a reducer uses a private
copy, called a _view_.  The address of the current view can change at
any spawn or sync, including the implicit spawns and syncs associated
with `cilk_for` and `cilk_scope`.  The address operator `&` returns
the address of the current view, so the address of a reducer can
change when the address of a normal variable would be constant over
its lifetime.  Be careful about saving the address of a reducer.  The
race detector (Cilk sanitizer) can be used to check for improper
retention of a pointer to a view.

Views are created and merged using programmer-provided callback
functions commonly named `identity` and `reduce`.  The identity
callback takes a pointer to the value to be initialized (cast to
`void`&nbsp;`*`).  The reduce callback takes two pointer arguments
pointing to the two values to be combined.  The value pointed to by
the second argument should be merged into the value pointed to by the
first argument, and storage held by the second argument should be
freed.  Even if the operation is commutative, the result should be
stored in the first argument.

There is a total order on views, the order in which they would have
been created in a serial program.  The older of any pair of views is
conventionally called the _left_ view and the younger of the pair is
called the _right_ view.  The left view is the first argument to the
reduce callback.  The variable declared by the programmer is the
_leftmost_ view.  The programmer needs to initialize or construct the
variable just like any other.  See `<cilk/ostream_reducer.h>` for an
example where the leftmost view does not get the identity value.

### Declaring a reducer

A reducer is declared with the `cilk_reducer` keyword, with the
identity and reduce functions as arguments.

For example, to declare a reducer holding sums of `double`s
one can write

```c
    void zero_double(void *view) { *(double *)view = 0.0; }
    void add_double(void *left, void *right)
        { *(double *)left += *(double *)right; }
    double cilk_reducer(zero_double, add_double) sum;
```

When necessary the runtime calls the identity callback (constructor)
to create a new view.  All views created by the runtime will
eventually be combined with an older view using the reduction
operation.  Any information that needs to be saved should be merged
into the left view.  This may be as simple as adding two numbers.
Arbitrarily complicated data manipulation is possible.  (When the
right view is discarded without saving its contents the hyperobject is
called a _holder_.  Holders act as a form of thread-local storage that
does not remain valid across a spawn or sync.)

The memory occupied by the view itself is allocated by and owned by
the runtime.  In C++ `operator new` is not called.  If the type has a
C++ constructor, use placement `new` in the identity function.  If it
has a destructor, call the destructor explicitly instead of using
`delete`:

```cpp
    void identity(void *view)
    {
        new (view) Type();
    }
    void reduce(void *left, void *right)
    {
        // Here data moves from the right view to the left view.
        static_cast<Type *>(left)->reduce(static_cast<Type *>(right));
        static_cast<Type *>(right)->~Type();
        // The right view will be freed on return from this function.
    }
    Type cilk_reducer(identity, reduce) var; // var is a reducer
```

If the data type requires a custom allocator a level of indirection
can be added by using a pointer type:

```cpp
    void identity(void *view)
    {
        // Type::operator new will be used, if defined.
        *static_cast<Type **>(view) = new Type();
    }
    void reduce(void *left, void *right)
    {
        (*static_cast<Type **>(left))->reduce(*static_cast<Type **>(right));
        delete *static_cast<Type **>(right);
    }
    Type *cilk_reducer(identity, reduce) var;
```

Formally, the `cilk_reducer` keyword is part of the type of the
variable rather than an attribute of the variable itself.  It binds
much like `*`.  In particular,

```c
    Type cilk_reducer a, b;
```

declares a reducer and a non-reducer variable, like

```c
    Type *a, b;
```

declares a pointer and a non-pointer.  A `typedef` can be used
for more pleasing declarations:

```c
    typedef Type cilk_reducer TypeReducer;
    TypeReducer a, b;
```

Modifications to a reducer should be consistent with the binary
operator.  For example, if the reduction adds two views then all
modifications of the reducer should use `+=`.  At least, the total of
all modifications between a `cilk_spawn` and the next `cilk_sync`
should be equivalent to `+=` (or whatever the `reduce` function does).
This is because the value of a reducer is unpredictable in parallel
code.  It may become the identity at any `cilk_spawn` or change
abruptly at any `cilk_sync`.  The runtime ensures that the sum (for
example) is always correct at the end, but not in the middle.

Declaring a variable to be a reducer does not change its size.  In the
current implementation all views allocated by the runtime are aligned
to the size of a cache line (64 bytes on supported platforms).  This
alignment avoids {% defn "false sharing" %} on reducer accesses.  If
greater alignment is required a level of indirection must be added.

Because reducers are types, pointers to reducers are possible.  If you
need a pointer to a reducer explicitly treated as a reducer use
`__builtin_addressof` to get one.  You can pass this pointer to
reducer-aware code.

```c
    extern long f(int index);
    // The argument is a pointer to a reducer.
    void compute_sum(long cilk_reducer(zero, add) *reducer)
    {
        cilk_for (int i = 0; i < 10000000; ++i)
            *sum += f(i); // dereferenced pointer converts to current view
    }
    long provide_reducer()
    {
        long cilk_reducer(zero, add) sum = 0L; // must be initialized
        compute_sum(__builtin_address(sum));
        return sum;
    }
```

### Limitations

In OpenCilk 2.0 a reducer must be a variable.  Reducers may not be
dynamically allocated and may not be members of structures or arrays.
This limitation is planned to be removed in a future version of OpenCilk.

Reducers may not contain reducers.

Callback functions should not spawn.

Callback functions should be passed by name to `cilk_reduce`.  Two
reducers have the same type if they have the same data type and
equivalent callback functions.  If the callback functions are
expressions other than the names of functions the compiler does not
know whether they are equivalent and may give spurious errors about
type incompatibility.  Proving expression equivalence is an unsolvable
problem in the general case.

In C++, reducers are not implicitly converted to views when binding
references.  This limitation is planned to be removed in a future
version of OpenCilk.  As a workaround, you can take the address of the
reducer, yielding a pointer to the current view, and dereference the
pointer.

```cpp
extern void f(int &, int _Hyperobject &);
void g(int _Hyperobject *p)
{
  f(*&*p, *p); // ideally you could write f(*p, *p);
}
```

### Porting from Cilk Plus

The macros used by Intel Cilk Plus are no longer required.
The example from former `<cilk/reducer.h>`

```c
    CILK_C_DECLARE_REDUCER(int) my_add_int_reducer =
        CILK_C_INIT_REDUCER(int,
                            add_int_reduce,
                            add_int_identity,
                            0,
                            0);
```

becomes

```c
    int cilk_reducer(add_int_identity, add_int_reduce) my_add_int_reducer;
```

Where Cilk Plus allowed up to five callback functions, OpenCilk has
only two and they have different signatures.

* The identity and reduce functions lose their first argument,
which was a pointer to the hyperobject itself.

* The destructor is no longer a separate function.  The right operand
to reduce is always destroyed immediately after reduction and no
functionality is added by having a separate destructor.  Cilk Plus
reduce functions may need to have a destructor call added to work as
OpenCilk reduce functions.

* Custom memory allocation functions are not supported by OpenCilk.
Memory for the view is provided by the runtime.  Reducers may allocate
their own additional storage.

As noted above, heap-allocated reducers are not supported in
OpenCilk 2.0.


