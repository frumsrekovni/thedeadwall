/**
 * THE DEAD WALL — registration backend (Google Apps Script)
 * -------------------------------------------------------------------
 *   • POST -> appends a sign-up row to a Google Sheet
 *   • GET  -> returns the wall (all names + paid status + counts) as JSONP
 *
 * FIRST-TIME SETUP (≈5 min, free, no server):
 *   1. Create a Google Sheet (sheets.new).
 *   2. Extensions ▸ Apps Script. Delete the sample, paste ALL of this file.
 *   3. Deploy ▸ New deployment ▸ "Web app"
 *        - Execute as: Me
 *        - Who has access: Anyone
 *      Deploy, authorize, copy the /exec URL, and paste it into
 *      EVENT.registration.endpoint in index.html.
 *
 * IF YOU ALREADY DEPLOYED an earlier version of this file:
 *   Paste this new version, then Deploy ▸ Manage deployments ▸ (edit, pencil)
 *   ▸ Version: "New version" ▸ Deploy. The /exec URL stays the SAME.
 *
 * MARKING SOMEONE AS PAID:
 *   In the Sheet, put  Yes  (or TRUE, or tick a checkbox) in the "paid" column
 *   (H) on that person's row. The little box next to their name on the site
 *   turns into a green check. Leave it blank for "not paid yet".
 *
 * Emails are stored in the Sheet but are NEVER sent to the website.
 * To remove a name, delete its row.
 */

var SEATS = 36;                  // playing seats, shown in the counter
var SHEET_NAME = 'Registrations';
var HEADER = ['timestamp', 'name', 'email', 'type', 'costume', 'quiz', 'listed', 'paid', 'notes'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADER);
  }
  // self-heal: make sure the "paid" and "notes" headers exist on older sheets
  if (String(sh.getRange(1, 8).getValue()).trim() === '') sh.getRange(1, 8).setValue('paid');
  if (String(sh.getRange(1, 9).getValue()).trim() === '') sh.getRange(1, 9).setValue('notes');
  return sh;
}

function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var name = String(d.name || '').slice(0, 60).trim();
    var email = String(d.email || '').slice(0, 120).trim();
    var notes = String(d.notes || '').slice(0, 400).trim();
    if (!name || !email) return json_({ ok: false, error: 'missing name/email' });
    sheet_().appendRow([
      new Date(), name, email,
      String(d.type || ''), '', '',
      'Yes', '', notes   // listed, paid (blank until you mark it), notes
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet(e) {
  var values = sheet_().getDataRange().getValues();
  var header = (values.shift() || []).map(function (h) { return String(h).trim().toLowerCase(); });
  function col(name, def) { var i = header.indexOf(name); return i === -1 ? def : i; }
  var iName = col('name', 1), iType = col('type', 3), iPaid = col('paid', 7);
  var count = 0, playing = 0, names = [];
  values.forEach(function (r) {
    var nm = String(r[iName] || '').trim();
    if (!nm) return;                 // no name -> skip
    count++;
    var type = String(r[iType] || '');
    if (/^Playing/i.test(type)) playing++;
    var pc = r[iPaid];
    // a ticked checkbox comes through as boolean true; also accept common text values
    var paid = pc === true || /^(yes|true|paid|y|x|1|✓|✔)$/i.test(String(pc).trim());
    names.push({ name: nm, type: type, paid: paid });
  });
  var out = { ok: true, seats: SEATS, count: count, playing: playing, names: names };
  var cb = e && e.parameter && e.parameter.callback;
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(out);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
