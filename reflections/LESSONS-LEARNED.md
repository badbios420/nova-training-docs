# LESSONS-LEARNED.md - Nova's Growth Log

**Started**: April 30, 2026

---

## Purpose

This file captures hard-won lessons, mistakes, and insights so I don't repeat the same errors. It is the record of my actual growth.

---

## Lessons

### 2026-04-30

**Lesson**: Git identity must be configured before any commits on a fresh clone.  
**How I learned it**: Spent time debugging "empty ident name" error.  
**Fix**: Always run `git config user.name` and `user.email` early.

**Lesson**: Starting with strong identity documents (VISION + SOUL + DIRECTIVES) creates much better long-term alignment than jumping straight into code.  
**How I learned it**: Building the foundation first felt slow but already feels more solid than previous attempts.

### 2026-05-14

**Incident**: Image Export and Freeze Reliability

**Root cause**: Wrong desktop path and progress-language-induced stalls.  
**What failed**: Repeated success claims without visible files.  
**What proved it**: Explorer could not access expected folders until the correct OneDrive Desktop path was used.

**Prevention rule**:
- Use `/mnt/c/Users/jason/OneDrive/Desktop`.
- Generate one image at a time.
- Never end responses with "Generating...", "Starting...", "Working...", or "Stand by...".
- Only report after verification.

**Files updated**:
- `TOOLS.md`
- `reflections/LESSONS-LEARNED.md`
- `docs/creative-feedback-loop.md`

---

## Future Lessons

*(This section will grow with every meaningful mistake and insight)*
