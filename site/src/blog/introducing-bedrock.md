---
layout: post.njk
title: Introducing Bedrock
date: 2026-09-18
description: Why we are building another systems programming language, and what we refuse to put in it.
permalink: "/blog/{{ page.fileSlug }}.html"
author: Aliqyan-21
---

# Meet Bedrock

Come here for a second. There's something we want to introduce to you.

<figure>
  <img src="/images/ed.png" alt="edrock" loading="lazy">
  <figcaption>The Bedrock mascot <b>edrock</b></figcaption>
</figure>

Its name is Bedrock. A systems programming language. We made it because we couldn't stop thinking about it,
and now that it's here standing on its own feet, we'd like to introduce it properly.

You probably have questions. *Another systems language? Really? With **C**, **Rust**, **Zig**, **Odin**, etc. already out
there?* Good.
Those are the right questions, and this whole post is an answer to them. We won't hand you a spec sheet.
In this blog I don't hand you a spec sheet, for that docs are there, this is here to just tell you what **bedrock** is
and why it exists.

## Where Bedrock came from

Bedrock began with curiosity, the plain, itchy kind. We knew know what really happens between typing a program
and having a machine run it, but now we wanted to do it ourselves.
We'd read about lexers, type checkers, and code generators, and reading only gets you so far.
The only way to truly understand a compiler is to build one, and once you've built one,
you want it to be for something.

So we asked ourselves a dangerous question: what would we want in a language, if we could have anything?

The answer came from a line in *Clean Code*. **Robert C. Martin** points out that the ratio of time spent reading
versus writing is well over `10 is to 1`. Sit with that.
So, we spend our lives *reading* code right? old code, someone else's code, our own code from a version of ourselves
who no longer exists. And yet most languages are designed as though the hard part is typing.

Bedrock is the opposite bet. **Make the code easy to read, and everything else gets easier.**
That one sentence is where it gets its "personality".

## How bedrock talks

Every block in Bedrock opens with a keyword and closes with `end`. There are no braces to count and no wondering
which one you're inside of.

```c
func main() -> i32
    var a = 0;
    for i in 0..=10
        a += i;
    end
    return a;
end
```

It also has a habit we think you'll come to like. It distinguishes between things that *do* and things that *give*.
A `proc` performs work and returns nothing. A `func` always hands you a value.
You know which one you're looking at before you read the second word.

```c
proc main()
    var msg: str = "Bedrock - A modern systems programming language:";
    var year: u16 = 2026;
    io.println("%s ~ %d\n", msg, year);
end

func add(x: i32, y: i32) -> i32
    return x + y;
end
```

Types are static and checked at compile time. You define your own with a single word, `type`,
and they read the way you'd describe them out loud:

```c
type Person = struct
    name: str,
    age: u32,
end

type Color = enum
    red,
    yellow,
    green,
end
```

And when you need to take a decision apart, `match` lays out every case in a column:

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

It's also honest about the two things programs fail at most. Something that might not exist says so in its type.
Something that might fail says so too, and passing that failure up the chain takes one word:

```c
func find_user(id: u32) -> ?User

func load_config() -> Config!
    var file = try open("config.cfg")
    return try parse(file)
end
```

If the operation works, execution continues with the value. If it doesn't, the function returns the error to its caller
right there. Done.

## What Bedrock believes in

Bedrock is built around a handful of strict convictions, and we'd rather tell you them than pretend that it's neutral.

**Simplicity is a feature you have to defend.** Programs are built from procedures, functions, structs, and modules.
There are no classes and no inheritance, on purpose. Data is data, behavior is behavior, and we like keeping them apart.

**No overloading or inheritance or polymorphism** no hidden control flow, that's it.

**Control is not the enemy of safety.** Systems programmers need to touch the machine. Bedrock manages memory
automatically through a **region-based model**, so ordinary programs don't juggle allocations by hand,
and the compiler keeps a reference from outliving the thing it points at.
The Memory Model details deserve another dedicated post of its own.
For now, just know the idea that the language handles the bookkeeping so you can think about the problem.

**Danger should be loud.** For the things no compiler can verify (raw pointers, pointer arithmetic, memory-mapped
hardware, calling C) there's an `unsafe` block. We thought about it much, and wanted `configurability` and `freedom`
to the user in our language, `unsafe` unlocks that tool for us, and it also waves a flag at every future
reader: *someone took responsibility for this part, look closely.*

unsafe as the name suggest is for unsafe thing where our memory model will be absent and the whole responsibility
will be in the programmer's hand, you want freedom? here have it!

```c
extern func malloc(size: usize) -> *u8
extern proc free(ptr: *u8)

unsafe
    var buffer = malloc(4096)
    *(buffer + 8) = 42
    free(buffer)
end
```

**The rest of the world is already there.** Now the 80-90% of the code on github or generally in world is c/c++.
Bedrock speaks C's ABI directly, so operating system APIs and the C libraries you already love are one `extern` away.
Here's the start of a raylib window, straight from Bedrock:

```c
extern proc InitWindow(w: i32, h: i32, title: str);
extern func WindowShouldClose() -> bool;
extern proc BeginDrawing();
extern proc EndDrawing();
extern proc CloseWindow();
extern proc ClearBackground(c: i64);

func main() -> i32
    var white: i64 = 245 | (245 << 8) | (245 << 16) | (255 << 24);
    InitWindow(800, 600, "Triangle");
    while !WindowShouldClose()
        BeginDrawing();
        ClearBackground(white);
        EndDrawing();
    end
    CloseWindow();
    return 0;
end
```

> we really wanted this ffi support to be friendly and easy so there is no need for seperate bindings to be made
just use the functions you want to by importing them from `extern`.

**Design in the open.** Every decision about the grammar, the semantics, and the memory model gets argued in public
discussions first between our team, and whoever who wants to say anything (we don't judge).
Bedrock isn't a decree from two people in a room. It's a conversation.

## Why Bedrock not just one of the others

You may already know some of its relatives, and we owe them a lot.

**C** taught us what it means to talk directly to the machine.

**Rust** proved that a systems language can be safe without a garbage collector,
and that changed what we believe is possible.

**Zig** showed us how much clarity you get when a language refuses to hide what it's doing.

We're not here to replace any of them. We're here because every language worth using started as
someone's stubborn opinion, and we think that space of opinions is nowhere near exhausted.
Ours is that a systems language can be safe and *readable*, powerful and *plain*,
and that the person reading its code in eight months is a user too.

That's the gap it stays in for now. And we think it's a good one.

## Where Bedrock is going

We want to be **honest** about the size of this dream, because we don't intend to be **modest** about it.

We want Bedrock to become a language people choose on purpose, the way they choose Zig or Rust or Odin,
with a community, an ecosystem, and real software built on top of it like standard library, lsp,
formatter and all those stuff.

We have a few concrete things planned for Bedrock itself.
Our goal is to make Bedrock mature enough for our daily use within a year.
After that, we want to build a PlayStation emulator in it, then games, and eventually,
if we're feeling especially unwell, an entire operating system from scratch. As it's obvious if a language
can't carry that, it isn't a systems language. So that's the standard we hold bedrock to.

Underneath the compiler, it stands on LLVM (for now, we also have this internal idea to make our own IR we are very much
inspired by [MIR](https://github.com/vnmakarov/mir)), so it speaks native code for real machines.
The compiler itself is written in Zig, and maybe one day we will write the bedrock compiler in bedrock itself.

## Why the name

Bedrock is the layer under everything else. It's what you build on when you don't want the ground to move.

## Say hello

Bedrock is young, curious, and very open to opinions. If you want to argue about its grammar, semantics, or how it
handles memory, the discussions are open. If you'd rather write code, there's a place for you in the compiler.

- [Bedrock doc](https://github.com/orgs/bedrock-lang/discussions/1)
- [Language grammar discussion](https://github.com/orgs/bedrock-lang/discussions/2)
- [Memory model discussion](https://github.com/orgs/bedrock-lang/discussions/3)
- [Language semantics discussion](https://github.com/orgs/bedrock-lang/discussions/4)
- [Compiler issues](https://github.com/bedrock-lang/bedrock/issues)

That's Bedrock. Take your time, and stay a while.

It is a hope you'll like it.
