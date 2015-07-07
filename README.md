#ICal Toolkit NodeJS
ICal generator/updater/parser with Timezone/DST, Alams, Organizers, Events, etc. support.

100% JavaScript implementation.

[![NPM](https://nodei.co/npm/ical-toolkit.png?downloads=true)](https://nodei.co/npm/ical-toolkit/)

Ical **generator** supports the following:
* VTIMEZONE - TIMEZONE/DST info. We have inbuilt timezone database, you just specify TimeZone ID and rest module will take care.
* Alarms
* Attendees info and state per event.
* Organizers
* Multiple events
* Full day and repeating events
* URL property
* Simple intuitive interface.
 
 
##Install
```bash
> npm install ical-toolkit
```

##Builder
Quick documentation, but covers all and will get you going quick!

####Values to use:
Here are the constants you can use:

#####Attendee Role
```
"REQ-PARTICIPANT"; Indicates a participant whose
                 ; participation is required
                 
"OPT-PARTICIPANT" ; Indicates a participant whose
                  ; participation is optional
                  
"NON-PARTICIPANT" ; Indicates a participant who is
                  ; copied for information purposes only
```

#####Attendee Status
```
"NEEDS-ACTION"        ; Event needs action
"ACCEPTED"            ; Event accepted
"DECLINED"            ; Event declined
"TENTATIVE"           ; Event tentatively accepted
"DELEGATED"           ; Event delegated
```

#####Methods
```
      'PUBLISH',
      'REQUEST',
      'REPLY',
      'ADD',
      'CANCEL',
      'REFRESH',
      'COUNTER',
      'DECLINECOUNTER'
    
```

#####Repeating Freq for event
```
      'SECONDLY',
      'MINUTELY',
      'HOURLY',
      'DAILY',
      'WEEKLY',
      'MONTHLY',
      'YEARLY'
```

#####Statuses for event
```
      'CONFIRMED',
      'TENTATIVE',
      'CANCELLED'
```


###Demo code, shows all.
```javascript
var icalToolkit = require('ical-toolkit');

//Create a builder
var builder = icalToolkit.createIcsFileBuilder();

/*
 * Settings (All Default values shown below. It is optional to specify)
 * */
builder.spacers = true; //Add space in ICS file, better human reading. Default: true
builder.NEWLINE_CHAR = '\r\n'; //Newline char to use.
builder.throwError = false; //If true throws errors, else returns error when you do .toString() to generate the file contents.
builder.ignoreTZIDMismatch = true; //If TZID is invalid, ignore or not to ignore!


/**
 * Build ICS
 * */

//Name of calander 'X-WR-CALNAME' tag.
builder.calname = 'Yo Cal';

//Cal timezone 'X-WR-TIMEZONE' tag. Optional. We recommend it to be same as tzid.
builder.timezone = 'america/new_york';

//Time Zone ID. This will automatically add VTIMEZONE info.
builder.tzid = 'america/new_york';

//Method
builder.method = 'REQUEST';

//Add events
builder.events.push({

  //Event start time, Required: type Date()
  start: new Date(),
  
  //Event end time, Required: type Date()
  end: new Date(),
  
  //transp. Will add TRANSP:OPAQUE to block calendar.
  transp: 'OPAQUE',
  
  //Event summary, Required: type String
  summary: 'Test Event',

  //All Optionals Below
  
  //Alarms, array in minutes
  alarms: [15, 10, 5], 
  
  //Optional: If you need to add some of your own tags
  additionalTags: {
    'SOMETAG': 'SOME VALUE'
  },
  
  //Event identifier, Optional, default auto generated
  uid: null, 
  
  //Optional, The sequence number in update, Default: 0
  sequence: null,
  
  //Optional if repeating event
  repeating: {
    freq: 'DAILY',
    count: 10,
    interval: 10,
    until: new Date()
  },
  
  //Optional if all day event
  allDay: true,
  
  //Creation timestamp, Optional.
  stamp: new Date(),
  
  //Optional, floating time.
  floating: false,
  
  //Location of event, optional.
  location: 'Home',
  
  //Optional description of event.
  description: 'Testing it!',
  
  //Optional Organizer info
  organizer: {
    name: 'Kushal Likhi',
    email: 'test@mail',
    sentBy: 'person_acting_on_behalf_of_organizer@email.com' //OPTIONAL email address of the person who is acting on behalf of organizer.
  },
  
  //Optional attendees info
  attendees: [
    {
      name: 'A1', //Required
      email: 'a1@email.com', //Required
      status: 'TENTATIVE', //Optional
      role: 'REQ-PARTICIPANT', //Optional
      rsvp: true //Optional, adds 'RSVP=TRUE' , tells the application that organiser needs a RSVP response.
    },
    {
      name: 'A2',
      email: 'a2@email.com'
    }
  ]
  
  //What to do on addition
  method: 'PUBLISH',
  
  //Status of event
  status: 'CONFIRMED',
  
  //Url for event on core application, Optional.
  url: 'http://google.com'
});

//Optional tags on VCALENDAR level if you intent to add. Optional field
builder.additionalTags = {
  'SOMETAG': 'SOME VALUE'
};


//Try to build
var icsFileContent = builder.toString();

//Check if there was an error (Only required if yu configured to return error, else error will be thrown.)
if (icsFileContent instanceof Error) {
  console.log('Returned Error, you can also configure to throw errors!');
  //handle error
}

//Here isteh ics file content.
console.log(icsFileContent);

```
####Output####
```
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
X-WR-CALNAME:Yo Cal
METHOD:REQUEST
PRODID:node-ical-toolkit
X-WR-TIMEZONE:asia/kalcutta

BEGIN:VTIMEZONE
TZID:America/New_York
X-LIC-LOCATION:America/New_York

BEGIN:DAYLIGHT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:EDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT


BEGIN:STANDARD
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:EST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD

END:VTIMEZONE


BEGIN:VEVENT
UID:f0e532a3
DTSTAMP:20150707T070727Z
TRANSP:OPAQUE
DTSTART;VALUE=DATE:20150707
DTEND;VALUE=DATE:20150707
SUMMARY:Test Event
SEQUENCE:0
LOCATION:Home
DESCRIPTION:Testing it!
URL;VALUE=URI:http://google.com
STATUS:CONFIRMED
ORGANIZER;SENT-BY="MAILTO:hello@test.com":CN="Kushal Likhi":mailto:test@mail
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=TENTATIVE;RSVP=TRUE;CN=A1:MAILTO:a1@email.com
ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=A2:MAILTO:a2@email.com

BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
END:VALARM


BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
END:VALARM


BEGIN:VALARM
TRIGGER:-PT5M
ACTION:DISPLAY
END:VALARM

RRULE:FREQ=DAILY;COUNT=10;INTERVAL=10;UNTIL=20150707T070727Z
SOMETAG:SOME VALUE
END:VEVENT

SOMETAG:SOME VALUE
END:VCALENDAR
```

##Parser##
Parse the ics files to JSON structures
```javascript
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

    it('should parse the file', function (done) {
      icalToolkit.parseFileToJSON(sampleFilePAth, function (err, json) {
        if (err) throw err;
        assert(json);
        assert(!(json instanceof Error));
        assert(json.VCALENDAR);
        done();
      });
    });
 
    it('should parse the file sync', function (done) {
      var json = icalToolkit.parseFileToJSONSync(sampleFilePAth);
      assert(json);
      assert(!(json instanceof Error));
      assert(json.VCALENDAR);
      done();
    });        
    
```
