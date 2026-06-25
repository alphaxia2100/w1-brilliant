# Working Protocol — Git is the memory

**An agent forgets. Git doesn't.** Between sessions and context-compactions I lose working memory,
but the repository is a durable, timestamped, queryable, immutable record that survives all of it. So
git *is* the memory system. This file is the contract for how we use it to stay on track and never
re-derive, re-litigate, or lose work.

> **The one rule under all the others:** never assert or edit from memory. Re-read the file, re-run
> the gate, sweep the engine. Stale mental models have caused real bugs here (a confabulated lesson
> count, a falsehood that "renders fine," a `setDoc` crash green checks missed). Verify ground truth,
> *then* speak. See `~/.claude/.../memory/sky-model.md`.

## The three memory tiers (read in this order on every cold start)
| Tier | File | Role | Cadence |
|---|---|---|---|
| **Working memory** | `HANDOFF.md` | Where we are *right now* + the branch/push/deploy state table. Read first. | Rewritten each session |
| **Episodic ledger** | `Factory/IMPROVEMENTS-LOG.md` | The improvement loop: every iteration's decision, outcome, and the re-ranked backlog. Append-only. | One entry per iteration |
| **Audit trail** | `git log` | The immutable truth. Every atomic change is one commit whose message *is* a memory record. | One commit per unit of work |

A fourth tier lives outside the repo: `~/.claude/projects/.../memory/` — durable judgment, preferences,
and the Sky-model. The in-repo `MEMORY.md`-style index there points to it. In-repo memory is *what we
did*; out-of-repo memory is *how we should work and what Sky values*.

## Cold-start recovery (the rehydrate procedure)
1. `HANDOFF.md` → current state + the branch/push/deploy table.
2. `Factory/IMPROVEMENTS-LOG.md` → the live loop + backlog + what was rejected and why.
3. `git log --oneline -20` and `git status` → confirm the handoff against reality (the handoff can lag;
   git can't). Use `./tools/git-memory.sh recall <term>` to pull the full reasoning behind any past change.
4. The out-of-repo memory files → Sky's values + corrections log.
5. **Before trusting any quantitative or "renders fine" claim from any of the above, verify it in the
   live engine / gate.** The docs record what was *believed* true when written.

## Commit = the memory write (the contract)
Every atomic unit of work ends in a commit. The message is not bookkeeping — it's the record a future
session reads to reconstruct *what changed, why, and how we knew it worked*, without re-running the work.

- **Atomic.** One logical change per commit. Don't bundle a fix with a refactor with a doc edit.
- **Subject:** `<tag>: <imperative summary>` (≤72 chars). Tags: `lesson` `factory` `loop` `fix`
  `engine` `docs` `memory` `chore`. (`loop` = an improvement-loop iteration; keep these greppable.)
- **Body answers three questions** — WHAT changed · WHY (the leverage / the bug it fixes) · VERIFIED
  (the exact checks: `npm test` count, build, the live walkthrough, any engine sweep with numbers).
- **Trailer:** `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- A `.gitmessage` template enforces this skeleton; `./tools/git-memory.sh install` wires it + the
  recall aliases into this clone.

**Committing is durably authorized.** Never ask permission to commit reversible internal work — commit
as you go so a compaction can never cost progress. Push/merge-to-main/deploy are the user's calls.

## The improvement loop (how the core advances)
`research/pick highest-leverage item → revise (build it) → verify → commit → log in the ledger → reschedule`.
Self-correcting: each iteration re-reads the ledger, updates the backlog from what it learned, and stops
scheduling when nothing high-value is left. The loop is autonomous and Sky-approved; it self-fires via a
wakeup. **To stop it, just don't reschedule.** (As of this writing no wakeup is active — the session-3
loop lapsed; restart it deliberately, don't assume it's running.)

**Verification bar — non-negotiable for any shipped change:** `npm test` green · `npm run build` clean ·
**walked live** in the browser at mobile 375px *and* desktop (the gate is blind to prose/pixel divergence —
eyeball it) · any quantitative claim about a sim **proven by an engine sweep**, not by design intent.

## Branch / deploy discipline
- Work on a feature branch (currently `lesson-factory`); never commit straight to `main`.
- `HANDOFF.md` keeps the three-state table (origin/main · local main · branch · deployed) honest, because
  "pushed", "merged", and "deployed" drift apart and have burned us before.
- Nothing destructive touches `main` or `origin` without the user's explicit go.

## Anti-drift checklist (what "keep on track" actually means)
- [ ] Re-read the file before asserting its contents or editing it.
- [ ] Core before periphery — deepen the lessons; don't gold-plate onboarding/a11y/perf while the core is thin.
- [ ] Ship the thing, don't plan it — a verified artifact counts; a doc/plan does not.
- [ ] Prove sim claims in-engine; never ship a beat the captured artifact disproves.
- [ ] Don't say "done" after a narrow check — full e2e, both widths, wrong paths.
- [ ] Commit each atomic step + log each loop iteration, so the trail is the memory.
