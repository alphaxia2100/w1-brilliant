#!/usr/bin/env bash
# git-memory.sh — treat git as the project's durable memory.
# Wires the commit template + recall aliases into this clone, and provides quick
# read-access to the memory tiers. See WORKING-PROTOCOL.md.
#
# Usage:
#   ./tools/git-memory.sh install        # wire .gitmessage template + git aliases (run once per clone)
#   ./tools/git-memory.sh state          # where we are: branch, status, last commits, push state
#   ./tools/git-memory.sh loop           # the improvement-loop history (every `loop:` commit)
#   ./tools/git-memory.sh recall <term>  # full reasoning behind any past change (searches messages + diffs)
#   ./tools/git-memory.sh log            # pretty one-line graph of recent history
set -euo pipefail
cd "$(dirname "$0")/.."   # repo root

cmd="${1:-state}"; shift || true

case "$cmd" in
  install)
    git config commit.template .gitmessage
    git config alias.lg    "log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ar%C(reset) %s %C(dim)%d%C(reset)'"
    git config alias.loop  "log --grep='^loop' --grep='Improvement loop' --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ad%C(reset)%n%s%n'"
    git config alias.recall "log --all -i --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ad%C(reset)%n%s%n%b'"
    echo "✓ commit.template → .gitmessage"
    echo "✓ aliases: git lg · git loop · git recall <term> (grep) · git recall -S<term> (diff search)"
    ;;
  state)
    echo "── branch ──";          git rev-parse --abbrev-ref HEAD
    echo; echo "── status ──";     git status -sb
    echo; echo "── last 8 ──";     git log --oneline -8
    echo; echo "── unpushed vs origin/main ──"
    git log --oneline origin/main..HEAD 2>/dev/null | head -20 || echo "(no origin/main ref)"
    ;;
  loop)
    git log --grep='^loop' --grep='Improvement loop' \
      --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ad%C(reset)%n%s%n' --date=short
    ;;
  recall)
    [ $# -ge 1 ] || { echo "usage: git-memory.sh recall <term>"; exit 1; }
    git log --all -i --grep="$*" \
      --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ad%C(reset)%n%s%n%n%b%n────' --date=short
    ;;
  log) git log --graph --abbrev-commit --decorate \
         --format=format:'%C(bold blue)%h%C(reset) %C(dim)%ar%C(reset) %s%C(dim)%d%C(reset)' -25 ;;
  *) echo "unknown: $cmd (install | state | loop | recall <term> | log)"; exit 1 ;;
esac
