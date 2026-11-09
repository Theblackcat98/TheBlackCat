#!/usr/bin/env python3
"""Keep data/dashboard.json in step with the owner's GitHub fleet.

Scope (owner's rule, 2026-11-09): only NON-FORK, NON-ARCHIVED repositories.
Todos are GitHub Issues — the single source of truth (open PRs are counted
separately, never mixed into the todo list). Per repo the dashboard shows:
description/topics/README/license hygiene, a health score, open issues
(the todos) with titles and links, open PR count, and last push.

This site is public, so private repositories are NEVER written to the
JSON: they are counted in `private_skipped` and skipped, even if the token
could see them. A private full-fleet view belongs in a private repo.

Usage:
    python3 scripts/sync_dashboard.py            # apply changes
    python3 scripts/sync_dashboard.py --dry-run  # report only

Environment:
    GITHUB_TOKEN / DASHBOARD_TOKEN   optional; raises the API rate limit
    PROJECTS_OWNER defaults to Theblackcat98
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "dashboard.json"
OWNER = os.environ.get("PROJECTS_OWNER", "Theblackcat98")
TODAY = date.today()
STALE_BEFORE = (TODAY - timedelta(days=90)).isoformat()


def api(path: str, token: str):
    """GET a GitHub API path; list endpoints are fully paginated. 404 -> None."""
    url = f"https://api.github.com{path}"
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "theblackcat-dashboard-sync"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    items: list = []
    while url:
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = json.load(resp)
                link = resp.headers.get("Link", "")
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                return None
            sys.exit(f"GitHub API failed: HTTP {exc.code} on {url}")
        if isinstance(body, list):
            items.extend(body)
            match = re.search(r'<([^>]+)>;\s*rel="next"', link)
            url = match.group(1) if match else ""
        else:
            return body
    return items


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    token = os.environ.get("DASHBOARD_TOKEN") or os.environ.get("GITHUB_TOKEN", "")

    if token:
        repos = api("/user/repos?affiliation=owner&per_page=100", token) or []
    else:
        repos = api(f"/users/{OWNER}/repos?per_page=100", token) or []
    repos = [r for r in repos if r["owner"]["login"].lower() == OWNER.lower()]

    out: list[dict] = []
    skipped_private = 0
    for r in repos:
        if r.get("fork") or r.get("archived"):
            continue
        if r.get("private"):
            skipped_private += 1
            continue  # public site: never publish private repo detail
        full = r["full_name"]
        raw = api(f"/repos/{full}/issues?state=open&per_page=100", token) or []
        issues = [i for i in raw if "pull_request" not in i]
        prs = [i for i in raw if "pull_request" in i]
        readme = api(f"/repos/{full}/readme", token)
        readme_size = readme.get("size", 0) if isinstance(readme, dict) else 0
        lic = (r.get("license") or {}).get("spdx_id")
        checks = {
            "description": bool(r.get("description")),
            "topics>=3": len(r.get("topics") or []) >= 3,
            "readme": bool(readme),
            "readme>500B": readme_size > 500,
            "license": bool(lic),
            "pushed<90d": (r.get("pushed_at") or "")[:10] >= STALE_BEFORE,
        }
        out.append({
            "name": r["name"],
            "url": r["html_url"],
            "description": r.get("description"),
            "topics": r.get("topics") or [],
            "language": r.get("language"),
            "license": lic,
            "stars": r.get("stargazers_count", 0),
            "pushed_at": (r.get("pushed_at") or "")[:10],
            "health": round(100 * sum(checks.values()) / len(checks)),
            "missing": [k for k, v in checks.items() if not v],
            "issues": [{"number": i["number"], "title": i["title"], "url": i["html_url"],
                        "labels": [l["name"] for l in i.get("labels", [])]} for i in issues],
            "prs": [{"number": p["number"], "title": p["title"], "url": p["html_url"]} for p in prs],
        })

    out.sort(key=lambda r: (-(len(r["issues"]) + len(r["prs"])), r["health"]))
    payload = {
        "generated": TODAY.isoformat(),
        "scope": "public, non-fork, non-archived owner repositories; todos = open GitHub Issues",
        "private_skipped": skipped_private,
        "summary": {
            "repos": len(out),
            "open_issues": sum(len(r["issues"]) for r in out),
            "open_prs": sum(len(r["prs"]) for r in out),
            "avg_health": round(sum(r["health"] for r in out) / max(len(out), 1)),
            "missing_description": sum(1 for r in out if "description" in r["missing"]),
            "missing_license": sum(1 for r in out if "license" in r["missing"]),
            "missing_readme": sum(1 for r in out if "readme" in r["missing"]),
        },
        "repos": out,
    }
    print(json.dumps(payload["summary"], indent=1))
    if args.dry_run:
        print("dry run: not writing", OUT)
        return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
