---
layout: post.njk
title: Region Based Memory Model of Bedrock
date: 2026-09-20
description: How Bedrock is memory safe without a GC
permalink: "/blog/{{ page.fileSlug }}.html"
author: Aliqyan-21
---

<style>
.bd-fig { margin: 2.5rem auto; max-width: 640px; }
.bd-fig svg { width: 100%; height: auto; display: block; }
.bd-fig text { font-family: var(--mono); }
.bd-fig-cap { margin-top: 0.6rem; font-size: 0.85rem; color: var(--ink-faint); font-family: var(--mono); text-align: center; }
.bd-label { font-size: 13px; font-weight: 700; fill: var(--ink); }
.bd-sub { font-size: 11px; fill: var(--ink-faint); }
.bd-note { font-size: 12px; fill: var(--accent); font-weight: 700; }
.bd-ok { font-size: 12px; fill: #4b6b3f; font-weight: 700; }
.bd-container { fill: var(--paper-dim); stroke: var(--rule-strong); stroke-width: 1; }
.bd-container-inner { fill: var(--paper); stroke: var(--ink-soft); stroke-width: 1; stroke-dasharray: 4 3; }
.bd-box { fill: var(--paper); stroke: var(--ink); stroke-width: 1; }
.bd-box-warn { fill: var(--paper); stroke: var(--accent); stroke-width: 1; }
.bd-arrow-bad { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 4 4; fill: none; }
.bd-arrow-ok { stroke: #4b6b3f; stroke-width: 1.5; fill: none; }
.bd-lead { stroke: var(--ink-soft); stroke-width: 1; stroke-dasharray: 2 3; fill: none; }
</style>

We say Bedrock is memory safe, but we also say that it does not have a GC or a borrow checker like in `rust`,
and it's not completely something like `zig` and `c` in which you have to do manual memory management, then how
does bedrock handles memory? How it prevents memory leaks, and what does the programmer have in hand then for
memory management in bedrock?

So, our memory model is  **Region Based Memory Model**, it's not something new that we have invented, but we are surely
going to innovate on it. And thus let's start with a little history of where this comes from and what we are thinking of
doing with it.

> P.S. **I must tell you it's still work in progress, so this blog is all about how much progress we have made.**

> P.S. **Most of the thinking on this model was done by `vasucp1207`, like the Rule-1, Rule-2 and Rule-3 and then refined upon and 
Rule-4 by me.**

## Where this comes from

It all started in 1994, when two people **Tofte** and **Talpin** came along and published their work on the ML Kit
compiler in [**this**](https://www.sciencedirect.com/science/article/pii/S0890540196926139) paper.

They talked about a stack of nested regions, freed all at once when the enclosing scope closes, inner always
dying before outer. That invariant, the one I open the next section with, is thirty years old.
So, we dug deep and got it out of there, and checked about innovations upon this.

Thus came [**Cyclone**](https://cyclone.thelanguage.org/wiki/Introduction%20to%20Cyclone/) a safe dialect of C from the
early 2000s. This is the closest ancestor to what's actually we are going to do. It attaches a region name to every
pointer type and defines an outlives relation between regions, with subtyping built on top of it, so a pointer into
a longer-lived region can stand in wherever a shorter-lived one is expected. And we read it's memory model and until now
we have come up with some rules, **4** exactly at present, that if applied, we can fuzz and soon formally prove them
such that we can imbibe in our compiler and it will guarantee that if those 4 rules are followed,
**then** the compiled program is <u>memory safe</u> by proof.

So coming back to the rules that I mentioned, **Rule-1** and **Rule-2**, are basically Cyclone's outlives subtyping
applied to a narrower case. Cyclone actually permits a more **general region graph** than Bedrock does,
so yeah, there are some restrictions we have put on top of cyclone's model of our own.

The constraint syntax on function parameters, `[@p <= @r]` does same job as Rust's `where 'p: 'r` bound: declare a
relationship between two lifetime parameters, check it symbolically inside the function, check it again concretely
at every call site. Rust's version lives inside a large, **general partial order of regions**, computed by non-lexical
lifetime analysis. And our Bedrock's version of it is a totally different, it lives inside a plain **stack of depths**,
a total order, it's like the game [Steamworld Dig](en.wikipedia.org/wiki/SteamWorld_Dig) you keep going deep into the regions
and the compiler will be aware of all the depths.

After Cyclone we have [**Austral**](https://austral-lang.org/), it is closest thing I know of, of a language doing **almost**
this, linear types, plus a reference type explicitly bound to the region it was borrowed in, checked lexically instead of
through a general borrow checker.

**So what's ours?**

The restriction, and some new mechanism, we will propose later when the need arise (honestly we have not thought of it yet).
But convincingly what we did, after a thorough understanding and quite some night full of discussing memory, is...we gave up...
On Cyclone's arbitrary region graph and Rust's non-lexical inference, in exchange for a lifetime model that's
just a **stack of numbers**, because we wanted it to be small enough that we can build some **countable rules** around it
that covers all of it and something like a fuzzer can hammer on it exhaustively instead of just saying *"yeah, since we have
this mechanism that's why it will be memory safe"*, but to also **prove it formally** using languages like [**`lean`**](https://lean-lang.org/).

So that's the actual thing, and that was the whole journey of where all this came from
(it didn't fell from the sky surely...hehe).

Now we are ready to go into the actual memory model we have designed as of yet (the rules actually).

This sentence is all that you should remember if you wanna know about Bedrock's memory model.

**A reference can never outlive the thing it points to.**

## Regions

```lua
region @A
    var x = 5
    var y = x + 1
end
```

You can also have a nameless region, like it will just be a block then like in c (`{}`).

- `region` opens a new arena.
- Every `var` declared inside it lives in that arena.
- `end` throws the whole arena away, all at once.
- Regions nest. 
- something declared in an inner region always dies before, or at the same time as,
something in an outer region. Never after!

<div class="bd-fig">
<svg viewBox="0 0 620 300" role="img" aria-label="An outer region with an inner region nested inside it">
<rect class="bd-container" x="20" y="20" width="580" height="260" rx="6"/>
<text class="bd-label" x="40" y="48">region @outer</text>
<text class="bd-sub" x="40" y="66">alive until program end</text>
<rect class="bd-container-inner" x="80" y="110" width="440" height="140" rx="6"/>
<text class="bd-label" x="100" y="138">region @inner</text>
<text class="bd-sub" x="100" y="156">dies first, before @outer</text>
</svg>
</div>
<p class="bd-fig-cap">Regions nest. Inner always dies first.</p>

This ordering is the **foundation**.

The rules below enforces that a reference can't point from something that dies later into something that dies sooner,
and once you write a value in, it isn't allowed the other way either.

There are 4 rules as of now. There could be more too later...(as I said we are still working on it, we want to make it perfect(mostly)).

## Rule 1: a region can't hand you back a reference into itself

```lua
proc lexical()
    region @outer
        var p1: &Person
        region @inner
            var p2 = Person where name = "Alice", age = 24 end
            p1 = &p2          -- NOT ALLOWED
        end
    end
end
```

<div class="bd-fig">
<svg viewBox="0 0 680 330" role="img" aria-label="p1 lives in the outer region, p2 lives in the inner region, assigning p1 from p2 is rejected">
<defs><marker id="bd-arrow1" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<rect class="bd-container" x="90" y="50" width="500" height="260" rx="6"/>
<text class="bd-label" x="120" y="78">@outer</text>
<rect class="bd-container-inner" x="140" y="170" width="380" height="110" rx="6"/>
<text class="bd-label" x="170" y="196">@inner</text>
<rect class="bd-box" x="350" y="100" width="160" height="44" rx="4"/>
<text class="bd-label" x="430" y="122" text-anchor="middle" dominant-baseline="central">p1: &amp;Person</text>
<rect class="bd-box-warn" x="170" y="220" width="170" height="44" rx="4"/>
<text class="bd-label" x="255" y="242" text-anchor="middle" dominant-baseline="central">p2: Person</text>
<path class="bd-arrow-bad" d="M255 220 L370 144" marker-end="url(#bd-arrow1)"/>
<text class="bd-note" x="290" y="205" text-anchor="middle">not allowed</text>
</svg>
</div>
<p class="bd-fig-cap">p2 dies with @inner. p1 outlives it. The assignment is rejected.</p>

Here, `p2` dies with `@inner`.
`p1` lives in `@outer`, which outlives `@inner` region.
So, when we do something like `p1 = &p2` in `@inner` we are saying that we are making `p1` point at `p2`, which will
definitely die before `p1` ever does, as it's in the inner region, and thus when this region ends `p1` will be left
pointing at something that does not exist anymore...(why this sounds so sad though?)

This thus will get rejected at compile time, before it ever runs.
Same story for `return &local` out of a `region`, it's also same situation only.

## Rule 2: you can't smuggle a reference out through assignment

Now **Rule 1** is great at catching the escape when it happens through the exit of a region.
But it says nothing about a plain assignment sitting in the middle of a function, so...say is something like below is possible then?

```lua
region @inner
    var inner_value = 99
    target = &inner_value
end
```

Here we are pointing `target` at `inner_value` which is defined inside the `@inner` region only, so what about this?
Now it depends on where the target is coming from, because if it belongs to an outer region, then my freind, you are
in big trouble.

Let's zoom out:

```lua
proc main()
    region @outer
        var anchor = 0
        var target: &i32 = &anchor
        region @inner
            var inner_value = 99
            target = &inner_value       -- NOT ALLOWED
        end
    end
end
```

<div class="bd-fig">
<svg viewBox="0 0 680 330" role="img" aria-label="target lives in the outer region, inner_value lives in the inner region, assigning target from inner_value is rejected">
<defs><marker id="bd-arrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<rect class="bd-container" x="90" y="50" width="500" height="260" rx="6"/>
<text class="bd-label" x="120" y="78">@outer</text>
<rect class="bd-container-inner" x="140" y="170" width="380" height="110" rx="6"/>
<text class="bd-label" x="170" y="196">@inner</text>
<rect class="bd-box" x="340" y="100" width="180" height="44" rx="4"/>
<text class="bd-label" x="430" y="122" text-anchor="middle" dominant-baseline="central">target: &amp;i32</text>
<rect class="bd-box-warn" x="170" y="220" width="180" height="44" rx="4"/>
<text class="bd-label" x="260" y="242" text-anchor="middle" dominant-baseline="central">inner_value: i32</text>
<path class="bd-arrow-bad" d="M260 220 L370 144" marker-end="url(#bd-arrow2)"/>
<text class="bd-note" x="300" y="205" text-anchor="middle">not allowed</text>
</svg>
</div>
<p class="bd-fig-cap">Checked at the assignment itself, not only at region exit.</p>

So, we can see that `target` lives in `@outer`.
`&inner_value` is only good for as long as `@inner` is open.

Stated generally, (since the example above is just one instance of the actual rule):

> When you write a reference into something, whatever it points at has to live at least as long as the
thing you're writing into.

That's checked at every `x = &y`, every `struct.field = &y`, every `arr[i] = &y` by the compiler̀. Not only when a region closes. It's the same comparison every time, just applied wherever a reference gets written down.

## Rule 3: parameters have to say what they need up front (yeah...)

Function parameters don't get their own region.
You can use `p`, deref it, write through it, but you can't take `&p`,
it has no storage cell of its own. For one parameter that's a fine thing. BUT...it stops being fine the moment
two parameters need a relationship to each other:

```lua
proc set_friend(p: &@p Person, f: &@r Person)[@p <= @r]
    p.friend = f;
end
```

You see that **`[@p <= @r]`** thingy?

That's bedrock's syntax for a **promise** written on the signature, and it's **checked twice**.

- Once symbolically, inside the body: does the promised relationship actually make `p.friend = friend` legal?
Here we use the rule 2's own check but this time we do it on the symbols instead of the depths.

- Then 2nd time it happens at every call site, *concretely*, once the compiler knows what the real arguments are:

```lua
-- kept:
region @outer
    set_friend(&alice, &bob)     -- both in @outer

    -- rejected at the call:
    region @inner
        var temp = Person where name = "jack", firend = "alice" end
        set_friend(&alice, &temp)   -- temp doesn't outlive alice
    end
end
```

<div class="bd-fig">
<svg viewBox="0 0 680 260" role="img" aria-label="Two calls to set_friend, one accepted because both arguments share a region, one rejected because one argument is shorter lived">
<defs><marker id="bd-arrow3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<text class="bd-ok" x="180" y="40" text-anchor="middle">accepted</text>
<rect class="bd-box" x="70" y="60" width="220" height="44" rx="4"/>
<text class="bd-label" x="180" y="82" text-anchor="middle" dominant-baseline="central">p = alice (@outer)</text>
<rect class="bd-box" x="70" y="170" width="220" height="44" rx="4"/>
<text class="bd-label" x="180" y="192" text-anchor="middle" dominant-baseline="central">friend = bob (@outer)</text>
<line class="bd-arrow-ok" x1="180" y1="104" x2="180" y2="170" marker-end="url(#bd-arrow3)"/>
<text class="bd-sub" x="180" y="142" text-anchor="middle">@p &lt;= @r holds</text>
<text class="bd-note" x="500" y="40" text-anchor="middle">rejected</text>
<rect class="bd-box" x="390" y="60" width="220" height="44" rx="4"/>
<text class="bd-label" x="500" y="82" text-anchor="middle" dominant-baseline="central">p = alice (@outer)</text>
<rect class="bd-box-warn" x="390" y="170" width="220" height="44" rx="4"/>
<text class="bd-label" x="500" y="192" text-anchor="middle" dominant-baseline="central">friend = temp (@inner)</text>
<path class="bd-arrow-bad" d="M500 104 L500 170" marker-end="url(#bd-arrow3)"/>
<text class="bd-sub" x="500" y="142" text-anchor="middle">@p &lt;= @r fails</text>
</svg>
</div>
<p class="bd-fig-cap">Same check, run with the real argument depths at each call site.</p>

The first call passes because both arguments live in the same region, so the promise is trivially true.
The second fails because `temp` doesn't live long enough to satisfy what `set_friend` requires of it,
and the compiler catches that at the call site without **even** looking inside `set_friend` again.

## Rule 4: allocating past your own region, on purpose

So until now we have defined the restrictions, that you can do this and not this, etc...but Bedrock is also about expressiveness
and freedom, so this rule gives that to the programmer, when you want something in a region to outlive that region!
*`(it's like Gojo opening Unlimited Void domain in Jogo's Coffin of the Iron Mountain domain)`*

So you want to build something that outlives the region you're currently standing in?

Introducing...**`new(@p)`** a way of doing region promotion.

It allocates directly at whatever depth `@p` names, instead of the region you happen to be in when you write the line:

```lua
proc process(parent: &@p Person)
    var child = new(@p) Person where name = "Alice" end
    parent.child = child
end
```

So what voodoo happened above is that the child structure now formed not inside the

That much is straightforward. Where it gets interesting is the fields you initialize on the new object. `new(@p)` being legal only tells you `@p` itself is a real, currently open region. It says nothing about what you hand to the constructor:

```lua
proc process(parent: &@p Person)
    region @inner
        var temp = Person where name = "Temp", age = 0 end
        var child = new(@p) Person where name = "Alice", friend = &temp  end -- NOT ALLOWED
        parent.child = child
    end
end
```

<div class="bd-fig">
<svg viewBox="0 0 680 370" role="img" aria-label="child is allocated at the outer region and correctly outlives it, but its friend field points into the inner region and is rejected">
<defs><marker id="bd-arrow4" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<rect class="bd-container" x="90" y="50" width="500" height="300" rx="6"/>
<text class="bd-label" x="120" y="78">@p (caller's region)</text>
<rect class="bd-container-inner" x="140" y="170" width="380" height="150" rx="6"/>
<text class="bd-label" x="170" y="196">@inner</text>
<rect class="bd-box-warn" x="170" y="220" width="140" height="44" rx="4"/>
<text class="bd-label" x="240" y="242" text-anchor="middle" dominant-baseline="central">temp: Person</text>
<rect class="bd-box" x="350" y="220" width="140" height="44" rx="4"/>
<text class="bd-label" x="420" y="242" text-anchor="middle" dominant-baseline="central">child: Person</text>
<line class="bd-lead" x1="420" y1="220" x2="420" y2="178" marker-end="url(#bd-arrow4)"/>
<text class="bd-sub" x="420" y="160" text-anchor="middle">new(@p), lives at @p</text>
<path class="bd-arrow-bad" d="M310 242 L350 242" marker-end="url(#bd-arrow4)"/>
<text class="bd-note" x="330" y="205" text-anchor="middle">friend=&amp;temp not allowed</text>
</svg>
</div>
<p class="bd-fig-cap">child correctly lives at @p. Its friend field, checked against @p, does not.</p>

So here `child` genuinely lives at `@p`, that part is fine, `@p` outlives `@inner`.
But `child.friend` points at `temp`, and `temp` dies with `@inner`.

So now we have a problem, once that region closes, `child` is still alive but `child.friend` is dangling.

So to mitigate this `Rule 2` will come into action here!

Every reference-typed field written inside a `new(@p) Struct(...)` gets checked the same way `rule 2` checks
an ordinary assignment, except the container depth used in this check is `@p`, the depth the object will
actually live at when function called, not the region the constructor call happens to be written in.

So, it's just the same comparison as rule 2, just pointed at the right depth.

The ordinary case, a field pointing at something that already lives at `@p` or shallower, is still accepted.

This only rejects the case that would actually dangle...hehe.

> This rule might have some design problems, that we will surely address and refine while we write the proofs for Rules in lean/coq.

---

So that's it for now for our **bedrock memory model**.

I hope you enjoyed reading this as much as I enjoyed writing it.

We will probabaly be thinking of more rules (if they apply) for new features surely and update this blog accordingly,
or make a new blog...

Until then...Peace.
