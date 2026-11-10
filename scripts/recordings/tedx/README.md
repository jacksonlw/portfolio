# The TEDx ticketing capture

These scripts run the 2019 ticketing app (`github.com/jacksonlw/ticketing-tedxdesigntech`) on this Mac with mock data and shoot the portfolio stills. Nothing is pushed: the clone is only patched locally.

## Prereqs

- `node`, `git`, Google Chrome, and PostgreSQL's `initdb`, `pg_ctl` and `psql` on the PATH.
- `cwebp` and `ffmpeg` for encoding.

## Usage

```bash
scripts/recordings/tedx/capture.sh /path/to/work /path/to/raw-out
mkdir sel && cp raw-out/{seat-selection,checkout,order-status,admin-dashboard,admin-orders}.png sel/
WIDTH=1600 scripts/recordings/encode.sh sel public/stories/tedx
```

`capture.sh` clones the repo into the work directory, starts its own Postgres there on port 54330 and the app on port 4020, shoots, and stops both. It writes `seat-selection`, `attendee-names`, `checkout`, `admin-dashboard`, `admin-orders`, `admin-manage-order` and `order-status` (.png, 2880×1800). The site uses five of them.

## What is mocked

- **Database.** The repo has no schema, so `schema.sql` is inferred from the queries in `src/db/`. `seed.js` fills it: the 360 seats from the repo's `gen-seats.js`, and 12 made-up orders dated 6–15 January 2020.
- **Prices.** GA $20, VIP $40 and a $1 fee are placeholders. The real prices lived only in the production database.
- **People.** Every buyer and attendee is invented (`example.com` emails, "Guest Two"). The "Jackson Lawrence, Executive" in the admin sidebar is hard-coded in the repo's `nav.pug`.
- **Stripe.** The two modules in `src/stripe/` are replaced with stubs, and the browser gets an inert `Stripe` object instead of Stripe.js. The Purchase button is never pressed. The test keys in the repo are not used.
- **Email.** The two SendGrid modules in `src/mail/` are replaced with a logger.
- **Clock.** The admin and order pages are shot with the browser clock pinned to 15 January 2020, so "This Week's Revenue" counts the seeded orders. The buying pages use the real clock because the 15-minute hold timer needs it.

## Other local changes to the clone

- `pg` goes from 7 to 8 and `pg-native` is dropped, because pg 7 can't connect on current Node.
- `express-flash` pointed at a dead `git://` URL; it now comes from npm.
- `build-static.js` replaces `gulp static`: Stylus to CSS and a plain copy of the scripts, no Babel.
- The port, hard-coded to 3000, reads `PORT`.

## Notes

- The seat map is laid out for a wider screen than 1440px, where the Overview panel falls off the right edge. `seat-selection` is shot at a 1920×1200 viewport at 1.5x, which gives the same 2880×1800 image.
- Paid orders in the stills are seeded straight into the database. In the repo as committed, the Stripe webhook only logs, so a card payment never marks an order complete.
