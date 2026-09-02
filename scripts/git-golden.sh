#!/usr/bin/env bash
# On-demand git-golden check. Exit 0 iff this product repo matches the named
# stop condition. Never mutates. Not a CI gate.
set -u

root=$(git rev-parse --show-toplevel 2>/dev/null) || {
	echo 'FAIL  not a git repository'
	echo 'not git golden'
	exit 1
}
cd "$root" || exit 1

fail=0
ok() { printf 'PASS  %s\n' "$1"; }
bad() { printf 'FAIL  %s\n' "$1"; fail=1; }

if git fetch origin main --quiet; then
	ok 'fetched origin/main'
else
	bad 'could not fetch origin/main'
fi

branch=$(git branch --show-current)
if [ "$branch" = main ]; then
	ok 'on main'
else
	bad "on '${branch:-detached}' not main"
fi

if [ -z "$(git status --short)" ]; then
	ok 'working tree clean'
else
	bad 'working tree dirty'
	git status --short
fi

head=$(git rev-parse HEAD)
remote=$(git rev-parse origin/main 2>/dev/null || echo '')
if [ -n "$remote" ] && [ "$head" = "$remote" ]; then
	ok "HEAD == origin/main ($head)"
else
	bad "HEAD ${head} != origin/main ${remote:-missing}"
fi

wt_count=$(git worktree list --porcelain | awk '/^worktree / { n++ } END { print n+0 }')
if [ "$wt_count" -eq 1 ]; then
	ok 'exactly one worktree'
else
	bad "worktree count ${wt_count} != 1"
	git worktree list
fi

extra=$(git for-each-ref --format='%(refname:short)' refs/heads | grep -v '^main$' || true)
if [ -z "$extra" ]; then
	ok 'only local branch is main'
else
	bad 'extra local branches'
	printf '%s\n' "$extra"
fi

if [ "$fail" -eq 0 ]; then
	echo 'git golden'
	exit 0
fi
echo 'not git golden'
exit 1
