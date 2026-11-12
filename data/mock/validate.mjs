import fs from "node:fs";
import assert from "node:assert/strict";
const dir = new URL(".", import.meta.url);
for (const [filename, count] of [["lawyers.json", 40], ["users.json", 100]]) {
  const data = JSON.parse(fs.readFileSync(new URL(filename, dir), "utf8"));
  assert.equal(data.synthetic, true);
  assert.equal(data.count, count);
  assert.equal(data.records.length, count);
  assert.equal(new Set(data.records.map(record => record.id)).size, count);
  assert.ok(data.records.every(record => record.mock === true));
  if (filename === "lawyers.json") {
    assert.ok(data.records.every(record => record.license_verified === false && record.identity_verified === false && record.professional_license === null && record.rating === null));
  } else {
    assert.ok(data.records.every(record => record.email.endsWith("@example.invalid") && record.password === null && record.consent_to_contact === false));
  }
}
console.log("Synthetic fixtures validated: 40 lawyers, 100 users");
