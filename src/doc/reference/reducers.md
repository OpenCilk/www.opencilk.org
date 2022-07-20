---
title: Reducers
author: John F. Carr
tags: reference
---

## Reducers

When two threads access the same object there is a risk of a _{% defn
"determinacy race" %}_.  According to the C and C++ language standards
a race is undefined behavior.  Your program can give incorrect
results, crash, or worse.  A counter may not increment reliably or a
linked list may become corrupt.

Data types called _hyperobjects_ allow race-free access to shared
variables.

The type of hyperobject supported by OpenCilk 2.0 is called a
_reducer_.  Reducers are used when a shared object is modified
in a consistent way every time, such as by adding a number to
an accumulator or appending an item to a list.  As long as
the operation is _associative_ (`A ⊕ (B ⊕ C) = (A ⊕ B) ⊕ C`)
the final result will be correct.

Formally, a reducer is an instance of a mathematical object called a
_monoid_.  The reducer combines a type (e.g., `double`), an _identity_
value (`0.0`), and an associative binary operation (`+`).

The identity value is provided by a callback function which takes a
pointer to the value to be initialized (cast to `void`&nbsp;`*`).  The
binary operation, called reduction, is implemented by a function with
two pointer arguments pointing to the two values to be combined.  The
value pointed to by the second argument should be merged into the
value pointed to by the first argument.  Common names for these
functions are `identity` and `reduce` in the general case and `zero`
and `add` when computing a sum.

### Reducers and views

OpenCilk will ensure that every reference to a reducer uses a private
copy.  The private copy is called the _view_.  The address of the
current view can change at any spawn or sync, including the implicit
spawns and syncs associated with `cilk_for` and `cilk_scope`.  The
address operator `&` returns the address of the current view, so the
address of a reducer can change when the address of a normal variable
would be constant over its lifetime.  Be careful about saving the
address of a reducer.  The race detector (Cilk sanitizer) can be used
to check for improper retention of a pointer to a view.

When two views are to be distinguished, the one that would have been
created first in serial order is called the _left_ view and the other
the _right_ view.  The runtime guarantees that the reduction function
receives arguments in proper order, left before right.  (Even if the
operation is commutative, the runtime requires the result to be in the
left view.)  The variable declared by the programmer is sometimes
called the _leftmost_ view.

### Declaring a reducer

A reducer is declared with the `cilk_reducer` keyword, with the
identity and reduce functions as arguments:

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
alignment avoids false sharing on reducer accesses.  If greater
alignment is required a level of indirection must be added.

If you need a pointer to a reducer explicitly treated as a reducer use
`__builtin_addressof` to get one.  You can pass this pointer to
reducer-aware code.

```c
    extern long f(int index);
    void compute_sum(long cilk_reducer(zero, add) *reducer)
    {
        cilk_for (int i = 0; i < 10000000; ++i)
            *sum += f(i); // dereferenced pointer converts to current view
    }
    long provide_reducer()
    {
        long cilk_reducer(zero, add) sum;
        compute_sum(__builtin_address(sum));
        return sum;
    }
```

### Limitations

In OpenCilk 2.0 a reducer must be a variable.  Reducers may not be
dynamically allocated and may not be members of structures or arrays.
This limitation is planned to be removed in a future version of OpenCilk.

Reducers may not contain reducers.

Although the system will accept any expressions with the proper type
after `cilk_reduce`, names of functions are preferred.  Two reducers
have the same type if they have the same data type and equivalent
callback functions.  The compiler knows two functions are equivalent
if they are the same function referenced by name.  Anything more
complicated is not checked.  (It is impossible to prove reliably that
two arbitrary expressions are always equivalent.)

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


