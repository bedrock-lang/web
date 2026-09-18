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

