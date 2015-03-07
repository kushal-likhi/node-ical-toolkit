/**
 * ICAL Toolkit
 * Main file
 * */

var parser = require('./parser');

/**
 * Parsers
 * */
exports.parseToJSON = parser.parseToJSON;
exports.parseFileToJSONSync = parser.parseFileToJSONSync;
exports.parseFileToJSON = parser.parseFileToJSON;

/**
 * Builders
 * */
