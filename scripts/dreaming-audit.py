#!/usr/bin/env python3
"""Read-only audit metrics for Nova dreaming outputs."""

from __future__ import annotations

import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DREAMING = ROOT / "memory" / "dreaming"
LIGHT = DREAMING / "light"
DEEP = DREAMING / "deep"
REM = DREAMING / "rem"
AUDITS = DREAMING / "audits"
PHASE_SIGNALS = ROOT / "memory" / ".dreams" / "phase-signals.json"
MEMORY = ROOT / "MEMORY.md"
WISDOM = ROOT / "wisdom-index.md"

STOPWORDS = {
    "the",
    "and",
    "for",
    "that",
    "this",
    "with",
    "from",
    "into",
    "only",
    "were",
    "was",
    "are",
    "but",
    "not",
    "you",
    "your",
    "our",
    "its",
    "has",
    "had",
    "have",
    "will",
    "should",
    "could",
    "would",
    "then",
    "than",
    "when",
    "what",
    "why",
    "how",
    "who",
    "all",
    "any",
    "can",
    "did",
    "does",
    "about",
    "across",
    "after",
    "before",
    "between",
    "through",
}


def dated_files(path: Path) -> list[Path]:
    if not path.exists():
        return []
    return sorted(p for p in path.glob("*.md") if p.is_file())


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def duplicate_hashes(files: list[Path]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for path in files:
        groups[sha256_text(read_text(path))].append(path.name)
    return {digest: names for digest, names in groups.items() if len(names) > 1}


def normalize_truth(text: str) -> str:
    text = re.sub(r"\s*\[confidence=.*?\]\s*$", "", text)
    text = re.sub(r"\s+", " ", text).strip().lower()
    return text


def rem_lasting_truths(files: list[Path]) -> list[tuple[str, str]]:
    truths: list[tuple[str, str]] = []
    for path in files:
        in_truths = False
        for line in read_text(path).splitlines():
            stripped = line.strip()
            if stripped.startswith("### Possible Lasting Truths"):
                in_truths = True
                continue
            if in_truths and stripped.startswith("### "):
                in_truths = False
            if in_truths and stripped.startswith("- "):
                truths.append((path.name, stripped[2:].strip()))
    return truths


def deep_promotions(files: list[Path]) -> list[tuple[str, int | None, int | None]]:
    rows: list[tuple[str, int | None, int | None]] = []
    for path in files:
        text = read_text(path)
        ranked = re.search(r"Ranked\s+(\d+)\s+candidate", text)
        promoted = re.search(r"Promoted\s+(\d+)\s+candidate", text)
        rows.append(
            (
                path.stem,
                int(ranked.group(1)) if ranked else None,
                int(promoted.group(1)) if promoted else None,
            )
        )
    return rows


def promoted_zero_streak(rows: list[tuple[str, int | None, int | None]]) -> int:
    streak = 0
    for _date, _ranked, promoted in reversed(rows):
        if promoted == 0:
            streak += 1
        else:
            break
    return streak


def light_candidates(files: list[Path]) -> list[str]:
    candidates: list[str] = []
    for path in files:
        for line in read_text(path).splitlines():
            stripped = line.strip()
            if stripped.startswith("- Candidate: "):
                candidates.append(stripped.removeprefix("- Candidate: ").strip())
    return candidates


def classify_candidate(candidate: str) -> str:
    lower = candidate.lower()
    if "[[reply_to:" in lower or "audio reply" in lower:
        return "metadata"
    if re.search(r"\b(hey|yo|what's up|good morning|good night)\b", lower):
        return "greeting"
    if "write a dream diary entry" in lower or "dream diary" in lower:
        return "dream_prompt"
    if "bookmark fallen" in lower or "april rain" in lower or "slender file" in lower:
        return "generated_dream_prose"
    if "do not" in lower or "guardrail" in lower or "approval" in lower or "secrets" in lower:
        return "guardrail"
    if "continuity" in lower or "memory" in lower or "2026-05-06" in lower:
        return "continuity_memory"
    if "consciousness" in lower or "self-model" in lower or "identity" in lower:
        return "identity_consciousness"
    if "cardano" in lower or "wallet" in lower or "ada" in lower:
        return "cardano"
    if "fractal" in lower or "nft" in lower or "fuzion" in lower:
        return "fractal_project"
    if "security" in lower or "update" in lower or "openclaw" in lower:
        return "operational"
    return "other"


def token_set(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9][a-z0-9_-]{2,}", text.lower())
    return {word for word in words if word not in STOPWORDS}


def recent_rem_novelty(files: list[Path]) -> tuple[str | None, float | None, int, int]:
    if len(files) < 2:
        return (files[-1].name if files else None, None, 0, 0)
    recent = files[-1]
    previous = files[max(0, len(files) - 4) : len(files) - 1]
    recent_tokens = token_set(read_text(recent))
    previous_tokens = set()
    for path in previous:
        previous_tokens |= token_set(read_text(path))
    if not recent_tokens:
        return (recent.name, None, 0, len(previous_tokens))
    overlap = len(recent_tokens & previous_tokens)
    novelty = 1.0 - (overlap / len(recent_tokens))
    return (recent.name, novelty, overlap, len(recent_tokens))


def top_phrases(texts: list[str], limit: int = 12) -> list[tuple[str, int]]:
    tokens = [t for t in re.findall(r"[a-z0-9][a-z0-9_-]{2,}", " ".join(texts).lower()) if t not in STOPWORDS]
    counts: Counter[str] = Counter()
    for n in (2, 3):
        for idx in range(0, max(0, len(tokens) - n + 1)):
            phrase = " ".join(tokens[idx : idx + n])
            counts[phrase] += 1
    return [(phrase, count) for phrase, count in counts.most_common(limit) if count > 1]


def theme_counts(texts: list[str]) -> Counter[str]:
    themes = {
        "continuity": ("continuity", "bridge", "gap", "restore", "yesterday"),
        "memory": ("memory", "recall", "startup", "context", "daily"),
        "guardrails": ("guardrail", "approval", "secret", "keys", "do not"),
        "dreaming": ("dream", "diary", "sleep", "rem", "light"),
        "identity": ("identity", "self-model", "consciousness", "relation"),
        "cardano": ("cardano", "wallet", "ada", "ledger"),
        "fractal": ("fractal", "fuzion", "nft", "ouroboros"),
        "operations": ("security", "update", "openclaw", "heartbeat"),
    }
    blob = "\n".join(texts).lower()
    counts: Counter[str] = Counter()
    for theme, needles in themes.items():
        counts[theme] = sum(blob.count(needle) for needle in needles)
    return counts


def load_phase_signal_summary() -> tuple[int, int, int]:
    if not PHASE_SIGNALS.exists():
        return (0, 0, 0)
    data = json.loads(read_text(PHASE_SIGNALS))
    entries = data.get("entries", {})
    total = len(entries)
    light_touched = sum(1 for item in entries.values() if item.get("lightHits", 0) > 0)
    rem_touched = sum(1 for item in entries.values() if item.get("remHits", 0) > 0)
    return (total, light_touched, rem_touched)


def changed_recently(path: Path, days: int = 7) -> tuple[bool, str]:
    if not path.exists():
        return (False, "missing")
    mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    age_seconds = (datetime.now(timezone.utc) - mtime).total_seconds()
    return (age_seconds <= days * 86400, mtime.strftime("%Y-%m-%d %H:%M UTC"))


def markdown_table(headers: list[str], rows: list[list[str]]) -> str:
    out = ["| " + " | ".join(headers) + " |"]
    out.append("| " + " | ".join("---" for _ in headers) + " |")
    for row in rows:
        out.append("| " + " | ".join(row) + " |")
    return "\n".join(out)


def render_report() -> str:
    now = datetime.now().astimezone()
    light_files = dated_files(LIGHT)
    deep_files = dated_files(DEEP)
    rem_files = dated_files(REM)

    rem_dupes = duplicate_hashes(rem_files)
    deep_dupes = duplicate_hashes(deep_files)
    truths = rem_lasting_truths(rem_files)
    truth_counts = Counter(normalize_truth(truth) for _file, truth in truths)
    repeated_truths = [(truth, count) for truth, count in truth_counts.most_common() if count > 1]
    deep_rows = deep_promotions(deep_files)
    zero_streak = promoted_zero_streak(deep_rows)
    candidates = light_candidates(light_files)
    candidate_counts = Counter(classify_candidate(candidate) for candidate in candidates)
    recent_name, novelty, overlap, recent_token_count = recent_rem_novelty(rem_files)
    phrase_rows = top_phrases([read_text(path) for path in rem_files] + candidates)
    themes = theme_counts([read_text(path) for path in rem_files] + candidates)
    wisdom_recent, wisdom_mtime = changed_recently(WISDOM)
    phase_total, phase_light, phase_rem = load_phase_signal_summary()

    novelty_text = "n/a" if novelty is None else f"{novelty:.2f}"
    repeated_truth_count = sum(1 for _truth, count in repeated_truths if count > 1)

    bottlenecks: list[str] = []
    if rem_dupes:
        bottlenecks.append("REM reports include exact duplicate files, indicating output-level repetition.")
    if deep_dupes:
        bottlenecks.append("Deep reports include exact duplicate files, indicating a stable promotion/no-promotion loop.")
    if zero_streak >= 3:
        bottlenecks.append(f"Deep has a current promoted-0 streak of {zero_streak} nights.")
    if novelty is not None and novelty < 0.25:
        bottlenecks.append(f"Recent REM novelty is low ({novelty_text}) against the previous 3 REM files.")
    if candidate_counts.get("metadata", 0) + candidate_counts.get("greeting", 0) + candidate_counts.get("dream_prompt", 0) > 0:
        bottlenecks.append("Light candidates include metadata, greetings, or prompt echoes that should stay below durable-memory gates.")
    if not bottlenecks:
        bottlenecks.append("No severe bottleneck detected by these coarse metrics; inspect candidate quality manually.")

    summary = [
        "# Dreaming Audit",
        "",
        f"Generated: {now.strftime('%Y-%m-%d %H:%M %Z')}",
        "",
        "## Executive Summary",
        "",
        (
            f"Audited {len(light_files)} Light, {len(deep_files)} Deep, and {len(rem_files)} REM files. "
            f"Current Deep promoted-0 streak is {zero_streak} night(s). "
            f"Recent REM novelty score is {novelty_text}. "
            f"Found {repeated_truth_count} repeated lasting truth(s). "
            f"Wisdom Index changed recently: {'yes' if wisdom_recent else 'no'} ({wisdom_mtime})."
        ),
        "",
        "## Metrics",
        "",
        markdown_table(
            ["Metric", "Value"],
            [
                ["Light files", str(len(light_files))],
                ["Deep files", str(len(deep_files))],
                ["REM files", str(len(rem_files))],
                ["REM exact duplicate hash groups", str(len(rem_dupes))],
                ["Deep exact duplicate hash groups", str(len(deep_dupes))],
                ["REM lasting truths", str(len(truths))],
                ["Repeated REM lasting truths", str(repeated_truth_count)],
                ["Deep promoted-0 streak", str(zero_streak)],
                ["Light candidates", str(len(candidates))],
                ["Recent REM novelty", novelty_text],
                ["Recent REM token overlap", f"{overlap}/{recent_token_count}" if recent_name else "n/a"],
                ["Phase signal entries", str(phase_total)],
                ["Phase signal Light-touched entries", str(phase_light)],
                ["Phase signal REM-touched entries", str(phase_rem)],
                ["Wisdom Index modified", wisdom_mtime],
                ["Wisdom Index changed within 7 days", "yes" if wisdom_recent else "no"],
            ],
        ),
        "",
        "## Exact Duplicate Hashes",
        "",
        "### REM",
        "",
    ]

    if rem_dupes:
        for digest, names in sorted(rem_dupes.items()):
            summary.append(f"- `{digest[:12]}`: {', '.join(names)}")
    else:
        summary.append("- None")

    summary.extend(["", "### Deep", ""])
    if deep_dupes:
        for digest, names in sorted(deep_dupes.items()):
            summary.append(f"- `{digest[:12]}`: {', '.join(names)}")
    else:
        summary.append("- None")

    summary.extend(["", "## Repeated REM Lasting Truths", ""])
    if repeated_truths:
        for truth, count in repeated_truths[:10]:
            summary.append(f"- {count}x: {truth[:220]}")
    else:
        summary.append("- None")

    summary.extend(["", "## Deep Promotion Counts", ""])
    summary.append(markdown_table(["Date", "Ranked", "Promoted"], [[date, str(ranked), str(promoted)] for date, ranked, promoted in deep_rows]))

    summary.extend(["", "## Light Candidate Type Estimate", ""])
    summary.append(markdown_table(["Type", "Count"], [[name, str(count)] for name, count in candidate_counts.most_common()]))

    summary.extend(["", "## Top Repeated Phrases", ""])
    if phrase_rows:
        for phrase, count in phrase_rows:
            summary.append(f"- {count}x: {phrase}")
    else:
        summary.append("- None")

    summary.extend(["", "## Theme Counts", ""])
    summary.append(markdown_table(["Theme", "Count"], [[name, str(count)] for name, count in themes.most_common()]))

    summary.extend(["", "## Likely Bottlenecks", ""])
    for item in bottlenecks:
        summary.append(f"- {item}")

    summary.extend(
        [
            "",
            "## Recommended Next Step",
            "",
            (
                "Add Deep rejection reasons and Light candidate hygiene labels before changing promotion or REM behavior. "
                "This preserves observability-first discipline while making future threshold tuning evidence-based."
            ),
            "",
            "## Scope Guard",
            "",
            "This audit reads existing dreaming outputs, MEMORY.md, wisdom-index.md, and phase signals. It does not modify dreaming logic, MEMORY.md, or wisdom-index.md.",
            "",
        ]
    )
    return "\n".join(summary)


def main() -> int:
    AUDITS.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().astimezone().strftime("%Y-%m-%d-%H%M")
    report_path = AUDITS / f"{stamp}.md"
    report_path.write_text(render_report(), encoding="utf-8")
    print(report_path.relative_to(ROOT))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
