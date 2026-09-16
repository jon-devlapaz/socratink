# PARETO-01 cold archive

Captain-authorized **NOISE** cut (FM-PARETO-CUT). Material here is
**recoverable history**, not default agent context.

## Why cold

These paths were high-volume research runs and mega skill packs that inflated
preload surface area without serving the Socratink product hot path. Keeping
them in-tree caused agents to discover, load, or treat archive material as
live doctrine.

## Do not preload

Coding agents must **never** preload or glob-read `research/_cold-archive/**`
unless a human explicitly points at a specific restored path. See root
[`AGENTS.md`](../../../AGENTS.md) for the live contract.

Moved mega skills under `skills/` are **archive-only**. They are not listed as
default loadable project skills. Restore deliberately if Captain re-authorizes.

## How to restore

1. Read [`MANIFEST.txt`](MANIFEST.txt) for the exact source → archive mapping.
2. `git mv` (or copy) the subtree back to its hot-tree location from
   [`MANIFEST.txt`](MANIFEST.txt).
3. Update root `AGENTS.md` and `.agents/skills/README.md` if skills return to
   the hot tree.
4. Open a PR; do not merge without Captain word.

Policy freezes that remain in force after restore are documented in
[`FREEZE.md`](FREEZE.md).

## Related archives

- [`../DOCPRUNE-01/`](../DOCPRUNE-01/) — prior doc-prune cold archive (JSON
  runs, wiki copies, smell/pilot packs).
