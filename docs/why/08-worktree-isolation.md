---
title: Worktree isolation
summary: One worktree per agent keeps parallel edits apart. Cleaning them up is where work gets lost, so the cleanup script treats ignored files as work.
group: Operations
order: 1
---

## The problem

Two agents in one checkout edit the same files, run each other's half-finished builds, and
commit each other's changes. Separate clones fix that, but they cost disk space and drift
from each other.

Worktrees fix both problems but add a new one: they pile up. Every agent run leaves a
folder and a branch, and the obvious cleanup, `git worktree remove`, is less careful than it
looks.

## The practice

- **One worktree per agent or task**, on its own branch, created from fresh `main`. RULES.md
  R4 asks for it, and enforces it by honor alone. With one worktree each, a bad command
  damages one branch, not the whole checkout.
- **`scripts/cleanup-worktrees.ps1` lists before it deletes.** A dry run is the default.
  `-Apply` removes only worktrees that are merged, stale or missing. It always keeps the main
  worktree, locked worktrees, and any worktree with uncommitted or untracked changes.
- **Ignored files count as work.** The script runs `git status --porcelain --ignored`, lists
  any ignored files, and keeps the worktree unless you pass `-Force`. Rebuildable folders,
  such as `node_modules` and `dist`, are listed in `-Disposable` and don't count.
- **Removal never uses `--force`**, so Git refuses anything it considers dirty, even if the
  script got it wrong.

## Evidence

- Git's manual says `remove` works only on "clean worktrees (no untracked files and no
  modification in tracked files)". Ignored files are neither, so Git deletes them without
  asking.
  ([git-worktree](https://git-scm.com/docs/git-worktree))
- Claude Code's worktree docs suggest a `.worktreeinclude` file that copies gitignored files
  "like `.env` or `.env.local`" into each new worktree. Agent worktrees are therefore exactly
  where ignored secrets end up. The same page says exit cleanup checks for "changed or
  untracked files", and it doesn't mention ignored ones.
  ([Worktrees](https://code.claude.com/docs/en/worktrees))
- In this repo, the first version of the cleanup script checked `git status --porcelain`
  without `--ignored`. A review run of `-Apply` deleted a `.env` from a merged worktree. PR #27
  added the ignored-file check and a Windows self-test, which asserts that the file is still
  there afterwards.

## Limits

- `-Disposable` matches folder names anywhere in the tree. A secret kept in a folder called
  `build/` would still be deleted. Shorten the list if your repo does that.
- Worktrees share one `.git`, so they share hooks, config and the object store. They isolate
  files, not permissions. An agent in one worktree can still push any branch. Real isolation
  needs a sandbox, a container or a separate machine.
- The cleanup script is PowerShell 5.1, for Windows. On other systems, run
  `git status --porcelain --ignored` yourself before you remove a worktree.
