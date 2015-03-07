/**
 * Parsers
 * */

//Deps
var ical2json = require('ical2json'),
  fs = require('fs');

//Make it better later on, Don't release the zango
/**
 * Parse file string to JSON
 * */
exports.parseToJSON = function (fileContent, callback) {
  try {
    fileContent = fileContent.toString();
    var json = ical2json.convert(fileContent);
    if (typeof callback == 'function') {
      setImmediate(function () {
        callback(null, json);
      });
    } else return json;
  } catch (err) {
    err = new Error('Error in parsing .ics file string. ' + err.message);
    if (typeof callback == 'function') {
      setImmediate(function () {
        callback(err);
      });
    } else return err;
  }
};

/**
 * parse file to JSON
 * */
exports.parseFileToJSON = function (filePath, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) callback(new Error(err));
    else exports.parseToJSON(content, callback);
  });
};

/**
 * parse file to JSON Sync
 * */
exports.parseFileToJSONSync = function (filePath) {
  try {
    return exports.parseToJSON(fs.readFileSync(filePath));
  } catch (c) {
    return new Error('Error in parsing .ics file string. ' + c.message);
  }
};
