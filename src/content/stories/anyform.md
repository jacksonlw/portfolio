---
gallery:
  - id: replay
    src: /stories/anyform/replay.mp4
    poster: /stories/anyform/replay.jpg
    caption: A recorded visit to the demo shop playing back. At 0:42 the visitor clicks "Review order" over and over.
    frame: browser
  - id: finding
    src: /stories/anyform/finding.mp4
    poster: /stories/anyform/finding.jpg
    caption: Opening a finding from the ranked list and playing the moment it happened.
    frame: browser
  - id: finding-page
    src: /stories/anyform/finding-page.webp
    caption: One finding, with the moments it was seen and how its score was worked out.
    frame: browser
  - id: overview
    src: /stories/anyform/overview.webp
    caption: The overview for the demo shop after 21 recorded visits.
    frame: browser
  - id: scouts
    src: /stories/anyform/scouts.mp4
    poster: /stories/anyform/scouts.jpg
    caption: The Scouts page, and the catalog of ready-made Scouts.
    frame: browser
  - id: scouts-roster
    src: /stories/anyform/scouts-roster.webp
    caption: Six Scouts, each with a generated name, a brief and its traits.
    frame: browser
  - id: screens
    src: /stories/anyform/screens.webp
    caption: Every screen the recorder saw, with the open findings on each.
    frame: browser
  - id: logo
    src: /stories/anyform/logo.webp
    caption: The AnyForm mark and wordmark.
    frame: plain
---

## Why I'm building it

I wanted to know where people got stuck in my own apps. Session replay tools record what people do, but most of them then leave you watching the recordings, or hand you a summary you have no way to check. I wanted the recordings read for me, with every claim pointing back at the moment it came from. AnyForm's line for it is "See what your users saw, and fix what got in their way."

## What I built

AnyForm records each visit as the page itself and not as video, which comes out about 50 times smaller. A person can watch the visit play back as a real page. A model gets the same visit as a short written trace, made by code, that it can read in one go.

![](#replay)

Before anything leaves the browser, whatever the visitor typed is swapped for a made-up value of the same shape. An email still looks like an email and a card number still looks like a card number, so the replay never has black boxes where the form was.

Code goes through every visit looking for signs of trouble, such as a failed request or three or more clicks on the same element within a second. The same problem seen across visits becomes one finding with a score from 0 to 100, and each finding lists the moments it happened so you can play them. One from my demo data reads "People click the same element on Checkout · Payment 4 times in 640 ms." A model can then write up why it matters and what to change, and anything it says that doesn't trace back to a real moment is thrown out.

![](#finding)

Scouts are the other half. A Scout is an AI user you describe, such as a first-time shopper or someone who only uses the keyboard. You send up to ten of them through your app with a goal, and each run is recorded like any other visit, so problems can turn up before real users find them.

![](#scouts-roster)

To test all of this I built Fernway, a made-up outdoor clothing shop with 39 problems planted in it on purpose.

## How it's going

I started in October 2026 with only a plan. It covered the design, privacy, the trace and the Scouts, written out before any code.

Some of the plan changed early. The privacy mode started out swapping all text it didn't recognize, and that hid labels like "Confirm size" from the models, so I narrowed it to personal data. I also merged two lists that turned out to be the same thing seen twice, and now there's one list of findings.

The Scouts are the least finished part. They don't yet catch enough of Fernway's planted problems to pass my own benchmark. I'm still building it.

## What it changed about how I work

I didn't write most of this code by hand. The plan was a list of small pieces, each saying what it needed and how to tell it was done, and coding agents built them side by side while I made the decisions the plan had left open. Everything in these pictures was built in a few days.
