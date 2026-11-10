-- The repo has no migrations. This schema is rebuilt from the queries in src/db/**,
-- so column types and defaults are a best guess; names are the ones the code uses.
CREATE TABLE "nameColors" (id serial PRIMARY KEY, color text);
CREATE TABLE "chatTags" (id serial PRIMARY KEY, tag_name text, tag_color text);
CREATE TABLE "userChatTags" (id serial PRIMARY KEY, "user" text, "chatTagId" int);
CREATE TABLE users (
  "googleId" text PRIMARY KEY, email text, "firstName" text, "lastName" text,
  "googleProfilePicture" text, auth int DEFAULT 0, muted boolean DEFAULT false,
  "lastChatTime" timestamptz DEFAULT '2020-01-01', "chatTag" int, "nameColor" int DEFAULT 1,
  "dateCreated" timestamptz DEFAULT now(), online boolean DEFAULT false, "lastOnline" timestamptz
);
CREATE TABLE "socketConnections" ("googleId" text, page text, "socketId" text);
CREATE TABLE "streamSettings" (
  "streamActive" boolean, "streamStartTime" timestamptz, slate boolean,
  "chatActive" boolean, "chatCooldown" int, title text, description text
);
CREATE TABLE "liveChats" (
  "chatId" text PRIMARY KEY, message text, "messageFiltered" text, "userGoogleId" text,
  "timestamp" timestamptz DEFAULT now(), deleted boolean DEFAULT false, cleared boolean DEFAULT false
);
CREATE TABLE emojis (tag text, src text);
CREATE TABLE "streamActivity" (id serial PRIMARY KEY, message text, "user" text, "timestamp" timestamptz DEFAULT now());
CREATE TABLE polls (id text PRIMARY KEY, question text, active boolean DEFAULT true, time_start timestamptz DEFAULT now());
CREATE TABLE "pollOptions" (id text PRIMARY KEY, poll_id text, value text, "voteCount" int DEFAULT 0);
CREATE TABLE "pollAnswers" (poll_id text, "user" text, option_id text);
CREATE TABLE "pollTemplates" (id serial PRIMARY KEY, question text);
CREATE TABLE "pollTemplateOptions" (poll_template_id int, value text);
CREATE TABLE "errorTypes" (id int PRIMARY KEY, name text);
CREATE TABLE errors (id text PRIMARY KEY, status int, type int, "userGoogleId" text, description text, notes text);
CREATE TABLE logs (message text, category text, "timestamp" timestamptz DEFAULT now());
