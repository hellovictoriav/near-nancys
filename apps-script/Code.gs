/**
 * Near Nancy's family votes API.
 * Bound or standalone — writes to spreadsheet
 * 1RTtasYfCW41xW15fD_oYpg0BEoE0D-kmInNVHorTLEU
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Paste the /macros/s/.../exec URL into votes-config.json
 */
var ALLOWED = ["Edna", "Jannah", "Kiyanna", "Kenya", "Jacqueline", "Victoria"];
var VOTES = ["love", "maybe", "pass", ""];
var SHEET_ID = "1RTtasYfCW41xW15fD_oYpg0BEoE0D-kmInNVHorTLEU";

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName("Sheet1") || ss.getSheets()[0];
  var header = sh.getRange(1, 1, 1, 7).getValues()[0];
  if (!header[0]) {
    sh.getRange(1, 1, 1, 7).setValues([[
      "timestamp", "name", "listing_id", "address", "vote", "note", "action"
    ]]);
  }
  return sh;
}

function listVotes() {
  var values = sheet_().getDataRange().getValues();
  var latest = {};
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var ts = row[0];
    var name = String(row[1] || "").trim();
    var id = String(row[2] || "").trim();
    var vote = String(row[4] || "");
    var note = row[5] == null ? "" : String(row[5]);
    var action = String(row[6] || "").toLowerCase();
    if (!name || !id) continue;
    var key = name + "\t" + id;
    var cur = latest[key] || {
      name: name,
      listing_id: id,
      vote: "",
      note: "",
      timestamp: ts
    };
    if (action === "note") {
      cur.note = note;
    } else if (action === "vote") {
      cur.vote = vote;
      if (note !== "") cur.note = note;
    } else {
      cur.vote = vote;
      cur.note = note;
    }
    cur.timestamp = ts;
    latest[key] = cur;
  }
  var votes = [];
  for (var k in latest) votes.push(latest[k]);
  return { votes: votes };
}

function applyVote(name, listingId, address, vote, note, action) {
  name = String(name || "").trim();
  if (ALLOWED.indexOf(name) === -1) {
    return { ok: false, error: "invalid name" };
  }
  vote = String(vote || "").toLowerCase();
  if (VOTES.indexOf(vote) === -1) {
    return { ok: false, error: "invalid vote" };
  }
  listingId = String(listingId || "").trim();
  if (!listingId) {
    return { ok: false, error: "missing listing_id" };
  }
  note = note == null ? "" : String(note);
  address = String(address || "");
  if (!action) {
    action = (vote === "" && note !== "") ? "note" : "vote";
  }
  action = String(action);
  sheet_().appendRow([new Date(), name, listingId, address, vote, note, action]);
  return { ok: true, votes: listVotes().votes };
}

function doGet(e) {
  e = e || { parameter: {} };
  var p = e.parameter || {};
  if (String(p.op || "list") === "vote") {
    return jsonOut_(applyVote(p.name, p.listing_id, p.address, p.vote, p.note, p.action));
  }
  return jsonOut_(listVotes());
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    body = {};
  }
  var p = (e && e.parameter) || {};
  return jsonOut_(applyVote(
    body.name || p.name,
    body.listing_id || p.listing_id,
    body.address || p.address,
    body.vote || p.vote,
    body.note != null ? body.note : p.note,
    body.action || p.action
  ));
}

function doOptions() {
  return jsonOut_({ ok: true });
}
