---
layout: docs.njk
permalink: /docs.html
title: Documentation
description: Bedrock language documentation, memory model, type system, error handling, unsafe, FFI.
subtitle: "bedrock-lang reference"
---

## Introduction

`Bedrock` is an imperative, statically typed systems programming language designed
around simplicity, readability, and practicality.

The goal is to provide the control expected from a systems language while removing unnecessary
complexity from the programming model.

Memory is managed automatically through a **region-based memory model**. For C
interoperability an `unsafe` block is required.

The language intentionally avoids object-oriented programming. Programs are built using
procedures, functions, structs, and modules instead of classes or inheritance.

---
---

## Getting Started

Start by setting up your local development environment by installing the necessary tools according
to the [installation instructions](#installation-instructions).

Now to test that the installed `bok` compiler works, copy this code sample in a file named `hello.bok`

```c
extern proc printf(...);

proc main()
    printf("Hello, World!\n");
end
```

> Note: using libc printf until we have our own stdlib. :(

Then in your terminal run this command:

```bash
bok hello.bok --jit
```

or you can also compile it into a binary by doing this:

```bash
bok hello.bok -o hello
```

then run the binary `hello` that is created:

```bash
./hello
```

Voila! you have run your first program written in `bedrock`

Let's briefly breakdown what's happening in this program, then go into more detail throughout
the remainder of the tutorial.

The first line declares the printf function from the **C ABI** using Bedrock's
**foreign function interface** (FFI), allowing the program to link against `libc`.

The program's entry point is `main` which executes after program environment is initialized.
The shape of this function is defined by bedrock's standard `proc` which returns no values,
it's like a `void` function.

The purpose of this function for this demonstration is just printing **`Hello, World!`** to the console.

## Bedrock Basics

Bedrock's syntax might be of some familiarity to people who have used pascal or freebasic like languages.
The control flow in bedrock is divided into distinct blocks which starts with respective keyword
and ends with the keyword `end`.

This makes bedrock programs to be read procedurally like a documentation.

let's get started!

### Comments

Single line comments in bedrock starts with `//`

```c
// this is a comment
```

> there are no block comments as of now in bedrock  
> refer to [this](https://github.com/ziglang/zig/issues/161) discussion if you are curious why  
> but we are not rigid, so it could be there in future.

### Reserved Words

A good way to get a bird eye view of a language's style is to see what words it reserves.  
Here's what bedrock has:

```
import    pub     inline  func    proc    extern
type      struct  enum    static  const   var
defer     unsafe  if      elif    else    for
in        while   match   case    return  orelse
comptime  try     end     true    false   break
continue  nil     where   new     ptr
```

### Identifiers

The naming of variables/identifiers are similiar to other programming languages. Identifiers start
with a letter or underscore and may contain letters, digits, and underscores. Case is sensitive.

```bash
hi
openSource
NiklausWirth
bjarne_stroustrup
_dandalion
h2g2
```

In bedrock a new identifiers is assigned using `var` or `const` keyword. Here identifiers assigned using `var`
are mutable by default and variables assigned with `const` are non-mutable, bedrock overall has this property that
it's mutable by default.

```c
var a = 5;
var b = 5.42;
```

> here the type of `a` and `b` will be inferred, so it's not dynamic typing.

You can declare variables with explicit types.

Like this:

```c
var a: i32 = 5;
var b: f32 = 5.42;
var c: str = "hello sir";
```

> here the types are explicitly declared in syntax.

### Type Declarations

All user defined types begin with the type keyword.

- **Define a struct in bedrock**

```go
type Person = struct
  name: str,
  age: u32,
end
```

Structs are constructed using `where` keyword

```go
func main() -> i32
  var p1 = Point where name = "Alice", age = 20 end
  return 0;
end
```

> when using **where** initializing all values is necessary and if not then you will encounter a `semantic error`
> for safety purposes.

- **Define an **enum** in bedrock** (`todo`)

```go
type Color = enum
  red,
  yellow,
  green,
end
```

- **Aliasing in bedrock**

it's like `#define` or type aliasing in go.

```go
type real = f32;
type vecstring = [_]str;
```


> note: when type used for aliasing then **`end`** keyword is not used, instead **`;`** is used to end it.
As it's not starting a block and just ending in one line, unlike `struct` and `enum` (special types).
> see [discussion](https://github.com/orgs/bedrock-lang/discussions/2#discussioncomment-18088475) if you are more curious as to why.

### Newlines

A bedrock program could completely be written in a single line, though new lines should be used for convinience and better
readability

### Blocks

Bedrock does not uses curly braces to define blocks, but uses explicit `end` keyword where a block ends.
A block is everywhere inside of which a statement is allowed, like in `control flow` statements, `expressions`, etc.

Ex:

```c
if (eyes_open && morning)
    rise.shine();
else
    print("sleepy");
end
```

so here **if-else** is a block and you end it with the `end` keyword

If you forget to put `end` at the end of a block, then it's a hard error as block is not closed
and could lead to unwanted behaviour of your program.

```
proc foo()
    // do some crazy work...
end
```

this is also a block (a procedure block (more about it soon)) that does something crazy.

It's not necessary to have these blocks on different lines like, literally a block, u can have it like this too:

```c
if (is_even(n)) result = true; else result = false; end
```

### Booleans

A boolean represent truth or falsehood, bedrock have two literals for boolean, `true` and `false`. Their type
is `bool`.

### Numbers

Bedrock is a systems programming language so it has many built in strict types.

- **numerical literals**

```
0
42
-3.14
0xc1c1c1
10_21_201
```

- **numerical types**

```
u8
i8
u16
i16
u32
i32
u64
i64
usize (u64)
isize (i64)
f32 (float)
f64 (double)
```

### Strings

A string is array of bytes, in bedrock strings are not null terminated and are represented like this `{ ptr: *T, len: usize }`,
a fat pointer and the length, and for use with c ABI, it could be converted to a null terminated string. (`todo`)

- **String literals are surround in double quotes:**

```c
"bok bok"
```

- **Type of string is** `str` **in bedrock**

- **Escaping**

These escape characters are supported.

```bash
"\n" // Newline.
"\t" // Tab.
"\r" // Carriage return.
"\x00"
"\\" // A backslash.
"\"" // A double quote character.
"\a" // Alarm beep. (Who uses this?)
"\b" // Backspace.
"\f" // Formfeed.
"\v" // Vertical tab.
```

### Char

A char is simply of 8 bit so a char is just `u8`, but bedrock explicitly also has a type `char` (u8 only) for chars,
for convinience and better semantics.

### Ranges

A range is a little object that represents consecutive range of numbers. In bedrock you can represent a range
using `..` for exclusive range and `..=` for inclusive range.

So for example:

```c
for i in 0..10
    // print i
end
```

will print numbers from 0 to 9. Whereas,

```c
for i in 0..=10
    // print i
end
```

will print number from 0 to 10.

### Nil

Bedrock has special keyword `nil` which allows many things like if optional variable is not containing
any value, then it returns nil.

### Arrays

Array are data structures that stores homogenous type of elements in them.

In bedrock array are initialized like this:

```c
var arr: [10]i32 = [];
```

this initializes an empty array of capacity 10.

You can use `_` for inferencing an array's size, it could be used in such manner:

```c
var arr: [_]i32 = [1,2,3,4,5];
```

Then array will be of capacity 5.

Having such inferencing power allows us for quick declaration of variables,
for example you can initialize the above array in short hand like this too:

```c
var arr = [1,2,3,4,5];
```

But this:

```c
var arr = [];
```

or this:

```c
var arr:[_]i32 = [];
```

will result into an obvious  **semantic error** -> `cannot infer type or size of empty array literal`

> What's inferabble is inferabble what's not inferabble cannot be inferred.

**Accessing elements**

elements of an array are accessed like most other languages, using a `[]`.

```c
proc main()
  var arr = [1,2,3,4,5];
  const c = arr[2];
  printf("%d\n", c);
end
```
> **output**: 3

**Lists are also mutable**

```c
proc main()
  var arr = [1,2,3,4,5];
  arr[2] = 10;
  const c = arr[2];
  printf("%d\n", c);
end
```
> **output**: 10

### Slices

Just like array type bedrock has a slice type for passing arrays to functions or using it in some other way
like initializing in structs (`todo`).

```c
func foo(arr: []i32) -> i32
    return arr[2];
end
```

Here `arr` is passed to the function `foo`, and it does not requires any value or `_` as it just represents
the type of an array.

### Procedures and Functions

Bedrock has a clear seperation between a procedure (instantiated by keyword `proc`) and function (instantiated by keyword `func`)

#### proc

A procedure performs work but does not return a value.

```c
proc main()
    for i in 0..100
        printf("%d\n", i);
    end
end
```

If proc returns something then a strict semantic error is given by the compiler.

Such as this will result in error:

```c
proc main()
  for i in 0..100
    printf("%d\n", i);
  end
  return 1;
end
```
> **error**: proc cannot return a value

Whereas a bare `return` in proc works for early return in some branches.

```c
proc main()
  var a = 10;
  if (a > 10)
    return;
  else
    a = 20;
end
```

#### func

A function should always return a value

```c
func add(x: i32, y: i32) -> i32
  return x + y;
end

func main() -> i32
  return add(10, 10);
end
```

A function not returning a value will be warned to the user by compiler.

```
func add(x: i32, y: i32) -> i32
  var a = x + y;
end
```
> **warning**: control reaches the end of the function

---

This was an intentional and a well thought distinction between `proc` and `func` it improves **readablity** as
now just by seeing **proc** you know they are not returning anything and also for **func** we do explicit return
type checking but for **proc** it's not at all necessary proved in obvious way that it does not return any value at all.

This also syncs well with the language's procedural roots.

### Control Flow

In bedrock control flow constructs includes and are not limited to `if`, `match`, `while`, `for`.

#### --- If Statement ---

If is used for conditional statement control flow.

**used solo:**

```c
if (is_valid) doit(); end
```

**Use with else**

```c
if (is_valid) doit(); else dont(); end
```

**if-elif ladder**

```c
proc main()
  var a = 10;
  if (a == 1)
    printf("1\n");
  elif (a == 2)
    printf("2\n");
  elif (a == 3)
    printf("3\n");
end
```

**if-elif-else ladder**

```c
proc main()
  var a = 10;
  if (a == 1)
    printf("1\n");
  elif (a == 2)
    printf("2\n");
  elif (a == 3)
    printf("3\n");
  else
    printf("neo\n");
end
```

> output: neo

#### --- Match-Case (`todo`) ---

The `match-case` statements are the `switch-case` of bedrock.

You can use it for char, number, enums. The especiality of `match-case` is that it evaluates at compile
time so using them makes runtime faster.

Like using match for enums.

```c
match Color
    case red
        printf("red\n");
    case yellow
        printf("yellow\n");
    case green
        printf("green\n");
end
```

Here if enum `Color` have more elements in it then just *red, yellow and green* then semantically it could
give warning that not all variants were considered in the match-case.

For such situation to handle the default case we have the `else` in match:

```c
match Color
    case red
        printf("red\n");
    case yellow
        printf("yellow\n");
    case green
        printf("green\n");
    else
        printf("no color\n");
end
```

#### --- While Loop ---

The **While** loop works in same style, by instatiating a while block ending with `end`.

```c
proc main()
  var i = 0;
  while i < 5
    printf("%d\n", i);
    i+=1;
  end
end
```

> output:  
> 0  
> 1  
> 2  
> 3  
> 4  

#### --- For Loop ---

The **For** loop works in same style, by instatiating a for block ending with `end`.
You specify a binding variable and a range or an iterable structure.

```c
proc main()
  var arr = [10, 21, 42, 5];
  for i in arr
    printf("%d  ", i);
  end
end
```

> output: 10  21  42  5

**for ranges too:**

```c
proc main()
  for i in 7..10
    printf("%d  ", i);
  end
end
```
> output: 7  8  9

Here in both example the binding variable is `i` and it iterates over `arr` or the `range`.

### Optional Values (`todo`)

So some operations or some containers could have a value or not (maybe). These are optional values. And such
operations contain the optinal type.

These are denoted by `?` at suffix of them like `?user`

Here's a function returning optional value:

```c
func find_user(id: u32) -> ?User
```

Here the return User structure could have a `User struct` or `nil`.

### Error Propogation (`todo`)

The language syntax provides a concise way to propogate errors.
An error returning value will have a `!` at the end like `result!` unlike `?` which is appended at starting.

```c
func load_config() -> Config!
    var file = try open("config.cfg")
    return try parse(file)
end
```

- If the operation succeeds, execution continues using the returned value.
- If the operation returns an error, the current function immediately returns that error to its caller.

### Modules (`todo`)

Each `bok` file is a module and modules are imported using `import` keyword.

```python
import io;
import math;
import graphics.window;
```

any function, identifiers, user defined types, marked with **pub** could be now accessed in the file these modules
are imported into.

like:

```c
pub func add(a: i32, b: i32) -> i32
  return a + b
end
```

> So, by default all declarations are private in a module.


## Unsafe (`wip`)

The language is memory safe by default. Memory for language objects is managed automatically through the
region model (see: [memory model](#memory-model)), eliminating the need for manual allocation and deallocation in normal programs.

Certain low level operations, however, cannot be verified or protected by the compiler. These
operations must be performed inside an unsafe block.

```c
unsafe
// Unsafe operations
end
```

An unsafe block explicitly indicates that the programmer is taking responsibility for the correctness
of the enclosed code.

The presence of an unsafe block serves two purposes:
- It enables low level operations that are otherwise prohibited.
- It clearly communicates to readers that this section of code requires additional care and review.

Operations permitted within an unsafe block include:
- Manual memory allocation and deallocation.
- Raw pointer dereferencing.
- Pointer arithmetic.
- Calling foreign (C) functions.
- Accessing memory mapped hardware.
- Low level memory manipulation.
- Inline assembly (near future).

Example:

```c
extern func malloc(size: usize) -> *u8
extern proc free(ptr: *u8)

unsafe
  var buffer = malloc(4096)
  *(buffer + 8) = 42
  free(buffer)
end
```

## Memory Model (`wip`)

### Region Based

Bedrock uses regions to manage memory, every objects is being allocated in a region and it is reclaimed
from all of the region at once when the region goes out of scope intead of keep tracking each allocation.

### Invariants about region model

- Every allocation belongs to one region, all allocations within an arena are reclaimed together when that
region is destroyed.
- A reference cannot outlive its target, program cannot contain dangling references.
- Destruction happens exactly once when the region goes out of scope.

The compiler tracks the lifetime of references to make sure that a reference cannot outlive the
region it currently lives in.

```c
func ret_person() -> &Person
  region R
    var p = Person where id = 0, age = 24 end
    return &p;
  end
end
```

The compiler can determine that lifetime of `return` = `caller` and lifetime of `p` in region `R` ends before
caller uses the return reference, preventing dangling reference at compile time. User is not explicitly required
to annotate the region R in the above example the compiler can infer the lifetime in a function body.

### Lifetime concepts

#### Lexical Region

A lexical region corresponds to a local scope.

```c
proc lexical()
  region @outer
    var p1: &Person
    region @inner
      var p2 = Person where name = "Alice", age = 24 end
    p1 = &p2
    end
  end
end
```

Here both **p1** and **p2** are in lexical region, `lifetime(p2) < lifetime(p1)` so **p1** cannot
reference to **p2**. Its not necessary to type the region block manually the compiler can infer the
region annotations in this case.

#### Function params

Parameters are not a separate storage region. A reference parameter borrows an allocation
from the caller.

```c
proc set_friend(p: &Person, friend: &Person)
  p.friend = friend
end
```

Because friend might have a shorter lifetime than p, we need some lifetime annotation hints here.

```c
proc set_friend(p: &@p Person, friend: &@r Person)[@p <= @r]
  p.friend = friend
end
```

#### Return

A function cannot return a reference to storage whose lifetime ends before the caller can use the
return value. Local references cannot escape their lexical region. We cannot return a reference to
local variable to the caller that will result in dangling pointer.

```c
func foo() -> &Person
  var p = Person where name = "Alice", age = 24 end
  return &p
end
```

#### Static region

Static storage lives for the entire program.

```c
var local = new(@static) Person where name = "Alice", age = 24 end
```

## Foreign Function Interface

The language provides direct interoperability with C through the native ABI.

```c
extern proc printf(fmt: *u8)
extern func malloc(size: usize) -> *u8
```

or using variadic

```c
extern proc printf(...)
extern func malloc(...) -> *u8
```

This allows seamless integration with existing operating system APIs and C/C++ libraries.

**See the example using raylib:**

```c
extern proc InitWindow(...);
extern func WindowShouldClose() -> bool;
extern proc BeginDrawing();
extern proc EndDrawing();
extern proc CloseWindow();
extern proc ClearBackground(...);
extern proc DrawRectangle(...);

func main() -> i32
  var white: i64 = 245 | (245 << 8) | (245 << 16) | (255 << 24);
  var skin: i64 = 224 | (180 << 8) | (135 << 16) | (255 << 24);
  var nose: i64 = 188 | (142 << 8) | (106 << 16) | (255 << 24);
  var robe: i64 = 89 | (122 << 8) | (66 << 16) | (255 << 24);
  var robe_dark: i64 = 63 | (88 << 8) | (47 << 16) | (255 << 24);
  var black: i64 = 10 | (10 << 8) | (10 << 16) | (255 << 24);

  InitWindow(800, 600, "Minecraft Villager");
  while !WindowShouldClose()
    BeginDrawing();
    ClearBackground(white);

    // Arms
    DrawRectangle(290, 210, 35, 150, robe);
    DrawRectangle(475, 210, 35, 150, robe);

    // Body / robe
    DrawRectangle(320, 200, 160, 220, robe);
    DrawRectangle(320, 340, 160, 30, robe_dark);

    // Head
    DrawRectangle(340, 90, 120, 110, skin);

    // Eyebrows (villagers have a monobrow-style look per eye)
    DrawRectangle(355, 130, 25, 8, black);
    DrawRectangle(420, 130, 25, 8, black);

    // Big nose
    DrawRectangle(380, 138, 40, 55, nose);

    EndDrawing();
  end

  CloseWindow();
  return 0;
end
```

> output:

<figure>
  <img src="/images/villager.png" alt="edrock" loading="lazy">
</figure>

---
---

## Installation Instructions

For now the preferred way of installing bedrock until we have our own package manager is to go the
[bedrock github](https://github.com/bedrock-lang/bedrock) repo and follow the instructions in the **readme**
and you will have a working binary of bedrock called `bok`.

<!--
  Add more sections here as you write them, e.g.:
  ## Design goals
  ## Memory model
  Each "## Heading" automatically appears in the sidebar TOC to the left —
  no need to hand-edit a separate list of links anymore.
-->

