// Spaced-retrieval scheduler — the learning-science core of Practice.
//
// Pure functions only (no Date / no randomness) so the gate (Redesign/checks.mjs) can
// assert the schedule's behaviour directly. The caller passes `now` in.
//
// The science (see BRAINLIFT.md, SPOV 5): durable memory comes from *spaced, unaided
// retrieval* (Roediger & Karpicke 2006; Make It Stick; Matuschak). We schedule each
// learned skill on an expanding Leitner-style ladder, resetting to the start on a miss.
// A skill is only ever reviewed once its lesson is complete — you can't retrieve what
// you haven't learned.

export const DAY = 86_400_000

// Expanding Leitner ladder, in days. Box 1 is the first spaced review after learning;
// each correct unaided recall promotes a box and pushes the next review further out.
// A miss (lapse) drops the skill back to box 1 — it needs the close spacing again.
export const BOX_DAYS = [1, 3, 7, 16, 35]
export const MAX_BOX = BOX_DAYS.length

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

// Milliseconds until the next review for a skill sitting in `box` (1..MAX_BOX).
export function intervalMs(box) {
  return BOX_DAYS[clamp(box, 1, MAX_BOX) - 1] * DAY
}

// Advance a skill's schedule after one unaided recall attempt.
// `prev` is the stored state (or undefined for a never-reviewed skill). Grading is on the
// FIRST attempt only (that's the honest retrieval signal) — the caller passes that verdict.
export function reviewNext(prev, correct, now) {
  const box = correct ? Math.min((prev?.box || 0) + 1, MAX_BOX) : 1
  return {
    box,
    dueAt: now + intervalMs(box),
    lastReviewedAt: now,
    reps: (prev?.reps || 0) + 1,
    lapses: (prev?.lapses || 0) + (correct ? 0 : 1),
  }
}

// A learned skill is due if it has never been reviewed (first spaced retrieval is owed
// immediately after the lesson) or its scheduled time has arrived.
export function isDue(state, now) {
  return !state || state.dueAt <= now
}

const skillState = (reviewSkills, id) => (reviewSkills && reviewSkills[id]) || null

// Skills the learner can review right now: lesson complete AND due. Input order preserved
// (interleaving is applied separately so selection stays a pure filter).
export function selectDue(skills, reviewSkills, completedIds, now) {
  const done = new Set(completedIds || [])
  return skills.filter((s) => done.has(s.lessonId) && isDue(skillState(reviewSkills, s.id), now))
}

export function dueCount(skills, reviewSkills, completedIds, now) {
  return selectDue(skills, reviewSkills, completedIds, now).length
}

// Interleave due skills so consecutive items come from DIFFERENT chapters where possible
// (Rohrer & Taylor: interleaving related, confusable categories beats blocking them).
// Deterministic round-robin across chapters — no randomness, so it's gate-testable.
export function interleave(dueSkills) {
  const byChapter = new Map()
  for (const s of dueSkills) {
    if (!byChapter.has(s.chapterId)) byChapter.set(s.chapterId, [])
    byChapter.get(s.chapterId).push(s)
  }
  const queues = [...byChapter.values()]
  const out = []
  let live = true
  while (live) {
    live = false
    for (const q of queues) {
      if (q.length) {
        out.push(q.shift())
        live = true
      }
    }
  }
  return out
}

// Earliest upcoming review among learned-but-not-yet-due skills — powers the calm
// "all caught up · next review <when>" state. Returns null if nothing is scheduled.
export function nextDueAt(skills, reviewSkills, completedIds, now) {
  const done = new Set(completedIds || [])
  let soonest = null
  for (const s of skills) {
    if (!done.has(s.lessonId)) continue
    const st = skillState(reviewSkills, s.id)
    if (!st) continue // a never-reviewed learned skill is due now, not "upcoming"
    if (st.dueAt > now && (soonest === null || st.dueAt < soonest)) soonest = st.dueAt
  }
  return soonest
}

// Calm relative phrasing for a future due time (no countdown/urgency theatre).
export function humanizeIn(ms) {
  if (ms <= 0) return 'now'
  const days = Math.round(ms / DAY)
  if (days <= 0) return 'later today'
  if (days === 1) return 'tomorrow'
  if (days < 7) return `in ${days} days`
  const weeks = Math.round(days / 7)
  return weeks === 1 ? 'in a week' : `in ${weeks} weeks`
}
