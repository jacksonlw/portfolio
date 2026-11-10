---
gallery:
  - id: announce
    src: /stories/waltz/announce.mp4
    poster: /stories/waltz/announce.jpg
    caption: Posting a request, and Waltz replying with the Task it planned. The agent runs here are scripted test data.
    frame: browser
  - id: agents-live
    src: /stories/waltz/agents-live.mp4
    poster: /stories/waltz/agents-live.jpg
    caption: The Agents tab, with one run open to show its output as it works (a scripted run).
    frame: browser
  - id: needs-you
    src: /stories/waltz/needs-you.mp4
    poster: /stories/waltz/needs-you.jpg
    caption: Answering the two questions waiting under "Needs you".
    frame: browser
  - id: thread
    src: /stories/waltz/thread.webp
    caption: A request and Waltz's replies, ending with the change landing on main.
    frame: browser
  - id: task
    src: /stories/waltz/task.webp
    caption: A Task with its summary, its "Done when" checklist and its Subtasks.
    frame: browser
  - id: agents-chart
    src: /stories/waltz/agents-chart.webp
    caption: Running, queued and finished runs, with the built-in Automations below.
    frame: browser
  - id: tasks-dark
    src: /stories/waltz/tasks-dark.webp
    caption: The Tasks tree in dark mode.
    frame: browser
  - id: setup
    src: /stories/waltz/setup.webp
    caption: Choosing how much the agents may do without asking.
    frame: browser
  - id: logo
    src: /stories/waltz/logo.webp
    caption: The Waltz logo, with its heron mark.
    frame: plain
---

## Why I'm building it

Coding agents can do a lot of the work of building software now. Running several of them at once is the hard part, because you end up reading pages of their output and keeping track of who is doing what.

Waltz is a desktop app that runs a team of agents for you. The agents do the work and decide how it gets done, and the human sets the why. It isn't an editor. You rarely write code in it, you direct and review.

## What I built

You ask for something by typing it into Announcements. Waltz replies in the same thread with the Task it planned, then tells you when it's built, and then that it passed review and landed on main.

![](#announce)

Each run works in its own copy of the repo. A second agent reviews the change, and nothing lands unless the project's own check passes. The Agents tab shows what is running and what is waiting, and you can open any run and watch it work.

![](#agents-live)

Waltz only stops to ask about direction, taste, or something that can't be undone. Those questions sit at the top under "Needs you", each with a few choices and a recommended one, and you answer with a click. You also pick how much it may do without asking, and by default the agents land their own work.

![](#needs-you)

The app is Rust inside Tauri with a React front end. Agents run either through the Claude Code CLI or through Waltz's own client for the Anthropic API.

## How it's going

I wrote the spec in October 2026 and soon had one full loop working, from a request to an approved merge. Within days Waltz was landing changes to its own code. It has landed about 60 of them so far, and two were reverted.

The biggest change came in early November. By then the app had Goals, Issues, Requirements and more, and my own spec said it "reads like a wall of AI text". I collapsed all of it into Tasks that Waltz keeps up to date and the human only reads. Every agent now posts under one name, Waltz, and the merge buttons for work I'd already asked for went away.

After a Task lands, the agents look back at how it went and write what they learned into their own instructions.

It runs on macOS and is built for one person so far.

## What it taught me

Getting agents to write code was the easier half. Most of my rewrites have been about what the person in charge has to read, and how little of it there can be before they stop knowing why things happened.
