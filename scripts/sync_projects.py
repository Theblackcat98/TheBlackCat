#!/usr/bin/env python3
"""Keep content/projects/ in step with the owner's public GitHub repositories.

A project page is generated for every repository that is public, not a fork and
not archived. Pages that were hand-written stay hand-written: this script only
refreshes the `stars` and `language` metadata on them, never their body, title,
description or tags.

Generated pages are tracked in content/projects/.sync-manifest.json (a dotfile,
so Hugo never publishes it). A generated page whose repository stops qualifying
— made private, archived, or deleted — is removed. Hand-written pages are never
removed.

Usage:
    python3 scripts/sync_projects.py            # apply changes
    python3 scripts/sync_projects.py --dry-run  # report only

Environment:
    GITHUB_TOKEN   optional; raises the API rate limit
    PROJECTS_OWNER defaults to Theblackcat98
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "content" / "projects"
MANIFEST = PROJECTS / ".sync-manifest.json"

TODAY = date.today().isoformat()


def api(path: str) -> list[dict]:
    """GET every page of a GitHub list endpoint."""
    url = f"https://api.github.com{path}"
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "theblackcat-project-sync",
    }
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    items: list[dict] = []
    while url:
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                items.extend(json.load(resp))
                link = resp.headers.get("Link", "")
        except urllib.error.HTTPError as exc:  # pragma: no cover - network path
            sys.exit(f"GitHub API failed: HTTP {exc.code} on {url}")
        # Follow rel="next" when the response is paginated.
        match = re.search(r'<([^>]+)>;\s*rel="next"', link)
        url = match.group(1) if match else ""
    return items


def slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "project"


def eligible(repos: list[dict]) -> list[dict]:
    return [
        r
        for r in repos
        if not r.get("fork")
        and not r.get("archived")
        and not r.get("private")
        and not r.get("disabled")
    ]


def load_manifest() -> set[str]:
    if not MANIFEST.exists():
        return set()
    try:
        return set(json.loads(MANIFEST.read_text())["generated"])
    except (json.JSONDecodeError, KeyError):
        return set()


def save_manifest(generated: set[str]) -> None:
    MANIFEST.write_text(json.dumps({"generated": sorted(generated)}, indent=2) + "\n")


def yaml_str(value: str) -> str:
    """Quote a scalar the way the rest of the library does."""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def render(repo: dict, created: str, updated: str) -> str:
    """Front matter plus a short body, matching the existing project pages."""
    name = repo["name"]
    lines = ["---", f"title: {yaml_str(name)}", "contenttype: project"]
    if repo.get("language"):
        lines.append(f"language: {yaml_str(repo['language'])}")
    lines.append(f"stars: {repo.get('stargazers_count', 0)}")
    lines.append(f"github: {yaml_str(repo['html_url'])}")

    topics = [t.lower() for t in (repo.get("topics") or [])][:5]
    if topics:
        lines.append("tags:")
        lines.extend(f"  - {t}" for t in topics)
    elif repo.get("language"):
        lines.append("tags:")
        lines.append(f"  - {slugify(repo['language'])}")

    if repo.get("description"):
        lines.append(f"description: {yaml_str(repo['description'].strip())}")
    lines.extend([f"created: {created}", f"updated: {updated}", "---", ""])

    body = [repo["description"].strip() if repo.get("description") else name, ""]
    body.append(f"[View on GitHub]({repo['html_url']})")
    return "\n".join(lines + body) + "\n"


def existing_dates(path: Path) -> tuple[str, str]:
    """Reuse the dates already on the page so runs stay diff-free."""
    text = path.read_text()
    created = re.search(r"^created:\s*(\d{4}-\d{2}-\d{2})", text, re.M)
    updated = re.search(r"^updated:\s*(\d{4}-\d{2}-\d{2})", text, re.M)
    return (
        created.group(1) if created else TODAY,
        updated.group(1) if updated else TODAY,
    )


def refresh_metadata(path: Path, repo: dict, dry_run: bool = False) -> bool:
    """Update only the star count on a hand-written page.

    `language` is left alone on purpose: humans write richer values there
    ("Hugo / HTML / CSS / Markdown"), and GitHub's primary-language guess would
    flatten them. Title, body, description, tags and dates are never touched.
    """
    text = path.read_text()
    original = text
    if re.search(r"^stars:", text, re.M):
        text = re.sub(
            r"^stars:.*$", f"stars: {repo.get('stargazers_count', 0)}", text, count=1, flags=re.M
        )
    else:
        text = text.replace("contenttype: project\n",
                            f"contenttype: project\nstars: {repo.get('stargazers_count', 0)}\n", 1)
    if text == original:
        return False
    if not dry_run:
        path.write_text(text)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="report without writing")
    args = parser.parse_args()

    owner = os.environ.get("PROJECTS_OWNER", "Theblackcat98")
    repos = eligible(api(f"/users/{owner}/repos?per_page=100&type=owner"))
    if not repos:
        sys.exit("No eligible repositories returned — refusing to touch the tree.")

    manifest = load_manifest()
    by_slug = {slugify(r["name"]): r for r in repos}
    changes: list[str] = []

    for slug, repo in sorted(by_slug.items()):
        page = PROJECTS / slug / "index.md"
        generated = slug in manifest

        if page.exists() and not generated:
            if refresh_metadata(page, repo, args.dry_run):
                changes.append(f"metadata  {slug} (stars {repo.get('stargazers_count', 0)})")
            continue

        if page.exists():
            created, updated = existing_dates(page)
            committed = render(repo, created, updated)
            if committed == page.read_text():
                continue              # nothing changed, keep the old `updated`
            if not args.dry_run:
                page.write_text(render(repo, created, TODAY))
            changes.append(f"update    {slug}")
        else:
            created = (repo.get("created_at") or TODAY)[:10]
            if not args.dry_run:
                page.parent.mkdir(parents=True, exist_ok=True)
                page.write_text(render(repo, created, TODAY))
            changes.append(f"create    {slug}")
        if not page.exists() or slug not in manifest:
            manifest.add(slug)

    # Repositories that stopped qualifying lose their generated page.
    for slug in sorted(manifest - set(by_slug)):
        page = PROJECTS / slug / "index.md"
        if page.exists():
            if not args.dry_run:
                shutil.rmtree(page.parent)
            changes.append(f"remove    {slug}")
        manifest.discard(slug)

    if not args.dry_run:
        save_manifest(manifest)

    if not changes:
        print(f"projects: {len(by_slug)} eligible repositories, nothing to do")
    else:
        print(f"projects: {len(by_slug)} eligible repositories, {len(changes)} change(s)")
        for line in changes:
            print(f"  {line}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
