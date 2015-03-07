var assert = require("assert"),
  fs = require('fs'),
  path = require('path'),
  icalToolkit = require('../lib/main');

describe('ICAL Parser Test Suite', function () {
  var icsContent,
    sampleFilePAth = path.join(__dirname, 'sample/apple_exported.ics');
  before(function (done) {
    this.timeout(10000);
    fs.readFile(sampleFilePAth, function (err, content) {
      if (err) throw err;
      icsContent = content;
      assert(icsContent);
      done();
    });
  });

  describe('Parse ContentTo JSON Test', function () {

    it('should parse the content sync', function (done) {
      var json = icalToolkit.parseToJSON(icsContent);
      assert(json);
      assert(!(json instanceof Error));
      assert(json.VCALENDAR);
      done();
    });

    it('should parse the content async', function (done) {
      icalToolkit.parseToJSON(icsContent, function (err, json) {
        if (err) throw err;
        assert(json);
        assert(!(json instanceof Error));
        assert(json.VCALENDAR);
        done();
      });
    });

    it('should not parse the null string async', function (done) {
      icalToolkit.parseToJSON(null, function (err, json) {
        assert(err);
        assert(!json);
        assert(err instanceof Error);
        done();
      });
    });

    it('should not parse the null string sync', function (done) {
      var json = icalToolkit.parseToJSON(null);
      assert(json);
      assert(json instanceof Error);
      assert(!json.VCALENDAR);
      done();
    });

    it('should parse the empty string sync', function (done) {
      var json = icalToolkit.parseToJSON('');
      assert(json);
      assert(!(json instanceof Error));
      assert(!json.VCALENDAR);
      done();
    });

  });

  describe('Parse contents from file to JSON Async Test', function () {

    it('should parse the file', function (done) {
      icalToolkit.parseFileToJSON(sampleFilePAth, function (err, json) {
        if (err) throw err;
        assert(json);
        assert(!(json instanceof Error));
        assert(json.VCALENDAR);
        done();
      });
    });

    it('should not parse the invalid file', function (done) {
      icalToolkit.parseFileToJSON('test/no-file.ics', function (err, json) {
        assert(err);
        assert(!json);
        assert(err instanceof Error);
        done();
      });
    });

  });

  describe('Parse contents from file to JSON Sync Test', function () {

    it('should parse the file sync', function (done) {
      var json = icalToolkit.parseFileToJSONSync(sampleFilePAth);
      assert(json);
      assert(!(json instanceof Error));
      assert(json.VCALENDAR);
      done();
    });

    it('should not parse the invalid file sync', function (done) {
      var json = icalToolkit.parseFileToJSONSync('test/no-file.ics');
      assert(json);
      assert(json instanceof Error);
      assert(!json.VCALENDAR);
      done();
    });

  });

  after(function () {

  });
});
