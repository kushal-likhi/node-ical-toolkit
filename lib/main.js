/**
 * ICAL Toolkit
 * Main file
 * */

var parser = require('./parser'),
  builder = require('./builder');

/**
 * Parsers
 * */
exports.parseToJSON = parser.parseToJSON;
exports.parseFileToJSONSync = parser.parseFileToJSONSync;
exports.parseFileToJSON = parser.parseFileToJSON;

/**
 * Builders
 * */
exports.createIcsFileBuilder = builder.createIcsFileBuilder;
