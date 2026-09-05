# Andrej Karpathy: recent public posts

Research cutoff: **2026-08-01**
Scope: new first-party public statements received after the main research lanes

## Evidence policy

This file preserves recent material before it has been fully incorporated into
the larger research ledgers. Text supplied directly by the user is treated as a
transcript of a first-party post, but its provenance remains incomplete until
the original URL and publication timestamp are independently verified.

## 2026-08-01 — Opus 5 procedural story world

- Author: Andrej Karpathy (`@karpathy`)
- Platform: X
- Date: 2026-08-01, based on the user's statement that it had "just" been
  published; exact timestamp pending
- Original URL: pending
- Provenance: full post text supplied by the user on 2026-08-01; exact-phrase
  web searches and a direct profile fetch did not surface an indexed post URL
- Confidence: high that the supplied text is the intended source; incomplete
  bibliographic verification

### Supplied transcript

> We're starting to leave the territory where you'd test an LLM by e.g.
> "create an svg of pelican on a bicycle". As one idea to generalize it, I was
> interested what Opus 5 would do if I gave it the first paragraph of the Lord
> of the Rings, a 1M token budget (~$10) and asked for three js render of it.
> Opus went off for ~2 hours and wrote 5500 lines of code that (procedurally)
> rendered the story. It's kind of janky but fun. But it's a bit mindboggling
> that the LLM has to place and orchestrate various polygon assets in (x,y,z)
> coordinates and write code that animates it all, and that it even does
> anything at all.
>
> I also like this kind of examples because no one in their right mind would
> ever spend the time to write something this custom but LLMs have all the
> stamina and patience in the world, so it's an example where we go from "no
> one would ever do this" to "sure, why not, it's ~free". There might be a lot
> more. But I'm excited about creating hyper custom worlds that you can imagine
> dropping players into, e.g. here to participate in the LoTR story as a
> spectator NPC, or one of the characters, or etc. Something like an ephemeral
> GTA of X on demand.
>
> Last thought is that the domain of worlds/games exposes a weakness in LLMs:
> they can't easily audit their work because they aren't able to efficiently
> and natively perceive videos or play games within them. Here, Opus 5 had to
> very slowly and painstakingly take screenshots at different points, and it
> messed up a few times and created a bunch of jank. An example of raw
> capability (multimodal, gameplay) that I think is still quite lacking.

### Synthesis notes

**Documented pattern:** Long-horizon generation can make highly bespoke,
interactive artifacts economical even when their one-off value would never
justify human implementation time.

**Framework implication:** Search for tasks suppressed by labor economics,
not only tasks humans already perform. Personalized worlds, simulations,
explanations, and disposable software are candidate surfaces.

**Boundary:** Generation capability has outrun native evaluation in multimodal,
temporal, and interactive environments. Screenshot sampling is a weak and slow
substitute for perceiving video and playing a game.

Do not generalize this single demonstration into a claim that generated games
are reliable, polished, or production-ready.
