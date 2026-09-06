# Blog Workflow (draft-flag)

Publishing model chosen by Nik (2026-09-04): write + push immediately with
`draft: true` (invisible on the live site), Nik says **"publish X"** to flip
it live. Exception: if Nik explicitly approves a draft in chat ("looks good,
push it live"), publish directly in the same pass.

## Voice: Simon Willison (Nik's pick)

Study https://simonwillison.net/ style before writing:

- **First person, terse, confident.** Short sentences. No filler, no preamble.
- **Link-forward.** Quote or summarize the source, then link out. Attribute
  with "via ..." where a third party pointed you there.
- **Plain technical language.** Opinions stated directly, with the reason.
- Two natural formats: **TIL-style short posts** (one thing learned, small
  code block or command, done) and **writeups** (build narrative: problem,
  what I tried, what worked, code included).
- Never: marketing-speak, "delve"/"leverage"/AI-isms, emoji, bullet-point
  bloat, throat-clearing intros ("In today's fast-paced world...").
- Code blocks must be real and tested — run the command/code before including
  it. Claims about external facts get verified via web tools first.

## Write a post ("write a blog post about X")

1. `git pull --ff-only` the clone.
2. Gather material: URLs via web_extract, repo/file facts via terminal,
   verify claims. Nothing invented; label uncertainty in the text if any.
3. Create page bundle `content/blog/<slug>/index.md` (slug = lowercase
   kebab-case, ASCII):

   ```markdown
   ---
   title: "<Post Title>"
   description: "<one-line summary used in cards/search>"
   date: <YYYY-MM-DDTHH:MM:SS-07:00>
   draft: true
   authors:
     - name: theblackcat98
       link: https://github.com/theblackcat98
       image: https://github.com/theblackcat98.png
   tags:
     - <lowercase-kebab>
   ---

   <body…optional <!--more--> marks the summary cutoff>
   ```

   - `date`: real time via `date +%Y-%m-%dT%H:%M:%S-07:00` (PDT).
   - `draft: true` ALWAYS on first push.
   - Tags lowercase kebab (legacy posts use Title Case — don't imitate).
   - Images/assets go in the same bundle folder.
4. Commit only that file: `git commit -m "post: <title> (draft)"`, push.
5. Verify: CI `success`, then confirm the draft is NOT live —
   `curl -s -o /dev/null -w '%{http_code}' https://theblackcat98.github.io/TheBlackCat/blog/<slug>/`
   must be **404**. Report to Nik: title, slug, GitHub blob URL,
   "say 'publish <slug>' when ready".

## Publish ("publish X" / approved-in-chat)

1. `git pull --ff-only`; flip `draft: false` in that post only.
2. Commit `post: publish <slug>`, push.
3. Verify: CI `success`; live URL **200**; spot-check rendered content
   (`curl` the page, confirm title + a body string present).
4. Report the live URL.

## Rules

- Never publish silently: a post going `draft: false` is always the result of
  an explicit "publish" instruction or in-chat approval.
- Editing an already-published post: fine, but report the diff summary to Nik.
- The blog section is live but was historically unlinked; it is in the main
  nav menu since 2026-09-04 (hugo.yaml `menu.main`, Blog, weight 45).
- `content/blog/` also holds legacy posts (Markdown Syntax Guide, IG Post
  Maker, Website Analyzer, a manuscript page bundle with draft chapters) —
  never modify or delete those without instruction.
