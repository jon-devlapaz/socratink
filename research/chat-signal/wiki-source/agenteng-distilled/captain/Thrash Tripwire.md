# Thrash Tripwire

Numeric STOPs for Ship and IDE >15 min. Paste into AGENTS when ready (research draft).

## Boot gate — S010 / N010

Before tools: `/goal` · repo · cwd · proof · stop · Not-in-this-PR. **Refuse boot** if Outcome missing.

## Numeric tripwires — S030

| # | Tripwire | Action |
| ---: | --- | --- |
| 1 | **≥3 identical tool signatures** without green gate | One variable → retry once; else rewrite `/goal` |
| 2 | **≥5 same-file edit cycles** without green gate | **STOP.** Replate. No “one more polish.” |
| 3 | Skill-path hunt substituting for Outcome+proof | Plate first |
| 4 | Retry/error campaign without plate rewrite | New `/goal` from repo truth |
| 5 | Extreme thrash ∩ low happy ∩ low verify | Fatal — park; do not ship |

**S065:** high Axis-A + thrash ≠ healthy loop.

## Cost slide (order-of-magnitude)

IDE thrash leaders ~**1770 / 1384 / 915** tools vs gold cloud `#8–#14` median ~**164** unique tool-roles → ~**10×**. Arm **S030** as cost brake. See [[IDE vs Ship]].

## Pocket checklist

1. Plate present? else refuse
2. Tripwire fired? → replate
3. Proof = named commands or Unverified
4. Auth → FM-PRREV; CONCERN ≠ closed
5. Green for `/goal` → stop; new `/goal` next phase
6. Merge-bound → Ship

See [[Goal Template]] · [[Crew Wake]].
