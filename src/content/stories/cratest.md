---
gallery:
  - id: swipe
    src: /stories/cratest/swipe.mp4
    poster: /stories/cratest/swipe.jpg
    caption: Skipping one, saving one for later, then rating an album and sending it to the Crate.
    frame: phone
  - id: rating
    src: /stories/cratest/rating.webp
    caption: Rating a card with the half-star bar before sending it up.
    frame: phone
  - id: crate
    src: /stories/cratest/crate.webp
    caption: A Crate, with its five-star picks on the first shelf.
    frame: phone
  - id: games
    src: /stories/cratest/games.webp
    caption: The four daily games.
    frame: phone
  - id: crate-digger
    src: /stories/cratest/crate-digger.mp4
    poster: /stories/cratest/crate-digger.jpg
    caption: Crate Digger, where each guess shows how close you are to the day's mystery artist.
    frame: phone
  - id: onboarding
    src: /stories/cratest/onboarding-genres.webp
    caption: Picking genres on the first launch, so the first deck fits your taste.
    frame: phone
  - id: logo-rounds
    src: /stories/cratest/logo-rounds.webp
    caption: The first round of logo ideas. The record pulled out of a crate won.
    frame: plain
  - id: brand
    src: /stories/cratest/og-image.png
    caption: The finished mark and wordmark.
    frame: plain
---

## Why I'm building it

I wanted a Letterboxd for music. People who love film have a place to log what they've watched, rate it and see what their friends thought of it. I couldn't find anything for music that felt right, so in September 2026 I started building The Cratest.

Before getting far, I looked at what people say about the music sites that already exist, such as Rate Your Music, Musicboard and Airbuds. The complaint that came up most was that these sites already know what you like, and their recommendations still don't use it.

## What I built

The Cratest is an iPhone app. When you open it you get a deck of songs and albums. Swipe left to skip one, or swipe right if you haven't heard it yet. If you know it, you rate it with the half-star bar under the card, swipe up, and the card arcs down into your Crate.

![](#swipe)

Your Crate is your profile. Everything you've rated lands there, sorted onto shelves for your five-star picks, decades and genres, and you choose how other people see it. You can follow friends and dig through their crates, link Spotify or Apple Music so the app starts out knowing your taste, and share any review as a black card with the logo and your stars on it.

![](#crate)

There are four daily games, the same for everyone each day. In Crate Digger you have eight guesses to name a mystery artist. Cover Story shows an album cover so pixelated you can't read it, and it gets sharper with every wrong guess. Mixtape has you sort 16 tiles into four groups, and in Timeline you slot releases into the right order. Every game ends the same way, with a prompt to rate what you just played and send it to your Crate.

![](#crate-digger)

The app is SwiftUI, talking to a Go API and a PostgreSQL database, and I run the catalog and the games' daily calendar from a small Next.js admin console.

## How it's going

The first day went to the brand, the database, the API and the admin console. Two days later I sketched the app on a whiteboard, and that sketch became the plan for the iPhone app.

The logo took three rounds. The first had twelve ideas, from a tonearm drawing a check mark to a star on a record label. The one that won was a record being pulled out of a crate, so the second round was 22 versions of that, and the third was mostly about how big the hole in the record should be.

![](#logo-rounds)

Some of the plan didn't survive using the app. At first every rating went through a separate review screen. By the end of September I'd moved it onto the card itself, because the card should be for swiping and the stars for rating what's on screen. That's also when the "haven't heard it" swipe came in.

The other big change came on October 5. The app had a Trending tab, and I replaced it with the daily games. I wanted to give people a reason to come back every day, and a chart of what's popular wasn't doing that.

A few friends are testing it now. It isn't on the App Store yet.

## What it changed about how I work

The Cratest is where I learned to build from specs with a team of coding agents. On September 28 I wrote nine short briefs, covering share cards, invites, streaks, shelves for the Crate and more, each written so I could hand it to a coding agent as is. They were all built and merged that same day.

Most of my time now goes into deciding what to build and writing it down clearly, then checking what comes back. I move a lot faster than I used to.
