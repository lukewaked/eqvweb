#!/usr/bin/env python3
"""
EQV site builder.

The nav and the social-card tags live in one place each, and this script
writes them into every page. That way the nav is real HTML in the file --
it works if JavaScript fails and search engines can follow it -- while
still only being edited once.

Usage:  python3 build.py

Edit _partials/nav.html to change the nav, or PAGES below to change a
page's title / description / social card.
"""

from pathlib import Path
import re

ROOT = Path(__file__).parent
SITE = "https://eqvgroup.com.au"
OG_IMAGE = f"{SITE}/images/social-card.png"

# title, meta description
PAGES = {
    "index.html": (
        "EQV Group | AI built for how people actually learn",
        "EQV Group builds research-backed AI tools for Australian schools. "
        "The future of education is more human.",
    ),
    "relay-suite.html": (
        "The RELAY Suite | EQV Group",
        "Three products, one idea: technology that strengthens the human "
        "relationships in a school rather than replacing them.",
    ),
    "relay.html": (
        "RELAY | Understanding, before the assessment",
        "RELAY makes student confusion visible to the teacher who can act on it, "
        "well before a summative assessment. No grade, no judgement.",
    ),
    "fieldnote.html": (
        "Fieldnote | For K-12 teachers",
        "Lesson planning, pastoral care, and preparing for the conversations "
        "that matter. Built for teachers, K-12.",
    ),
    "relayjr.html": (
        "RELAY Jr | Early learning",
        "Extending the learning story from the centre to the home, and back "
        "again. Early learning, in development.",
    ),
    "adult-education.html": (
        "Adult Education | EQV Group",
        "Professional development, workshops, and comprehension tools for "
        "adult learning contexts.",
    ),
    "ai.html": (
        "EQV on AI | EQV Group",
        "AI can make a student seem to understand. We build for the tools "
        "that make them actually understand. Our position on AI in schools.",
    ),
    "about.html": (
        "About | EQV Group",
        "Esse Quam Videri. To be, rather than to seem to be. The people and "
        "the principle behind EQV Group.",
    ),
    "privacy.html": (
        "Privacy Policy | EQV Group",
        "How EQV Group handles personal information, under the Privacy Act 1988 "
        "and the Australian Privacy Principles.",
    ),
    "terms.html": (
        "Terms of Use | EQV Group",
        "Terms governing use of the EQV Group website.",
    ),
    "contact.html": (
        "Contact | EQV Group",
        "Talk to us about a pilot, a partnership, or the research behind "
        "what we build.",
    ),
}

NAV = (ROOT / "_partials" / "nav.html").read_text().strip()

NAV_START = "<!-- nav:start -->"
NAV_END = "<!-- nav:end -->"
META_START = "<!-- meta:start -->"
META_END = "<!-- meta:end -->"
ANALYTICS_START = "<!-- analytics:start -->"
ANALYTICS_END = "<!-- analytics:end -->"

# Vercel Web Analytics, plain-HTML flavour. No npm package is needed: the
# script is served first-party from the site's own domain, which is also why
# the Content Security Policy in vercel.json needs no exception for it.
# Set to "" to switch analytics off everywhere.
ANALYTICS = """  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>"""


def meta_block(page: str) -> str:
    title, desc = PAGES[page]
    url = f"{SITE}/" if page == "index.html" else f"{SITE}/{page}"
    return f"""{META_START}
  <title>{title}</title>
  <meta name="description" content="{desc}" />
  <link rel="canonical" href="{url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="EQV Group" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{desc}" />
  <meta property="og:url" content="{url}" />
  <meta property="og:image" content="{OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{desc}" />
  <meta name="twitter:image" content="{OG_IMAGE}" />
  {META_END}"""


def replace_block(html: str, start: str, end: str, new: str) -> str:
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pattern.search(html):
        return html
    return pattern.sub(lambda _: new, html)


def main() -> None:
    nav_block = f"{NAV_START}\n{NAV}\n  {NAV_END}"
    touched = []
    for page in PAGES:
        path = ROOT / page
        if not path.exists():
            print(f"  skip (missing): {page}")
            continue
        html = path.read_text()
        original = html
        html = replace_block(html, NAV_START, NAV_END, nav_block)
        html = replace_block(html, META_START, META_END, meta_block(page))
        analytics = f"{ANALYTICS_START}\n{ANALYTICS}\n  {ANALYTICS_END}" if ANALYTICS else f"{ANALYTICS_START}\n  {ANALYTICS_END}"
        html = replace_block(html, ANALYTICS_START, ANALYTICS_END, analytics)
        if html != original:
            path.write_text(html)
            touched.append(page)
    print(f"built {len(touched)} page(s): {', '.join(touched) or 'none'}")


if __name__ == "__main__":
    main()
