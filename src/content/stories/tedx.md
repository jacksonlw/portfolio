---
gallery:
  - id: seat-selection
    src: /stories/tedx/seat-selection.webp
    caption: Picking seats on the map. This is the original code running locally, and the prices and buyers are placeholders.
    frame: browser
  - id: checkout
    src: /stories/tedx/checkout.webp
    caption: Checkout, with the countdown showing how long the seats are held (placeholder prices).
    frame: browser
  - id: order-status
    src: /stories/tedx/order-status.webp
    caption: A buyer's order page once the tickets are in the mail (sample order).
    frame: browser
  - id: admin-dashboard
    src: /stories/tedx/admin-dashboard.webp
    caption: The organizers' dashboard, with seats sold and recent orders (sample data).
    frame: browser
  - id: admin-orders
    src: /stories/tedx/admin-orders.webp
    caption: Searching orders by code, name, email or seat (sample data).
    frame: browser
---

## Why I built it

My high school was putting on a TEDx event in 2020, in a hall with assigned seats. I built a site for selling and managing its tickets.

## What I built

Buyers picked their seats on a map of the hall, which had 360 seats in 12 rows of 30, with the first three rows sold as VIP. Pressing Continue held those seats for 15 minutes, and a countdown ran through the rest of the steps. If it reached zero the seats went back on sale.

![](#seat-selection)

Nobody needed an account. Each order got a seven-character code, and its page showed the seats and whether the tickets had shipped. Tickets were physical and went out by mail, so the page linked to UPS tracking once they were on their way.

For the organizers there was a dashboard with seats sold, revenue and recent orders. They could search orders, fix a name, add a tracking number, or give out a free ticket from the same seat map.

![](#admin-dashboard)

## How it went

I built it over the fall of 2019 and into January 2020. Partway through I moved it from MongoDB to PostgreSQL. Holding the seats and creating the order happen in one step there, and it fails if someone else already has one of the seats.

It never launched. COVID arrived before the event, and the site was never used to sell a ticket.
