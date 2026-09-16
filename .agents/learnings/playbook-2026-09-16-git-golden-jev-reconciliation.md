---
kind: playbook
date: 2026-09-16
slug: git-golden-jev-reconciliation
read_when:
  - git_conflict
  - sync_changes
  - branch_divergence
  - git_golden
  - pr_reconciliation
  - thermo_nuclear_review
  - jev_decisions
status: active
result: verified_playbook
shipped_to_product: true
---

# Playbook: Git Divergence, Jev Decision Calibration & Git Golden

Read this before resolving branch divergence, handling "Sync Changes" warnings,
reviewing PRs with merge conflicts, or returning the repository to `git golden`.

## Stop rules for the next agent

1. **Never click "Sync Changes" or run blind `git pull` on diverged branches.**
   Always run `git merge-tree --write-tree HEAD origin/main` first. If exit code is
   non-zero, Git will hit a merge conflict (often on binary assets like
   `poster.png`). Stop and evaluate before mutating the worktree.
2. **Never reset or rebase without an offline bundle backup.**
   Stashes and loose commits can be overwritten or pruned. Always write a full
   object snapshot first:
   ```sh
   git bundle create .cache/safety-backup-$(date +%s).bundle <branch>
   ```
3. **Do not guess on architectural forks; use TypeSafe Jev (`jev-latest`).**
   When choosing between rebase vs. merge, code refactoring vs. merging as-is,
   or testing scope boundaries against `AGENTS.md`, query Jev System One
   (`https://api.typesafe.ai/v1/systemone` using `TYPESAFE_API_KEY` in `.env.local`).
   Use `noul` for invariants and `choice` for strategy selection. If Jev scores
   a scope expansion low (<0.50), halt and choose the minimal 1-line alternative.
4. **Never merge a PR without checking the 3 Thermo-Nuclear Review traps:**
   - *Layer Leaks*: Did client transport (`src/ui/client/`) import UI widgets (`src/ui/`)?
   - *State Deadlocks*: Does an error "Retry" button resend the exact invalid payload?
   - *Code Judo*: Can regex `while`-loops or condition chains become single pure expressions?
5. **Always verify the Git Golden stop condition before handoff:**
   ```sh
   bash scripts/git-golden.sh
   ```
   Requires: on `main`, clean index, `HEAD == origin/main`, exactly 1 worktree, and
   only local branch `main`.

---

## The Happy-Path Protocol

### 1. Safety & Virtual Inspection
```sh
# 1. Virtual merge check (never touches working tree)
git merge-tree --write-tree HEAD origin/main

# 2. Inspect log divergence
git log --oneline @{u}..HEAD
git log --oneline HEAD..@{u}

# 3. Snapshot unmerged commits to an indestructible bundle
git bundle create .cache/local-backup.bundle <branch>
```

### 2. Jev-Powered Decision Script Pattern
Query Jev System One via Node or Python with structured state:
```python
import json, os, urllib.request

payload = {
    "state": { "issue": "...", "constraints": ["AGENTS.md scope", "..."] },
    "model": "jev-latest",
    "questions": {
        "strategy": {
            "type": "choice",
            "instructions": "Which resolution strategy preserves repo invariants?",
            "criteria": { "refine_and_merge": "...", "merge_as_is": "..." }
        }
    }
}
# POST to https://api.typesafe.ai/v1/systemone with Bearer TYPESAFE_API_KEY
```

### 3. Rebase & Surgical Conflict Resolution
Rebase the feature branch onto latest `main`:
```sh
git checkout <branch>
git rebase main
```
Resolve conflicts preserving both the merged upstream capabilities and the new
fixes. Verify that tests check behavior, not brittle implementation strings.

### 4. Quality Gate Verification
Run full typechecks, all contract tests, and deterministic smoke tests:
```sh
pnpm check
pnpm smoke
```

### 5. Clean Landing to Git Golden
```sh
# Merge PR on GitHub
gh pr merge <number> --squash --delete-branch

# Fast-forward local main
git checkout main && git pull origin main

# Prune ghost worktrees and delete local topic branches
git worktree prune
git branch -D <local-branch>

# Prove Git Golden
bash scripts/git-golden.sh
```
