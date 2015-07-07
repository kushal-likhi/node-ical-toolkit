/**
 * ICS Builders
 * */

var crypto = require('crypto'),
  path = require('path');

function ICSFileBuilder() {

  this.calscale = 'GREGORIAN';
  this.version = '2.0';
  this.calname = null;
  this.method = 'PUBLISH';
  this.prodid = 'node-ical-toolkit';
  this.timezone = null;
  this.tzid = null;
  this.events = [];
  this.additionalTags = {};
  this.spacers = true;
  this.NEWLINE_CHAR = '\r\n';
  this.throwError = false;
  this.ignoreTZIDMismatch = true;

}

ICSFileBuilder.prototype.toString = function () {
  var lines = [];

  lines.push('BEGIN:VCALENDAR');

  if (this.version) lines.push('VERSION:' + this.version.toString().trim());
  if (this.calscale) lines.push('CALSCALE:' + this.calscale.toString().trim());
  if (this.calname) lines.push('X-WR-CALNAME:' + this.calname.toString().trim());
  if (this.method) lines.push('METHOD:' + this.method.toString().trim());
  if (this.prodid) lines.push('PRODID:' + this.prodid.toString().trim());
  if (this.timezone) lines.push('X-WR-TIMEZONE:' + this.timezone.toString().trim());
  if (this.tzid) {
    var tzData;
    try {
      tzData = require(path.join(__dirname, '../timezones/database', this.tzid.toString().toLowerCase().replace(/\//g, '-')));
      if (!tzData || !tzData.TZID) throw new Error('Timezone not found! Please check!');
    } catch (c) {
      if (this.ignoreTZIDMismatch) {
        tzData = {
          "VTIMEZONE": {
            "TZID": this.tzid
          },
          "TZID": this.tzid
        };
      } else {
        c = new Error('Unable to process TZID provided! ' + c.message);
        if (this.throwError) throw c;
        else return c;
      }
    }
    if (this.spacers)lines.push('');
    lines.push('BEGIN:VTIMEZONE');
    for (var key in tzData.VTIMEZONE) {
      if (tzData.VTIMEZONE.hasOwnProperty(key)) {
        if (typeof tzData.VTIMEZONE[key] == 'string' || tzData.VTIMEZONE[key] instanceof String) {
          lines.push(key + ':' + tzData.VTIMEZONE[key].toString().trim());
        } else {
          var ref = tzData.VTIMEZONE[key];
          if (ref instanceof Array) ref = ref[0];
          if (this.spacers)lines.push('');
          lines.push('BEGIN:' + key);
          for (var prop in ref) {
            if (ref.hasOwnProperty(prop)) {
              if (typeof ref[prop] == 'string' || ref[prop] instanceof String) {
                lines.push(prop + ':' + ref[prop].toString().trim());
              } else {
                //todo move this to recursive generic method. bad code, i know.
                //No inner tz tags supported. Invalid data. Ignore.
              }
            }
          }
          lines.push('END:' + key);
          if (this.spacers)lines.push('');
        }
      }
    }
    lines.push('END:VTIMEZONE');
    if (this.spacers)lines.push('');
  }

  for (var idx = 0; idx < this.events.length; idx++) {
    var _event = this._checkAndBuildEventObject(this.events[idx]);
    if (_event instanceof Error) {
      if (this.throwError) throw _event;
      else return _event;
    }
    if (this.spacers)lines.push('');
    lines.push('BEGIN:VEVENT');
    lines.push('UID:' + _event.uid);
    lines.push('DTSTAMP:' + _formatDate(_event.stamp));
    if (_event.transp) lines.push('TRANSP:' + _event.transp);
    if (_event.allDay) {
      lines.push('DTSTART;VALUE=DATE:' + _formatDate(_event.start, true));
      lines.push('DTEND;VALUE=DATE:' + _formatDate(_event.end, true));
    } else {
      lines.push('DTSTART:' + _formatDate(_event.start, false, _event.floating));
      lines.push('DTEND:' + _formatDate(_event.end, false, _event.floating));
    }
    lines.push('SUMMARY:' + _escape(_event.summary));
    lines.push('SEQUENCE:' + _event.sequence);
    if (_event.location) lines.push('LOCATION:' + _escape(_event.location));
    if (_event.description) lines.push('DESCRIPTION:' + _escape(_event.description));
    if (_event.url) lines.push('URL;VALUE=URI:' + _event.url);
    if (_event.status) lines.push('STATUS:' + _event.status.toUpperCase());
    if (_event.organizer) lines.push('ORGANIZER;' + (!!_event.organizer.sentBy ? ('SENT-BY="MAILTO:' + _event.organizer.sentBy + '":') : '') + 'CN="' + _event.organizer.name.replace(/"/g, '\\"') + '":mailto:' + _event.organizer.email);
    for (var ac = 0; ac < _event.attendees.length; ac++) {
      if (_event.attendees[ac] instanceof Error) {
        if (this.throwError) throw _event.attendees[ac];
        else return _event.attendees[ac];
      } else {
        lines.push('ATTENDEE;ROLE=' + _event.attendees[ac].role + ';PARTSTAT=' + _event.attendees[ac].status + (_event.attendees[ac].rsvp ? ';RSVP=TRUE' : '') + ';CN=' + _event.attendees[ac].name + ':MAILTO:' + _event.attendees[ac].email);
      }
    }
    for (var i = 0; i < _event.alarms.length; i++) {
      if (this.spacers)lines.push('');
      lines.push('BEGIN:VALARM');
      lines.push('TRIGGER:-PT' + _event.alarms[i] + 'M');
      lines.push('ACTION:DISPLAY');
      lines.push('END:VALARM');
      if (this.spacers)lines.push('');
    }
    if (_event.repeating) {
      var rrlue = 'RRULE:FREQ=' + _event.repeating.freq;

      if (_event.repeating.count) {
        rrlue += ';COUNT=' + _event.repeating.count;
      }

      if (_event.repeating.interval) {
        rrlue += ';INTERVAL=' + _event.repeating.interval;
      }

      if (_event.repeating.until) {
        rrlue += ';UNTIL=' + _formatDate(_event.repeating.until);
      }
      lines.push(rrlue);
    }
    for (var additionalProp in _event.additionalTags) {
      if (_event.additionalTags.hasOwnProperty(additionalProp)) {
        lines.push(additionalProp + ':' + _event.additionalTags[additionalProp]);
      }
    }
    lines.push('END:VEVENT');
    if (this.spacers)lines.push('');
  }
  if (this.additionalTags) {
    for (additionalProp in this.additionalTags) {
      if (this.additionalTags.hasOwnProperty(additionalProp)) {
        lines.push(additionalProp + ':' + this.additionalTags[additionalProp]);
      }
    }
  }
  lines.push('END:VCALENDAR');
  return lines.join(this.NEWLINE_CHAR);
};

ICSFileBuilder.prototype._checkAndBuildEventObject = function (rawEvent) {
  var event = {},
    allowedMethods = [
      'PUBLISH',
      'REQUEST',
      'REPLY',
      'ADD',
      'CANCEL',
      'REFRESH',
      'COUNTER',
      'DECLINECOUNTER'
    ],
    allowedRepeatingFreq = [
      'SECONDLY',
      'MINUTELY',
      'HOURLY',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      'YEARLY'
    ],
    allowedStatuses = [
      'CONFIRMED',
      'TENTATIVE',
      'CANCELLED'
    ];

  if (!rawEvent || typeof rawEvent !== 'object') {
    return new Error('event is not an object.');
  }

  // Date Start
  if (!rawEvent.start) {
    return new Error('event.start is a mandatory item.');
  }
  if (!(rawEvent.start instanceof Date)) {
    return new Error('event.start must be a Date Object.');
  }
  event.start = rawEvent.start;


  // Date Stop
  if (!rawEvent.end) {
    return new Error('event.end is a mandatory item.');
  }
  if (!(rawEvent.end instanceof Date)) {
    return new Error('event.end must be a Date Object.');
  }
  event.end = rawEvent.end;

  //Alarms
  event.alarms = rawEvent.alarms || [];

  //Additional tags
  event.additionalTags = rawEvent.additionalTags || {};

  // UID
  event.uid = rawEvent.uid || crypto.randomBytes(4).toString('hex').toString(36);

  //Update sequence
  event.sequence = rawEvent.sequence || 0;

  // Repeating Event
  if (rawEvent.repeating) {
    event.repeating = {};

    if (!rawEvent.repeating.freq || allowedRepeatingFreq.indexOf(rawEvent.repeating.freq.toUpperCase()) === -1) {
      return new Error('event.repeating.freq is a mandatory item, and must be one of the following: ' + allowedRepeatingFreq.join(', '));
    }

    event.repeating.freq = rawEvent.repeating.freq;

    if (rawEvent.repeating.count) {
      if (!isFinite(rawEvent.repeating.count)) {
        return new Error('event.repeating.count must be a Number.');
      }

      event.repeating.count = rawEvent.repeating.count;
    }

    if (rawEvent.repeating.interval) {
      if (!isFinite(rawEvent.repeating.interval)) {
        return new Error('event.repeating.interval must be a Number.');
      }

      event.repeating.interval = rawEvent.repeating.interval;
    }

    if (rawEvent.repeating.until) {
      if (!(rawEvent.repeating.until instanceof Date)) {
        return new Error('event.repeating.until must be a Date Object.');
      }
      event.repeating.until = rawEvent.repeating.until;
    }
  }

  // allDay flag
  event.allDay = !!rawEvent.allDay;

  // Date Stamp
  if (rawEvent.stamp && !(rawEvent.stamp instanceof Date)) {
    return new Error('event.stamp must be a Date Object.');
  }
  event.stamp = rawEvent.stamp || new Date();

  // Floating times
  event.floating = rawEvent.floating || false;

  // Summary
  if (!rawEvent.summary) {
    return new Error('event.summary is a mandatory item.');
  }
  event.summary = rawEvent.summary;

  // Location
  event.location = rawEvent.location || null;

  // Description
  event.description = rawEvent.description || null;

  //attendees
  event.attendees = [];
  (rawEvent.attendees || []).forEach(function (att) {
    if (att.name && att.email) {
      event.attendees.push({
        name: att.name,
        email: att.email,
        role: (att.role || 'REQ-PARTICIPANT').toUpperCase(),
        status: (att.status || 'NEEDS-ACTION').toUpperCase(),
        rsvp: !!att.rsvp
      });
    } else {
      event.attendees.push(new Error('Invalid attendee data, name and email is required: ' + JSON.stringify({input: att})));
    }
  });

  // Organizer
  event.organizer = null;
  if (rawEvent.organizer) {
    if (!rawEvent.organizer.name) {
      return new Error('event.organizer.name is empty.');
    }
    if (!rawEvent.organizer.email) {
      return new Error('event.organizer.email is empty.');
    }

    event.organizer = {
      name: rawEvent.organizer.name,
      email: rawEvent.organizer.email
    };

    if (rawEvent.organizer.sentBy) event.organizer.sentBy = rawEvent.organizer.sentBy;
  }

  // Method
  if (rawEvent.method && allowedMethods.indexOf(rawEvent.method.toUpperCase()) === -1) {
    return new Error('event.method must be one of the following: ' + allowedMethods.join(', '));
  }
  event.method = rawEvent.method;

  // Status
  if (rawEvent.status && allowedStatuses.indexOf(rawEvent.status.toUpperCase()) === -1) {
    return new Error('event.status must be one of the following: ' + allowedStatuses.join(', '));
  }
  event.status = rawEvent.status;

  // URL
  event.url = rawEvent.url || null;

  //Transp prop
  event.transp = rawEvent.transp;

  return event;
};

/**
 * Export builder
 * */
exports.createIcsFileBuilder = function () {
  return new ICSFileBuilder();
};

//Utils
function _formatDate(d, dateonly, floating) {
  var s;

  function pad(i) {
    return (i < 10 ? '0' : '') + i;
  }

  s = d.getUTCFullYear();
  s += pad(d.getUTCMonth() + 1);
  s += pad(d.getUTCDate());

  if (!dateonly) {
    s += 'T';
    s += pad(d.getUTCHours());
    s += pad(d.getUTCMinutes());
    s += pad(d.getUTCSeconds());

    if (!floating) {
      s += 'Z';
    }
  }

  return s;
}

function _escape(str) {
  return str.replace(/[\\;,\n]/g, function (match) {
    if (match === '\n') {
      return '\\n';
    }

    return '\\' + match;
  });
}
