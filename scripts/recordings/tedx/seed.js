// Seeds the scratch database: the 360-seat hall from gen-seats.js, placeholder prices, and
// made-up completed orders. Usage: PGPORT=… node seed.js   (run with the clone's node_modules)
const knex = require("knex")({
  client: "pg",
  connection: { host: "127.0.0.1", user: "postgres", database: "ticketing" }
});

// Same layout as the repo's gen-seats.js: rows A–L, 30 seats each, rows A–C are VIP (type 2).
const rows = "ABCDEFGHIJKL".split("");
const seats = [];
rows.forEach(r => {
  for (let n = 1; n <= 30; n++) seats.push({ name: r + n, type: "ABC".includes(r) ? 2 : 1 });
});

// PLACEHOLDER prices. The real ones lived only in the production database.
const PRICE = { GA: 20, VIP: 40 }, FEE = 1;

// [first, last, day in Jan 2020, paid?, seats, shipping state, note]
const people = [
  ["Alex", "Sample", 6, true, ["E14", "E15"], "shipped"],
  ["Jordan", "Example", 7, true, ["B12", "B13", "B14"], "shipped"],
  ["Taylor", "Placeholder", 8, false, ["A15", "A16"], "none"],
  ["Morgan", "Testcase", 9, true, ["F9", "F10", "F11", "F12"], "pending"],
  ["Casey", "Demo", 10, true, ["C16", "C17"], "pending"],
  ["Riley", "Mockford", 11, true, ["G20", "G21"], "pending"],
  ["Jamie", "Fixture", 12, false, ["A1", "A2", "A3"], "none"],
  ["Quinn", "Sample", 13, true, ["D15", "D16", "D17"], "pending"],
  ["Avery", "Example", 13, true, ["B18", "B19"], "pending"],
  ["Sam", "Placeholder", 14, true, ["H5", "H6", "H7", "H8", "H9"], "pending"],
  ["Drew", "Demo", 14, true, ["E16", "E17", "E18"], "pending"],
  ["Robin", "Testcase", 15, true, ["C10", "C11"], "pending"]
];
const guests = ["Guest One", "Guest Two", "Guest Three", "Guest Four", "Guest Five"];

(async () => {
  await knex("seat_types").insert([
    { name: "GA", price: PRICE.GA, fee: FEE },
    { name: "VIP", price: PRICE.VIP, fee: FEE }
  ]);
  await knex("seats").insert(seats);
  let i = 0;
  for (const [first, last, day, paid, names, ship] of people) {
    i++;
    const ts = `2020-01-${String(day).padStart(2, "0")}T${10 + (i % 8)}:${10 + i * 3}:00-08:00`;
    const [order] = await knex("orders")
      .insert({ order_code: `DEMO${String(i).padStart(3, "0")}`, status: 4, timestamp: ts,
        note: i === 12 ? "Mock note: asked for aisle seats." : null })
      .returning("id");
    const id = order.id || order;
    await knex("customers").insert({
      order_id: id, first_name: first, last_name: last,
      email: `${first}.${last}@example.com`.toLowerCase(), phone_number: "555-0100",
      address_line_1: `${100 + i} Example Street`, address_line_2: "", city: "Anytown",
      state: "CA", zip_code: "00000"
    });
    let amount = 0;
    for (const [k, name] of names.entries()) {
      const attendee = k === 0 ? `${first} ${last}` : guests[k];
      const [seat] = await knex("seats").where({ name })
        .update({ order_id: id, attendee_name: attendee }).returning(["id", "type"]);
      await knex("seats_reservations")
        .insert({ order_id: id, seat_id: seat.id, attendee_name: attendee, timestamp: ts });
      amount += (seat.type === 2 ? PRICE.VIP : PRICE.GA) + FEE;
    }
    await knex("payments").insert({ order_id: id, amount: paid ? amount : 0 });
    await knex("shipments").insert({
      order_id: id, status: ship === "shipped", not_shipping: ship === "none",
      tracking_number: ship === "shipped" ? "1Z999AA10123456784" : null
    });
  }
  await knex.destroy();
})();
