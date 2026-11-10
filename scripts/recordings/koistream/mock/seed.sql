-- Everything here is invented for the capture. No row comes from the real 2020 database.
INSERT INTO "nameColors" (color) VALUES ('#ffffff'), ('#026FFF'), ('#02e89e'), ('#e056fd'), ('#ff9f43'), ('#ff6b6b');
INSERT INTO "chatTags" (tag_name, tag_color) VALUES ('Moderator', '#02e89e'), ('Staff', '#ff9f43'), ('Class of 2021', '#026FFF');
INSERT INTO emojis (tag, src) VALUES ('smile','smile.svg'), ('grin','grin.svg'), ('laugh','laugh.svg'), ('love','love.svg'),
  ('cool','cool.svg'), ('wink','wink.svg'), ('starstruck','starstruck.svg'), ('surprised','surprised.svg'), ('dragon','dragon.png');
INSERT INTO "errorTypes" (id, name) VALUES (1,'Video Buffering'), (2,'Audio Cutting Out'), (3,'Chat Issues'), (4,'Website Issues'), (5,'Other');

INSERT INTO users ("googleId", email, "firstName", "lastName", "googleProfilePicture", auth, "nameColor", muted) VALUES
  ('mock-admin',   'moderator@example.org', 'demo',   'moderator', '/mock-avatars/a.svg', 3, 3, false),
  ('mock-viewer',  'viewer@example.org',    'sample', 'viewer',    '/mock-avatars/b.svg', 1, 2, false),
  ('mock-student', 'student@example.org',   'sample', 'student',   '/mock-avatars/c.svg', 1, 5, false),
  ('mock-staff',   'staff@example.org',     'sample', 'teacher',   '/mock-avatars/d.svg', 1, 4, false),
  ('mock-parent',  'parent@example.com',    'sample', 'parent',    '/mock-avatars/e.svg', 1, 1, false),
  ('mock-family',  'family@example.com',    'sample', 'family',    '/mock-avatars/f.svg', 1, 6, false),
  ('mock-muted',   'muted@example.com',     'sample', 'muted',     '/mock-avatars/g.svg', 1, 1, true),
  ('mock-alum',    'alum@example.com',      'sample', 'alum',      '/mock-avatars/h.svg', 1, 2, false);
INSERT INTO "userChatTags" ("user", "chatTagId") VALUES ('mock-admin', 1), ('mock-staff', 2), ('mock-student', 3);
UPDATE users SET "chatTag" = 1 WHERE "googleId" = 'mock-admin';
UPDATE users SET "chatTag" = 2 WHERE "googleId" = 'mock-staff';
UPDATE users SET "chatTag" = 3 WHERE "googleId" = 'mock-student';

INSERT INTO "streamSettings" VALUES (true, now() - interval '24 minutes 37 seconds', false, true, 5,
  'Sample Broadcast', 'Placeholder title and description for a local run with mock data. The video is a generated test pattern.');

INSERT INTO "liveChats" ("chatId", message, "messageFiltered", "userGoogleId", "timestamp") VALUES
  ('mockchat01', 'Good morning everyone :smile:', 'Good morning everyone :smile:', 'mock-student', now() - interval '9 minutes'),
  ('mockchat02', 'Sound and picture are both clear here', 'Sound and picture are both clear here', 'mock-parent', now() - interval '8 minutes'),
  ('mockchat03', 'Welcome in! Chat guidelines are linked below.', 'Welcome in! Chat guidelines are linked below.', 'mock-admin', now() - interval '7 minutes'),
  ('mockchat04', 'Watching from home with the whole family', 'Watching from home with the whole family', 'mock-family', now() - interval '6 minutes'),
  ('mockchat05', 'this segment is :starstruck:', 'this segment is :starstruck:', 'mock-viewer', now() - interval '5 minutes'),
  ('mockchat06', 'Thanks to the crew for setting this up', 'Thanks to the crew for setting this up', 'mock-staff', now() - interval '4 minutes'),
  ('mockchat07', 'that was a damn good intro', 'that was a **** good intro', 'mock-muted', now() - interval '3 minutes'),
  ('mockchat08', 'Go Dragons :dragon:', 'Go Dragons :dragon:', 'mock-alum', now() - interval '2 minutes'),
  ('mockchat09', 'Can you turn the 1080p option back on?', 'Can you turn the 1080p option back on?', 'mock-student', now() - interval '1 minutes');

INSERT INTO "streamActivity" (message, "user", "timestamp") VALUES
  ('Started the stream', 'mock-admin', now() - interval '24 minutes'),
  ('Turned off the stream slate', 'mock-admin', now() - interval '23 minutes'),
  ('Enabled the live chat', 'mock-admin', now() - interval '22 minutes'),
  ('Muted a user', 'mock-admin', now() - interval '3 minutes');

INSERT INTO "pollTemplates" (question) VALUES ('Sample poll question?');
INSERT INTO "pollTemplateOptions" VALUES (1, 'Option A'), (1, 'Option B'), (1, 'Option C');
