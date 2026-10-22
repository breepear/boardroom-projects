# Boardroom Projects

One-page site for Boardroom Projects, a residential design practice in Phoenix, Arizona.

## Structure

- `site/` — the whole site. Static HTML, CSS, and vanilla JS. No build step.
  - `site/index.html`
  - `site/styles.css`
  - `site/main.js` — scroll choreography (reveals, parallax, the horizontal strip, and the house in the corner that builds itself)
  - `site/images/` — web-sized photography at three widths
  - `site/logo/` — lockup and mark, color and white
- `vercel.json` — tells Vercel to serve `site/` as-is.

Raw photography, briefs, and working files are kept out of the repo.

## Run locally

Any static server works. For example:

```bash
python3 -m http.server 4173 --directory site
```

Then open http://localhost:4173.

## Deploy

Import the repo in Vercel. No framework, no build command. The output directory is `site`, set in `vercel.json`.
