/**
 * Internal file for generating quick use database from .ics store.
 * */

var recursive = require('fs-readdir-recursive'),
  path = require('path'),
  fs = require('fs'),
  icsFiles = recursive(path.join(__dirname, 'zoneinfo')),
  ical2json = require("ical2json"),
  count = 0;

//Parse files.
// All in sync as this is one time process and we don't seek performance or event loop protection.
icsFiles.forEach(function (fileName) {
  if (fileName.search(/\.ics$/) == -1) return; //Not a ics file
  var fileData = ical2json.convert(fs.readFileSync(path.join(__dirname, 'zoneinfo', fileName)).toString()),
    TZID = fileData.VCALENDAR[0].VTIMEZONE[0]['X-LIC-LOCATION'];

  fileData = {
    VTIMEZONE: fileData.VCALENDAR[0].VTIMEZONE[0],
    TZID: TZID
  };
  fileData.VTIMEZONE.TZID = TZID;
  fs.writeFileSync(path.join(__dirname, 'database', TZID.toLowerCase().replace(/\//g, '-')) + '.json', JSON.stringify(fileData, null, 2));
  console.log(++count, 'Done:', TZID, '->', TZID.toLowerCase().replace(/\//g, '-'));
});
