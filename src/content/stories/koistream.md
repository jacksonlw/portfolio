---
gallery:
  - id: broadcast-credits
    src: /stories/koistream/broadcast-credits.mp4
    poster: /stories/koistream/broadcast-credits.jpg
    caption: The end of the broadcast on August 27, 2020.
    frame: plain
  - id: watch
    src: /stories/koistream/watch.webp
    caption: The watch page with its chat, from the January 2021 code running locally with sample data.
    frame: browser
  - id: moderation
    src: /stories/koistream/moderation.webp
    caption: The same page for a moderator, who can delete a message or mute its sender (sample data).
    frame: browser
  - id: admin-stream
    src: /stories/koistream/admin-stream.webp
    caption: Stream Controls, where the crew set the title and switched the stream, chat and slow mode on and off (sample data).
    frame: browser
  - id: broadcast-preshow
    src: /stories/koistream/broadcast-preshow.mp4
    poster: /stories/koistream/broadcast-preshow.jpg
    caption: Drone footage of the campus that played before the August 27, 2020 broadcast began.
    frame: plain
  - id: home
    src: /stories/koistream/home.webp
    caption: The home page, signed out.
    frame: browser
---

## Why we built it

COVID hit in March of my junior year at Design Tech High School, and my whole senior year was online. A good friend and I decided to build our own livestream platform so the school could see each other again. We called it KoiStream because koi are a big thing at d.tech. They grow to the size of their pond.

## What I built

I wrote the website. You signed in with Google and landed on the watch page, with the player on one side and the chat on the other. Chat messages were capped at 100 characters, with a five-second wait between them and a filter for bad words.

![](#watch)

Moderators watched on the same page with extra buttons on every message, so they could delete it or mute the person who sent it. From a separate dashboard the crew set the episode's title and could turn the stream, the chat or slow mode on and off for everyone at once. Later in the fall I added polls that popped up for every viewer.

![](#admin-stream)

In August 2020 I moved the video onto AWS MediaLive and Amazon CloudFront. Together with FFmpeg, that's what delivered the stream in HD.

## How it went

Once KoiStream was running, over the summer we pitched the school on a real broadcasting studio, with cameras, audio and video switching. The school approved it and paid for it. I was cutting a hole in the wall when the principal walked by and asked, "Do you know what you're doing?" I said, "Yeah, I've got this."

![](#broadcast-credits)

We formed a team of ten students and ran live broadcasts every week through senior year, including an awards show for the whole school at the end of 2020. The studio is still there for students to use.

## What I took from it

No other school would have let a student do something that hands-on, fishing cables through walls and building a server rack. I'd been hesitant to pitch my own ideas when I got to d.tech. By senior year I was pitching and leading large projects like this one.
