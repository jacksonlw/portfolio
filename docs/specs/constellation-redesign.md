# Constellation redesign

Label: `ready-for-agent`

## Problem Statement

Jackson's portfolio still reads like an ordinary website: a profile card with a bio beside it, a section heading, a "hover anything" hint, the constellation below, then a footer. The constellation, which is the most distinctive part of the page, sits inside a conventional layout instead of being the page.

The drawings inside bubbles and area hubs feel AI-made. They are overly clean, they repeat the same devices (a sparkle in nearly every one, an offset shadow, a pastel blob, a status badge), and several don't clearly show what they stand for. Oracle, for example, is a briefcase with a sparkle. Company logos can't be used to fix this.

The star list is too long and too granular: 43 skills across 6 areas. It includes near-duplicates (LangChain and LangGraph, JavaScript and TypeScript, Embeddings and Vector DBs), filler (Git, Jira, Agile), and "How I work" items that the bubbles already show (Teaching, Startups).

Oracle also gets more weight than Jackson wants. It is the largest bubble at the center, and it leads the About, the metadata description and the resume summary. Jackson wants to be framed by what he builds and cares about, not by his employer. Waltz, his newest project, is missing.

## Solution

The whole page becomes the constellation. Jackson's **Me node** sits at its center: his photo, his name and a one-line bio that is always visible. Hovering it opens his full About. **Satellites** orbit the Me node: resume, email, GitHub, and a press piece. Each is joined to it by a faint line and carries a small hand-drawn **illustration**.

**Bubbles** (work and projects) scatter around the Me node, with Jackson's own projects nearest. Each bubble shows a **mark**: the project's real logo when it has one, otherwise its name set in the site's font. Skills are reduced to about 23 **stars** in 4 **areas**. Within each area the stars are joined into a small constellation figure.

Lines are kept to a minimum:

- Me node to satellites, always shown.
- Star to star within an area, always shown.
- Star to bubble, on hover only.

Nothing joins a bubble to the Me node. The drawing kit is rebuilt in a hand-drawn style with no sparkles, and Oracle-led copy is rewritten around what Jackson does. On mobile the same constellation is laid out vertically.

## User Stories

### First impression

1. As a visitor, I want the first screen to be the constellation itself, so that the site feels distinctive rather than like a template.
2. As a visitor on desktop, I want the constellation to fill the viewport without scrolling, so that I take in everything at once.
3. As a visitor, I want Jackson's photo at the exact center as the largest body, so that I know immediately whose constellation this is.
4. As a visitor, I want his name and a one-line bio always visible under the photo, so that I learn who he is without interacting.
5. As a visitor, I want no footer, section heading or instructional hint, so that nothing breaks the sky.
6. As a visitor, I want a small, quiet hint in one corner, so that I can still find out the constellation is interactive.

### Me node

7. As a visitor, I want to hover or keyboard-focus the Me node and see Jackson's full About in the dark popover, so that I can read more without leaving the page.
8. As a visitor, I want the popover to end with resume, email and GitHub links, so that I can act right after reading.
9. As a visitor, I want the popover to stay open while I move my pointer from the Me node into it, so that I can click those links.
10. As a visitor, I want the popover to close when my pointer leaves both the node and the popover, so that it doesn't get in the way.
11. As a visitor, I want clicking the Me node to do nothing, so that I'm never sent somewhere unexpectedly.
12. As a touch-screen visitor, I want tapping the Me node to open the About, since I can't hover.
13. As a keyboard user, I want to tab to the Me node and its popover links, so that the About and its links are reachable without a mouse.

### Satellites

14. As a visitor, I want resume, email, GitHub and press satellites orbiting the Me node, so that the ways to reach or learn about Jackson are clearly his.
15. As a visitor, I want each satellite joined to the Me node by a faint line, so that the grouping reads at a glance.
16. As a visitor, I want satellites to drift with the Me node, so that they feel like part of one body.
17. As a visitor, I want hovering the resume satellite to say "Resume · PDF", and clicking it to open the PDF.
18. As a visitor, I want hovering the email satellite to show Jackson's address, and clicking it to start an email.
19. As a visitor, I want hovering the GitHub satellite to show his handle, and clicking it to open his profile.
20. As a visitor, I want hovering the press satellite to show the article title, publisher and date, and clicking it to open the article.
21. As a visitor, I want the press satellite to also be tied to the Oracle and KoiStream bubbles, so that I can see what the article covers.
22. As a visitor, I want each satellite's illustration to plainly show what it is (a resume sheet, an envelope, a merging branch, a newspaper), so that I know what it does before hovering.

### Bubbles

23. As a visitor, I want Jackson's own projects (AnyForm, The Cratest, Waltz) placed nearest the Me node, so that what he builds comes first.
24. As a visitor, I want Oracle shown as one large bubble among the others with no special placement, so that the page isn't framed by his employer.
25. As a visitor, I want bubble size to reflect current activity and scale (large: AnyForm, The Cratest, Waltz, Oracle, Trailblaze; medium: CareerFoundry, KoiStream; small: TEDx, Branch), so that I can sense what matters most.
26. As a visitor, I want AnyForm, The Cratest and Waltz to show their real logos on a paper-colored disc, so that they look like real products.
27. As a visitor, I want bubbles without their own logo to show their name set in the site's font, so that nothing looks like borrowed branding or generic AI art.
28. As Jackson, I want no company logos (Oracle, CareerFoundry, TEDx) anywhere on the site, so that I don't misuse trademarks.
29. As a visitor, I want no line joining any bubble to the Me node, since every bubble is obviously his.
30. As a visitor, I want hovering a bubble to draw lines to the stars it used and show its popover, so that I can see the skills behind each piece of work.
31. As a visitor, I want a Waltz bubble ("A software factory for agent teams", a solo project in development since October 2026), so that his newest work is represented.
32. As a visitor, I want AnyForm's popover to say that it plays each visit back as a trace a model can read, and that Scouts (AI users you describe) rehearse an app before real users do, so that I understand what is distinctive about it.

### Stars and areas

33. As a visitor, I want about 23 meaningful stars instead of 43, so that the sky is readable.
34. As a visitor, I want four areas (AI & agents, Product & frontend, Backend & data, Cloud), two on each side, so that the clusters are balanced.
35. As a visitor, I want each area labeled with plain text and no icon, so that the labels read cleanly.
36. As a visitor, I want the stars within an area joined by short, faint lines into a figure, so that each area reads as a constellation.
37. As a visitor, I want hovering a star to draw lines to the bubbles where the skill was used and explain it in the popover, so that I can see real evidence for each skill.
38. As a visitor, I want merged stars (for example "RAG" now including embeddings and vector DBs) to keep every bubble link the original skills had, so that no evidence is lost.
39. As a visitor, I want a Rust star linked to Waltz, so that the stack behind Waltz is shown.
40. As Jackson, I want filler skills (Git, Jira, Agile, Tailwind, Root cause analysis) and skills the bubbles already show (Teaching, Startups) removed, so that every star means something.

### Motion

41. As a visitor, I want the drift, pointer parallax and lean-toward-active motion kept, so that the sky feels alive.
42. As a visitor who prefers reduced motion, I want everything to hold still, so that the page is comfortable.

### Mobile

43. As a mobile visitor, I want the same night-sky style laid out vertically, so that the site feels the same on my phone.
44. As a mobile visitor, I want the Me node and bio at the top with satellites in a small row beneath, so that I meet Jackson first.
45. As a mobile visitor, I want bubbles in a loose, scattered column rather than cards, so that it still reads as a constellation.
46. As a mobile visitor, I want tapping a bubble to light up its stars, so that I can explore connections without hover.
47. As a mobile visitor, I want each area shown as a small star figure with its stars labeled, and tapping a star to open the panel that says where it was used.
48. As a mobile visitor, I want gentle drift only and no parallax, so that the page stays calm and fast.

### Illustrations

49. As Jackson, I want the illustration kit rebuilt with one slightly uneven ink line and one flat accent fill per drawing, so that the drawings feel hand-made rather than generated.
50. As Jackson, I want no sparkles, offset shadows, background blobs, status dots or internal animation in any drawing, so that nothing repeats from one drawing to the next.
51. As Jackson, I want the illustration gallery page kept and showing the satellite drawings, so that I can review them in one place.
52. As Jackson, I want the old bubble and area badges removed, so that nothing on the page uses the retired style.

### Copy and machine-readable views

53. As a visitor, I want the bio to read "I build products people actually want to use, starting with the people I'm building for.", so that Jackson is framed by how he works.
54. As a visitor, I want the About's present-day line to read "Today I build AI agents, and on my own time I'm building AnyForm, The Cratest and Waltz.", so that his current work is clear without employer framing.
55. As Jackson, I want the press paragraph removed from the About, since the press satellite now covers it.
56. As Jackson, I want the one-line intro and the search/share description to drop the Oracle framing and name AnyForm, The Cratest and Waltz.
57. As a recruiter reading the resume, I want the summary to read "Software engineer who builds AI agents and full-stack web and mobile products, starting from the people who'll use them. Skilled in multi-agent orchestration, RAG and design thinking.", so that it leads with what he does.
58. As Jackson, I want the resume PDF regenerated after that change and the rest of the resume left untouched.
59. As Jackson's chatbot or an AI agent, I want `llms.txt`, `llms-full.txt`, `profile.json` and the JSON-LD to still include Oracle, the press piece, Waltz and the merged skills, so that machine-readable answers stay complete and accurate.
60. As a search engine, I want the full About text present in the page markup even though it only shows in a popover, so that the content is still indexed.
61. As Jackson, I want every new or changed sentence to come only from his words, his resume or his project repos, so that the chatbot never repeats invented claims.

## Implementation Decisions

- **Vocabulary.** The project glossary is authoritative. Keep the existing code words: constellation, star, bubble, area. Add Me node, satellite, mark and illustration. Do not rename the constellation to "graph".
- **Page composition.** The home page renders only the constellation, plus the full About in markup for indexing. The profile card, section wrapper, heading, hint and footer are removed from the home page. The desktop view is one viewport tall with no page scroll.
- **Content model.**
  - The profile gains a one-line bio field.
  - Satellites are derived from existing profile data (resume path, email, the GitHub link) and the press list, which is already staged in uncommitted work. Each satellite has a kind (resume, email, github, press), a destination, hover text and an illustration key. The press satellite also carries the slugs of the bubbles it ties to (oracle, koistream).
  - Areas shrink to four: AI & agents, Product & frontend, Backend & data, Cloud.
  - Skills are rewritten to the agreed merged list:
    - **AI & agents:** multi-agent orchestration (with LangGraph and LangChain), RAG (with embeddings and vector DBs), prompt engineering, AI coding tools (Claude Code and Codex).
    - **Product & frontend:** TypeScript (with JavaScript), React / Next.js, React Native, SwiftUI, Oracle JET, UI/UX & Figma, design thinking.
    - **Backend & data:** Node.js / Express, Java / Helidon, Go, Python, Rust, PostgreSQL / SQL, Oracle 26ai Database, REST & GraphQL.
    - **Cloud:** AWS, OCI, Kubernetes / Terraform, FFmpeg, Playwright.
  - A merged skill's explanation combines the originals' wording without adding claims, and its project list is the union of theirs.
  - Rust is new and links only to Waltz.
- **Waltz project entry.**
  - Content: title "Waltz", tagline "A software factory for agent teams", summary based on Waltz's own description ("a desktop app where a team of agents does the work and a human steers the why"), status in development, dates from October 2026 with no end, no public link, no role field (solo project).
  - Stack: Rust, Tauri, React, TypeScript, Anthropic API, MCP.
  - Star links: multi-agent orchestration, prompt engineering, AI coding tools, TypeScript, React / Next.js, Playwright, Rust.
- **AnyForm entry.** Keep the tagline. Append one sentence from its README about model-readable traces and Scouts.
- **Bubble layout.** Keep hand-placed positions keyed by slug, re-placed around a centered Me node: own projects nearest, Oracle with no special spot. Size tiers as listed in the user stories. The sunflower fallback still places any bubble without a hand-placed position.
- **Marks.**
  - A bubble's visual is a mark, not an illustration.
  - A bubble with a logo shows that file on a paper-colored disc. The logo files are copied into the site's public assets from the project repos: AnyForm's blue icon, The Cratest's black icon, Waltz's lilac heron mark.
  - Any other bubble renders its title in the site's sans font inside its tinted disc, with no company logos.
  - The content model gets an optional mark-image field on projects and work.
- **Lines.** The constellation component draws exactly three kinds of line:
  - Me node to satellite, always.
  - Star to star within an area, always. A short chain or figure through neighbors, not every pair.
  - Star to bubble, while one of them is active.

  Press-to-bubble ties use the hover style. No bubble-to-Me-node line exists.

- **Popover behavior.**
  - The Me node uses the same dark popover as other nodes, showing the full About and a resume / email / GitHub row. It has a hover bridge, so the pointer can move into the popover, and it closes on leaving both.
  - Clicking the Me node does nothing. Focus opens the popover. On touch devices, a tap opens it.
  - Satellites are real links, with hover popovers showing their short text.
- **Motion.** Reuse the existing single animation-frame loop. The Me node and satellites join it: satellites orbit or drift around the Me node's offset. Reduced motion holds everything still. The mobile view drifts gently with no parallax.
- **Mobile.** Replace the card list with a vertical constellation:
  - Me node and bio, then a row of satellites.
  - A scattered column of bubbles. Tapping a bubble lights its stars.
  - The areas as small labeled star figures. Tapping a star opens the dark ink panel that lists where it was used.
- **Illustrations.**
  - Delete the 8 bubble badges and 6 area badges.
  - Rebuild the drawing kit: hand-drawn ink paths with slight irregularity drawn into the paths (not a filter), one stroke weight, one flat accent fill, no sparkle, shadow, blob, status badge or internal animation.
  - New drawings: resume sheet, envelope, merge branch (GitHub), newspaper (press). They must read at about 40–56px.
  - The registry maps illustration keys to the new drawings, and the gallery page shows them.
  - Unused project-page story illustrations are set to none.
- **Copy.** Update the bio, the About's present-day line, the intro and the search/share description as agreed, and remove the press paragraph from the About. In the resume source, change only the summary line, then regenerate the PDF with the existing resume script.
- **Machine-readable views.** `llms.txt`, `llms-full.txt`, `profile.json` and the JSON-LD keep listing Oracle, press, every project including Waltz, and the merged skills. Include the uncommitted press work already in progress.

## Testing Decisions

- No automated tests for this change; Jackson chose to skip them. The repo has no test runner today, and none is added.
- Verify by hand in the browser preview at desktop and mobile widths:
  - The Me node popover and its hover bridge, satellite links and hover text.
  - Which lines appear, and when.
  - Marks on bubbles, mobile tap behavior, reduced motion, and no page scroll on desktop.
- Run the existing type-check, lint and build scripts.
- Fetch `llms.txt` and `profile.json` and check that Oracle, press and Waltz appear.
- If tests are added later, the agreed seam is a single Playwright suite against the rendered page and the machine-readable endpoints. It would check external behavior only, nothing inside the constellation component.

## Out of Scope

- Adding a Projects section (Waltz, AnyForm, The Cratest) to the resume, or any resume change beyond the summary line.
- Re-enabling project pages.
- Any click behavior on the Me node beyond the touch tap.
- Using screenshots or mockups as bubble marks.
- Wiring up the chatbot.
- Renaming the constellation vocabulary.

## Further Notes

- All content must come from Jackson's own words, his resume or his project repos. Ask rather than invent.
- AnyForm's current site entry matches its active repo. The separate "Approvals" repo is an older product and is not the source for this entry.
- The resume summary's "thousands of Gen AI chats" claim stays in the Oracle bullet below the summary.
- Uncommitted press-related changes already in the working tree are part of this work's starting point.
