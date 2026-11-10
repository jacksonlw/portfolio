// Seeds the scratch MongoDB for Branch. The repo has no seed data, so the document shapes are
// inferred from what routes/ and views/ read. Every name here is made up.
// Usage: MONGO_URL=mongodb://127.0.0.1:27027 node seed.js   (run with the clone's node_modules)
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// Test logins for the local run only. capture.js reads these too.
const logins = {
  teacher: { email: "teacher@example.com", password: "local-demo-teacher" },
  admin: { email: "admin@example.com", password: "local-demo-admin" }
};
module.exports = { logins };

const day = (d, h, m) => new Date(2019, 8, d, h, m).getTime(); // September 2019

const user = (firstName, lastName, role, login, extra = {}) => ({
  firstName, lastName, email: login.email, password: bcrypt.hashSync(login.password, 10),
  permission: role, permissionLevel: role === "admin" ? "3" : "1", school: "Demo High School",
  position: role === "admin" ? "Administrator" : "Teacher", profilePicture: "user.png",
  darkMode: false, rooms: ["127"], chqID: "0000", activeTFA: false, visibility: true,
  activity: { status: "online", lastSeen: day(17, 9, 0) },
  checks: { completedSecurityIntro: true, completedAccountSetup: true, accountSetupProgress: 100 },
  TFA: { method: "Pending", metadata1: "Pending", metadata2: "Pending", lastChecked: day(17, 9, 0) },
  ...extra
});

const teacherRef = { firstName: "Alex", lastName: "Sample", email: logins.teacher.email };
const other = n => ({ firstName: "Teacher", lastName: n, email: `teacher.${n.toLowerCase()}@example.com` });
const titles = ["English 2", "World History", "Algebra 2", "Chemistry", "TA", "Spanish 1"];
const student = (firstName, lastName, grade, id, mine) => ({
  firstName, lastName, grade, studentID: id,
  email: `${firstName}.${lastName}@example.com`.toLowerCase(),
  advisor: other("Two"),
  classes: titles.map((title, i) => ({
    title, room: i === mine ? "127" : String(101 + i),
    teacher: i === mine ? teacherRef : other(["One", "Two", "Three", "Four", "Five", "Six"][i])
  })),
  notes: id === 1001
    ? [{ creator: "Alex Sample", date: String(day(12, 10, 30)), message: "Mock note: asked for extra lab time.", noteID: "demo0001" }]
    : []
});

if (require.main === module) (async () => {
  const client = await MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true });
  const db = client.db("OpenWorld");
  await db.dropDatabase();
  const users = await db.collection("users").insertMany([
    user("Alex", "Sample", "teacher", logins.teacher),
    user("Jordan", "Example", "admin", logins.admin)
  ]);
  const teacherId = users.insertedIds[0];
  await db.collection("classrooms").insertOne({
    roomNumber: "127",
    devices: { lightSwitch: true, lightBrightness: 70, lightingColor: "#ffd9a8", projector: false,
      doorLock: false, blinds: "open", setTemp: 72, currentTemp: 71 }
  });
  await db.collection("currentLockdown").insertOne(
    { active: false, startTime: null, endTime: null, logID: null, liveChat: [], updates: [] });
  await db.collection("students").insertMany([
    student("Casey", "Demo", "Sophomore", 1001, 2), student("Morgan", "Testcase", "Junior", 1002, 3),
    student("Riley", "Mockford", "Freshman", 1003, 0), student("Jamie", "Fixture", "Senior", 1004, 3),
    student("Quinn", "Sample", "Sophomore", 1005, 2), student("Avery", "Example", "Junior", 1006, 5),
    student("Drew", "Placeholder", "Freshman", 1007, 0), student("Robin", "Demo", "Senior", 1008, 3)
  ]);
  await db.collection("logs").insertMany([
    { logID: "000000000001", pushUser: { _id: teacherId }, logType: "Security", actionTaken: true,
      data: { type: "Lockdown", time: day(10, 10, 5), endTime: day(10, 10, 27),
        description: "Mock drill: scheduled lockdown practice.",
        liveChat: [{ time: day(10, 10, 7), name: "Alex Sample", message: "Room 127 is secure." }],
        updates: [{ time: day(10, 10, 20), name: "Jordan Example", message: "This is a drill. All clear soon." }] } },
    ...[11, 12, 13, 16, 16, 17].map((d, i) => ({ logID: `10000000000${i}`, pushUser: { _id: teacherId },
      logType: "account",
      data: { type: "login", time: day(d, 8, 10 + i), description: "User has logged into their account" } }))
  ]);
  await db.collection("graphs").insertOne({ graph: "loginAct", currentData: "6",
    data: [2, 4, 3, 5, 4, 6].map((n, i) => ({ label: day(11 + i, 0, 0), data: String(n) })) });
  await db.collection("schools").insertOne({ schoolID: "0000", name: "Demo High School" });
  await db.collection("system").insertOne({ status: "online" });
  await client.close();
})();
