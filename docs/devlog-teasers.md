# Dev log teasers

Since 20 Oct 2026, Patreon dev logs are for free and paid members only. The site
keeps a short public **teaser** of each one, with a soft link to the full post on
Patreon. The full members-only text never goes on the site or into this repo
(the repo is public, so anything committed here is public too).

Dev logs published before 20 Oct 2026 stay exactly as they are.

## The 5-minute checklist

Every other Thursday, 4pm UK, alongside the Patreon post.

1. **Scaffold the post** (from a fresh branch off `origin/main`):
   ```
   npm run devlog:new -- --num 4 --date 2026-11-05
   ```
   This writes `src/posts/2026-11-05-dev-log-4.md`, dated 16:00 UK time (BST or
   GMT is worked out for you). Add `--time 18:00` for another time. Leave out
   `--date` for next Thursday.
2. **Fill in every `[Fill in: …]`** in that file:
   - `title`: `Dev log #N: two or three things in plain words`. The page title
     becomes `Dev log #N: … | Foundry VTT modules` automatically.
   - `description`: one sentence, about 140–160 characters. It's the search
     snippet, the social card text and the feed summary. Name the modules and
     say "Foundry VTT" once.
   - Body: **2–4 sentences, released work only**, then `Happy adventuring.`
   - `moduleIds`: ids from `src/_data/modules.json` (e.g. `respite`,
     `quartermaster`) or a plain name like `"Ionrift Library"`. They show as
     chips under the title and feed the keywords.
   - `patreonUrl`: the Patreon post link. If Patreon shows the link before the
     post goes live (for a scheduled post), fill it in now. If not, fill it in
     just after 4pm and push: the teaser waits until then (see below).
3. **Check it** with `npm run devlog:preview` (shows future and unfinished
   posts on http://localhost:8080; never deploy this build). Read the teaser
   once more against the rules below.
4. **Open a PR and merge it on or after the post time (Thursday 4pm).** A post
   dated in the future stays out of the build. The site also rebuilds on its
   own at about 16:05 UK each Thursday, so a teaser already on main goes live
   then without another push.
5. **After 4pm**, check the post is on https://ionrift.cloud/blog/ and that the
   link opens the Patreon post.

If a teaser still has a `[Fill in` placeholder when its date comes, it stays
off the site (with a warning in the build log) until you fill it in and push.

## What a teaser can say

- Released, tagged work only. No unreleased modules, packs or tier news, and
  nothing from the "Next" section of the Patreon post.
- Plain and warm. Soft suggestions ("if you run Resonance alongside it"), not
  calls to action. Avoid "dive in", "unleash", "elevate", "excited to announce".
- Summarise in new words. Never paste paragraphs from the members-only post.
- Don't add the Patreon link in the body: the page adds "Read the full dev log
  with a free Patreon membership" under the teaser. To change that line for
  one post, set `patreonLinkText` in its front matter.

## How the safeguard works

`lib/devlog.js` and the `devlog-teasers` preprocessor in `.eleventy.js`:

- A post with `type: devlog` is **gated** when it's dated on or after
  20 Oct 2026, has `teaser: true`, or has a `tier` other than `Public`.
  A later post that really is fully public (say, a public release post) can
  opt out with `fullText: true`.
- A gated post **without `teaser: true` is left out of the whole build**: no
  page, no blog list or home card, no feed entry, no sitemap entry, no
  `manifest.json` entry. So a full copy dropped in by the Patreon sync never
  reaches ionrift.cloud.
- A gated post with `teaser: true` renders only its body (the teaser) and the
  soft Patreon link. Its `description` is the only text used for the meta
  description, `og:description`, Twitter card, JSON-LD and the feed summary.
- A teaser body over 1200 characters **fails the build**. That's about three
  times a normal teaser, so it almost certainly means pasted full text.
- Posts dated in the future are left out until their time, on every post
  type. `DEVLOG_PREVIEW=1` (or `npm run devlog:preview`) includes them.
- `/blog/manifest.json` now has `"teaser": true|false` per post.

The site has no search index or tag pages, so there's nothing else to cover.

## The Patreon-to-site sync

The copy step is the operations dashboard, not this repo. It commits
`src/posts/<date>-<slug>.md` files with `patreonId`, `patreonContentHash` and
`tier`, and reads `/blog/manifest.json` to see what's already on the site.
The safeguard stops a full copy from being **published**, but a committed full
copy would still be public in this repo. The dashboard therefore:

1. Skips any Patreon post that isn't public (anything other than "Everyone"),
   and any post whose title says `Dev Log` dated on or after 20 Oct 2026.
   It does not commit that text at all.
2. Does not overwrite a post whose manifest entry has `"teaser": true`, or
   whose file already has `teaser: true`.
3. Can still take a `patreonId` added by hand on a teaser, so that Patreon
   post counts as handled and is not offered for a full copy.

If a full copy ever lands in the repo, delete the file in a new commit and
ask whether the history needs rewriting.

## Undo

Revert the commit that added this file. Older posts render as before either
way; with the revert, gated posts would publish whatever body they contain,
so remove or rewrite any teaser posts first.

## Thursday rebuild

`.github/workflows/pages.yml` rebuilds `main` at 15:05 and 16:05 UTC every
Thursday. That is 16:05 UK in both BST and GMT. A teaser dated 16:00 that is
already on `main` goes out on that run. The Patreon link still has to be filled
in first: a `[Fill in` placeholder keeps the post out of the build.
