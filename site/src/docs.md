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

## Getting Started

Start by setting up your local development environment by installing the necessary tools according
to the [installation instructions](#installation-instructions).

Now to test that the installed `bok` compiler works, copy this code sample in a file named `hello.bok`

```c
extern func printf(...) -> i32;

proc main()
    _ = printf("Hello, World!\n");
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

...

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

