# The Branch capture

These scripts run the 2019 Branch dashboards (`github.com/jacksonlw/Branch`) on this Mac with mock data and shoot the portfolio stills. Nothing is pushed: the clone is only patched locally.

## Prereqs

- `node`, `git`, Google Chrome and `mongod` on the PATH.
- `cwebp` and `ffmpeg` for encoding.

## Usage

```bash
scripts/recordings/branch/capture.sh /path/to/work /path/to/raw-out
mkdir sel && cp raw-out/{classroom-controls,security,lockdown,manage-students,admin-dashboard}.png sel/
WIDTH=1600 scripts/recordings/encode.sh sel public/stories/branch
```

`capture.sh` clones the repo into the work directory, starts its own `mongod` there on port 27027 and the app on port 4010, shoots, and stops both. It never touches a MongoDB already running on 27017. It writes `classroom-controls`, `pa-system`, `manage-students`, `security`, `lockdown`, `admin-dashboard`, `admin-school-controls` and `admin-security` (.png, 2880×1800). The site uses five of them.

## What is mocked

- **Database.** The repo has no seed data. `seed.js` builds the `OpenWorld` database from the shapes the routes and views read: two users, classroom 127, eight students, one past lockdown and a few login logs.
- **People.** Everyone is invented ("Alex Sample" the teacher, "Jordan Example" the admin, `example.com` emails). Both users get the stock `user.png` avatar; the photos in the repo's `public/uploads/` are not shown.
- **Logins.** The two test accounts and their passwords are in `seed.js`. They exist only in the scratch database.
- **Hardware.** There is none. The dashboard sends its Socket.IO commands (`doorLock`, `blindsClose`, `lightingColor:…`) and nothing is listening, so no door, blind, light or speaker reacts. The temperature in the Climate gauge is the seeded 71°F, not a sensor reading.
- **Dates.** The lockdown in `lockdown.png` is a real run through the app: begun from the Security page, one chat line, one `!update`, ended with the password prompt. Afterwards the logs that run wrote are re-dated to 17 September 2019 so the admin dashboard doesn't show today's date.

## Other local changes to the clone

- The committed 2019 `node_modules` are deleted and reinstalled with `mongodb` 3.7 and `mongoose` 5.13. The original driver can't talk to a current MongoDB server.
- Every hard-coded `mongodb://localhost:27017` reads `MONGO_URL` instead, and the port reads `PORT`.

## Notes

- On the admin dashboard, the Energy, Water and Attendance charts are hard-coded sample curves in `views/admin/dashboard.pug`. Only Logins reads the database.
- `admin-school-controls` shows the school's name and floor plan, and its header overlaps at 1440px. It is not one of the five.
- The 2FA pages and the phone-triggered alert route were not exercised.
