from __future__ import annotations

from typing import Any, Dict, List, Optional


def _find_target_mystery(
    q: str, mystery_slug: Optional[str], mysteries: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    if mystery_slug:
        for m in mysteries:
            if m["slug"] == mystery_slug:
                return m
    ql = q.lower()
    for m in mysteries:
        if m["title"].lower() in ql or m["slug"].replace("-", " ") in ql:
            return m
        for token in m["slug"].split("-"):
            if len(token) > 4 and token in ql:
                return m
    return None


def answer_research_query(
    question: str,
    mystery_slug: Optional[str],
    mysteries: List[Dict[str, Any]],
    sources: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Answer strictly from indexed dossiers and research sources with clickable citations."""
    q = question.strip()
    ql = q.lower()
    target = _find_target_mystery(ql, mystery_slug, mysteries)

    if not target:
        matched_sources = [
            s
            for s in sources
            if ql in s["title"].lower()
            or ql in s["summary"].lower()
            or ql in s["authorOrOrg"].lower()
        ][:4]
        if matched_sources:
            citations = [
                {
                    "sourceId": s["id"],
                    "title": s["title"],
                    "authorOrOrg": s["authorOrOrg"],
                    "publicationDate": s["publicationDate"],
                    "url": s["url"],
                    "recordTier": s["recordTier"],
                }
                for s in matched_sources
            ]
            lines = "\n".join(
                f"• **{s['title']}** ({s['authorOrOrg']}): {s['summary']}"
                for s in matched_sources
            )
            return {
                "answer": f"Matching indexed Research Library records:\n\n{lines}",
                "confidenceNote": "Grounded strictly in indexed Research Library documents.",
                "citations": citations,
                "suggestedQuestions": [
                    "What happened in Dyatlov Pass?",
                    "What is the strongest evidence for Dark Matter?",
                    "Where can I find original documents for MH370?",
                ],
            }

        return {
            "answer": (
                f"No specific dossier or indexed source matched your query. "
                f"Please ask about one of the {len(mysteries)} indexed investigations (e.g., Area 51, "
                "MKUltra, Franklin Expedition, Voynich Manuscript, John Titor, Illuminati, "
                "Dyatlov Pass, Atlantis, or Dark Matter)."
            ),
            "confidenceNote": "No speculative answer generated outside indexed records.",
            "missingEvidenceNotice": "Insufficient match in indexed archive to provide a source-grounded answer.",
            "citations": [],
            "suggestedQuestions": [
                "What happened in the Wow! Signal?",
                "What do scientists believe about Dyatlov Pass?",
                "Which theories about Atlantis have been disproven?",
            ],
        }

    src_ids = set(target.get("sourceIds", []))
    linked_sources = [
        s
        for s in sources
        if s["id"] in src_ids or target["slug"] in s.get("relatedMysterySlugs", [])
    ]
    citations = [
        {
            "sourceId": s["id"],
            "title": s["title"],
            "authorOrOrg": s["authorOrOrg"],
            "publicationDate": s["publicationDate"],
            "url": s["url"],
            "recordTier": s["recordTier"],
        }
        for s in linked_sources
    ]

    is_disproven = any(k in ql for k in ("disproven", "refuted", "false", "myth"))
    is_docs = any(k in ql for k in ("document", "original", "source", "paper", "where"))
    is_evidence = any(k in ql for k in ("strongest evidence", "evidence", "proof", "know"))
    is_scientists = any(k in ql for k in ("scientist", "believe", "consensus", "theory"))

    missing_notice: Optional[str] = None

    if is_disproven:
        refuted = [
            t
            for t in target.get("competingTheories", [])
            if t["scientificAcceptance"]
            in ("Largely Refuted / Unsupported", "Contested / Inconclusive")
        ]
        if not refuted:
            answer = (
                f"In **{target['title']}**, no competing hypothesis in the dossier is marked completely refuted; "
                f"evidence remains active or open. {target['finalAssessment']}"
            )
            missing_notice = "No formally refuted theories are indexed for this dossier."
        else:
            bullets = "\n".join(
                f"• **{t['name']}** ({t['scientificAcceptance']}): "
                f"{' '.join(t.get('contradictingEvidence', [])) or t['scientificLimitations']}"
                for t in refuted
            )
            answer = f"Claims lacking support or contradicted for **{target['title']}**:\n\n{bullets}"
    elif is_docs:
        if not linked_sources:
            answer = "No indexed original documents exist for this mystery yet."
            missing_notice = "Original records missing from current index."
        else:
            bullets = "\n".join(
                f"• **[{s['recordTier']}] {s['title']}** — {s['authorOrOrg']} ({s['publicationDate']}). {s['summary']}"
                for s in linked_sources
            )
            answer = f"Indexed primary records and studies for **{target['title']}**:\n\n{bullets}"
    elif is_evidence:
        facts = "\n".join(f"• {fact}" for fact in target.get("whatWeKnow", [])[:3])
        ev_str = " | ".join(
            f"{e['title']} ({e['date']}) — {e['measurementOrFinding']}"
            for e in target.get("originalEvidence", [])
        )
        answer = (
            f"Strongest verified findings for **{target['title']}** (Status: **{target['evidenceStatus']}**):\n\n"
            f"{facts}\n\n**Primary Evidence:** {ev_str}"
        )
    elif is_scientists:
        leading = target["competingTheories"][0]
        unknown0 = (target.get("whatRemainsUnknown") or ["See open questions."])[0]
        answer = (
            f"Scientific classification for **{target['title']}** is **{target['evidenceStatus']}**: "
            f"{target['evidenceRationale']}\n\n"
            f"Leading scientific view: **{leading['name']}** ({leading['scientificAcceptance']}) — {leading['claim']}\n\n"
            f"**Open question:** {unknown0}"
        )
    else:
        ov = target["overview"]
        answer = (
            f"**{target['title']}** ({ov['when']} — {ov['where']}):\n\n"
            f"{ov['what']}\n\n{ov['narrative']}\n\n"
            f"**Evidence Classification ({target['evidenceStatus']}):** {target['evidenceRationale']}"
        )

    if not missing_notice and target.get("whatRemainsUnknown"):
        missing_notice = f"Open evidence gaps: {target['whatRemainsUnknown'][0]}"

    return {
        "answer": answer,
        "confidenceNote": f"Synthesized strictly from {len(citations)} indexed archive record(s) for {target['title']}.",
        "missingEvidenceNotice": missing_notice,
        "citations": citations,
        "suggestedQuestions": [
            f"What happened in {target['title']}?",
            f"What is the strongest evidence for {target['title']}?",
            f"What do scientists believe about {target['title']}?",
            f"Which theories have been disproven for {target['title']}?",
            f"Where can I find original documents for {target['title']}?",
        ],
    }
