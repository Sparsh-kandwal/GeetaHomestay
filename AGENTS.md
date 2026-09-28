# Agent Instructions — Geeta Homestay

## Context Protocol

1. BEFORE making any code changes, read PROJECT_CONTEXT.md first to
   understand existing functionality, architecture, and conventions.
   Do not re-scan the full codebase if PROJECT_CONTEXT.md already answers
   the question.

2. AFTER making any change that adds, removes, or modifies a feature,
   API endpoint, data model, or architectural pattern, update the
   relevant section(s) of PROJECT_CONTEXT.md in the same task — before
   marking the task complete. Do not wait to be asked.

3. Keep updates surgical: edit only the section(s) affected by the
   change. Do not rewrite the whole file or change its structure unless
   the change is structural.

4. If a change is trivial (typo fix, formatting, minor refactor with no
   behavior change), PROJECT_CONTEXT.md does not need to be touched.

5. If PROJECT_CONTEXT.md and the actual code ever disagree, trust the
   code — and fix PROJECT_CONTEXT.md to match, flagging the discrepancy
   to the user.

6. Never commit .env files or print/log secret values (API keys, JWT
   secrets, DB credentials) in any file, including PROJECT_CONTEXT.md
   itself — reference env var names only, never their values.

## Production Safety

This is a live production app. Before any change to auth, payment
routes, or middleware:
- Flag the change explicitly as security-relevant before applying it.
- Never weaken `requireAuth` further or remove auth checks without
  explicit confirmation.

### Default auth posture

This project is tightening security. Apply "require login by default"
across the backend:
- A route should only be reachable without authentication if it serves
  genuinely public, non-user-specific data (e.g. room listings,
  testimonials, a health check endpoint).
- When adding a new route, or reviewing an existing one, default to
  `requireAuth`. Only leave a route open if there's a clear, specific
  reason — and state that reason when you do.
- Never introduce an "optional auth" pattern (proceeding without
  `req.user` when no token is present) without explicit confirmation
  first. If a route seems to need anonymous + logged-in support, stop
  and ask rather than deciding unilaterally.
- If unsure whether a route should be public or protected, default to
  protected and flag it for review rather than leaving it open.