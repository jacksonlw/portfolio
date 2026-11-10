// Stands in for src/mail/*.js, which sent SendGrid template emails. Logs instead of sending.
module.exports = data => console.log("[mock mail] not sent:", JSON.stringify(data));
