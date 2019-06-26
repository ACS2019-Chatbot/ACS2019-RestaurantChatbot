// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {google} = require('googleapis');
const calendar = google.calendar('v3');
const {WebhookClient} = require('dialogflow-fulfillment');
const calendarId = "us5n7gdijfjud94992j9qu4fgk@group.calendar.google.com";
const calendarID = 'us5n7gdijfjud94992j9qu4fgk@group.calendar.google.com';
const serviceAccount = {
    "type": "service_account",
    "project_id": "restaurant-booking-7e726",
    "private_key_id": "8fc31da4ebdf43ecc5f9713137f476cccc044f46",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDDcM7QiZ7lOKyD\ndU27ghp/krrcZyvo7PZSNOOIr0vJYjwTafCpb5sBknjNq44LxSprtXLVBJKYGNMB\nCXefip3BlawlhSDcBbwfhfjKj6LkU7ZuRyDfRQJVcB4fWt9+fZj4z/EIJCmX85p+\n8SyDr5Kh4GlCic6YX4TBGeUe2Pl70WEYNrp3+oI1Aq4/Deorez7y7hnfuW5BLG3K\n+OEui2LS0n5ilH5n+y+VjOrzoe9VZwbCVSb/3Mulx4nfD7e0ajwJ9xlBYJENwnJC\neM2hGCrjNKa3/oU+VdSGhbuCebKXfqv6Vj40yuknf2j7AXxFn9SWrHkg3j3g6JZj\ni5xLpAS7AgMBAAECggEARMxLIUGwu4QNxmDesikEZvAh80AmRuJTe3C+v/jlNsjr\n2PGsFBkDebQz7kJ7yEzpt+yxtabca8ohTPYmM/U5v1GOvc51WL50EKy6faO+dZ26\nVGuZeL70KVtEX0k/72kLFlssv+7q7WCFfDYts1V0yqMSqqeUIDNPqiIRc6BxglH+\nxb5dvMBS50lLUFJ8qc1JiVUAHYiPZzkQa9YEBTIExJasmFARzOf+NN95VJuwyjB4\n89zWalHz1qcd+sD96rrZAENmqCHJ40uwsxhE0XLvUq5XmLP3VdpUc5HOLk+YiFki\nQ2yEOuhAGv4KSuvrLp4fLnz09CNJuSU9aX4XWWMJAQKBgQDnvxDF7vruczOh8kdE\nCadJSHwrrJatVy3p3hfWnqB5J+RtryXyWCyqCxIs4bSYaR7zHUFbzLGLIZS8WHMH\nRXEGnS2Aj8Kz8TX8CZSxw+axEcsXlOplr71Z2eHXB5N4+C8UtZX+m++WcE7RSoVh\nS5hMrotN3mb1Ss5Y2smifkUcwQKBgQDX5QrXOkF5FcORQ63NvngQfZvLD9GVCk1w\nUZC5p3EuywzEhcAmlUHqIjgBP5FEIGZQRfWE2zwjrjjVGF32olIB1diiIZO4nRjb\nWTdKVwmQTdqhi79HG4bmEalPeQmdNFIR27k3jBzIPNYeR/8LetMzhV4j5shbd9Hz\nVXPHhJg0ewKBgQC6RLRyo3dFmYryrA3j/e5b1MsZP4uMn/njdAOtGaraNto/3vud\nIooj0uo08OV7a2LY/ba+1nQN5FvsVxt9yK7kJgmgv+w7PbGqdvjxOQh/YlHfDm6o\ndOy4/4uqjghWvwT4nEuHbkbQoEx5pHA4l84+NDz7xbrzhcD9Yj2XQe7DAQKBgHaA\n9WtgQbH6HUfuM0ecxgCfQdW7UBoT9p+xVdRiMYEy2UZB+E/1W6HtuHoO72jKs/5Z\n+EM9p4waRH3Li0Ampwb0351W+uO573vvQ6cdkVVRNrG3qH2agXhlt161HG7a2jWN\nOuRflyjeI9WpRTiC6cz85sikE9QJOAfuHsgkYvtjAoGAbiEumSV8/lZXW1mtplYN\npIg4jqmv8grXlEfrh2G/R8/FgTIWJA+STmO49emEWosEPcbs0DNU1RbBFb8CL4mx\nEJHYwvdGed7xmJyyLYNTCmp7Mg9jSLjnOGmh+sUj34QMQnA5n2dfkOjXJIO0W1uc\n2oYBsck8YYsTwBMw+7R+EY8=\n-----END PRIVATE KEY-----\n",
    "client_email": "restaurant-booking-calendar@restaurant-booking-7e726.iam.gserviceaccount.com",
    "client_id": "105805538511090550919",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/restaurant-booking-calendar%40restaurant-booking-7e726.iam.gserviceaccount.com"
};

// Set up Google Calendar Service account credentials
const serviceAccountAuth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: 'https://www.googleapis.com/auth/calendar'
});

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
admin.initializeApp(functions.config().firebase); 
var db = admin.firestore();
db.settings({timestampsInSnapshots: true});

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => { 
  //Variables for booking function 	
  const agent = new WebhookClient({ request, response });
  const adults = agent.parameters.adults;
  const children = agent.parameters.children;
  const currentTime = new Date();
  const maxGuest = 100;
  const FieldValue = admin.firestore.FieldValue;
  var lastName = agent.parameters.lastName;
  var mobile = agent.parameters.mobile || "0123456789";
  var last3Digits = mobile.substring(mobile.length, mobile.length - 3);
  var time = agent.parameters.time || new Date();
  var date = agent.parameters.date || new Date();
  var startTime = new Date(date.toString() + " " + time.toString() + "+10:00");
  var endTime = getEndTime(startTime);
  var event = {
    'summary': `${lastName}, ${mobile} books for ${adults} adults and ${children} children`,
    'start': {
      'dateTime': startTime
    },
    'end': {
      'dateTime': endTime
    },
  };

  //Variables for cancellation and updating function
  var userId = lastName + last3Digits.toString();
  var dateRef = date.toString() + "-" + getTimeSlot(startTime);

  //Variables for updating function
  var bookingId = agent.parameters.eventId;
  var bookingDate = agent.parameters.bookingDate || new Date();
  var bookingTime = agent.parameters.bookingTime || new Date(); 
  var startBookingTime = new Date(bookingDate.toString() + " " + bookingTime.toString() + "+10:00");
  var bookingRef = bookingDate.toString() + "-" + getTimeSlot(startBookingTime);
  var endBookingTime = getEndTime(startBookingTime);
  var bookingEvent = {
    'summary': `${lastName}, ${mobile} books for ${adults} adults and ${children} children`,
    'start': {
      'dateTime': startBookingTime
    },
    'end': {
      'dateTime': endBookingTime
    },
  };

  //This function is used for error prevention, if not it will create an event in Google Calendar.
  function createBooking(agent) { 
    var currentTotalGuest = getTotalGuest(dateRef);
    return createEvent(dateRef, userId, currentTotalGuest, event).then(function(value) {
      saveBooking(userId, value, dateRef, currentTotalGuest); 
      agent.add(`${lastName}, mobile number ${mobile} booked for ${adults} adults and ${children} children at ${time} on ${date}. Your booking Id is ${userId}. Please keep this for updating or cancellation.`);
    }).catch(function(err) {
      agent.add(`${err}. Your request cannot be handled. Please try again.`);
    });
  }
  
  //This function takes the event ID and delete the corresponding event in Google Calendar
  function cancelBooking(agent) {
    var currentTotalGuest = getTotalGuest(dateRef);
    return getEventId(dateRef).then(function(value) {
      changeTotalGuest(value.adults, currentTotalGuest, dateRef);
      db.collection(dateRef).doc(bookingId).delete();
      calendar.events.delete({auth: serviceAccountAuth, calendarId: calendarID, eventId: value.eventId});
      agent.add('Your booking has been cancelled!');
    }).catch(function(err) {
        agent.add(`${err}.Your request cannot be handled. Please try again.`);
    });
  }
  
  //This function update the event on request.
  function updateBooking(agent) {
    var oldCurrentTotalGuest = getTotalGuest(bookingRef);
    return getEventId(bookingRef).then(function(value) {
      changeTotalGuest(value.adults, oldCurrentTotalGuest, bookingRef);
      db.collection(bookingRef).doc(bookingId).delete();
      calendar.events.delete({auth: serviceAccountAuth, calendarId: calendarID, eventId: value.eventId});
      var newCurrentTotalGuest = getTotalGuest(dateRef);
      return createEvent(dateRef, bookingId, newCurrentTotalGuest, bookingEvent).then(function(value) {
        saveBooking(bookingId, value, dateRef, newCurrentTotalGuest); 
        agent.add(`You changed your booking to ${adults} adults and ${children} children at ${time} on ${date}. Your booking Id is ${bookingId}. Please keep this for updating or cancellation.`);
      });
    }).catch(function(err) {
      console.error(err);
      agent.add(`${err}. Your request cannot be handled. Please try again.`);
    });
  }
  
  //This function provides the menu on request.
  function menuRequest(agent) {
  	const menuLink = "https://tinyurl.com/y6bvcmzd";
    agent.add('Please click on the following link to see the menu');
    agent.add(menuLink);
  }
	
  //This function return the price of the specific dish on request
  function dishPrice(agent) {
    var priceList = new Map();
    priceList.set('caesar salad', "18$");
    priceList.set('house salad', "18$");
    priceList.set('eggplant parmigiana', "25$");
    priceList.set('chicken parmigiana',"25$");
    priceList.set('chicken noodle soup',"17$");
    priceList.set('margherita',"19$");
    priceList.set('bbq chicken',"19$");
    priceList.set('beef pepperoni',"19$");
    priceList.set('roasted veg',"19$");
    priceList.set('hawaiian',"19$");
    priceList.set('four cheese',"19$");
    priceList.set('ham and mushroom',"19$");
    priceList.set('chicken fettuccine',"24$");
    priceList.set('spaghetti with meatballs',"20$");
    priceList.set('baked macaroni',"20$");
    priceList.set('penne with tomato and basil',"23$");
    priceList.set('prawn pasta',"25$");
    priceList.set('pesto fettuccine',"22$");
    priceList.set('risotto',"24$");
    priceList.set('soft drinks',"6$");
    priceList.set('fresh juice',"6$");
    priceList.set('cocktails',"16$");
    priceList.set('wine',"10$");
    priceList.set('spirits',"10$");
  	var dish = agent.parameters.dish;
    var price = priceList.get(dish.toLowerCase());
    agent.add(`The price of ${dish} is ${price}`);
  }
  
  //This function checks if the booking time is in the opening hours of the restaurant.  
  function isOpen(startTime) {
    let checkedTime = startTime.getHours() + 10;
    return ((checkedTime >= 9 && checkedTime <= 15) || (checkedTime >= 17 && checkedTime <= 21));  
  }
  
  //This function get the end time of the booking
  function getEndTime(time) {
  	if (isLunch(time)) 
      return new Date(new Date(time).setHours(15 - 10));
	  return new Date(new Date(time).setHours(21 - 10));    
  }
  
  //This functions checks whether the booking time is lunch time or dinner time.  
  function isLunch(time) {
    let checkedTime = time.getHours() + 10;
    return checkedTime >= 9 && checkedTime < 15;
  }

  //This function return the name of the time slot
  function getTimeSlot(time) {
    if (isLunch(time)) 
      return "lunch";
    return "dinner";
  }

  //This function get the value of eventId in the firestore
  function getEventId(ref) {
    console.log(bookingId);
    return new Promise((resolve, reject) => {
      db.collection(ref).doc(bookingId).get()
        .then(doc => {
          if(!doc.exists) {
            reject("Invalid booking ID");
          } else {
            resolve(doc.data());
          }
      });
    });
  }
  
  //This function update the total guest after a booking has been cancelled.
  function changeTotalGuest(adults, currentTotalGuest, ref) {
    currentTotalGuest.then(function(value) {
      var newTotalGuest = parseInt(value) - parseInt(adults);
      db.collection(ref).doc("totalGuest").set({totalGuest: newTotalGuest}); 
    });
  }  

  //This function get the value of total guest in the firestore
  function getTotalGuest(ref) {
    return new Promise((resolve) => {
      db.collection(ref).doc("totalGuest").get()
      .then(doc => {
        if (!doc.exists) {
          console.log("No booking at " + ref);
          resolve("0");
        } else {
          console.log("Document: " + doc.data().totalGuest);
          resolve(doc.data().totalGuest.toString());
        }
      });
    });
  }
  
  //This function create event in google calendar
  function createEvent(ref, userId, currentTotalGuest, event) {
    return new Promise((resolve, reject) => {
      db.collection(ref).doc(userId).get().then(doc => {
        if (doc.exists) {
          reject("You have already made a booking");
        } else if (adults < 1) {
          reject('Invalid number of guests. You need to reserve a table for at least one guest');
        } else if (adults > maxGuest) {
          reject(`We only serve ${maxGuest} at a time`);
        } else if (startTime < currentTime) {
          reject('Invalid date. Please make a reservation in near future');
        } else if (!isOpen(startTime)) {
          reject(`We are closed at ${time}. Our opening hours are 10am-3pm for lunch and 5pm-9pm for dinner`);
        } else {
          currentTotalGuest.then(function(value) {
            var newTotalGuest = parseInt(value) + parseInt(adults);
            console.log("New total guest in createEvent ", newTotalGuest);
            //Check if there are enough seats to make a new booking
            if (newTotalGuest > maxGuest) {
              reject("There are not enough seats for your booking");
            } else {
              calendar.events.insert({
                  auth: serviceAccountAuth,
                  calendarId: calendarId,
                  resource: event, 
              }, function(err, response) {
                  if (err) {
                    console.error('There was an error contacting the Calendar service: ' + err);
                    reject(err);
                  } else {
                    var eventId = response.data.id;
                    console.log('Event created: ' + eventId);       
                    resolve(response.data.id); 
                  }
              });
            }
          });
        }
      });
    });
  }

  //This function save the booking data in firestore
  function saveBooking(userId, eventId, ref, currentTotalGuest) {
    var booking = {
      eventId: eventId, 
      adults: adults,
      timestamp: FieldValue.serverTimestamp()
    };
    currentTotalGuest.then(function(value) {
      var newTotalGuest = parseInt(value) + parseInt(adults);
      console.log(newTotalGuest);
      db.collection(ref).doc("totalGuest").set({totalGuest: newTotalGuest});
      db.collection(ref).doc(userId).set(booking);
    });
  }

  //Map the intent with its corresponding function in fulfillment.
  let intentMap = new Map();
  intentMap.set('restaurant.book', createBooking);
  intentMap.set('restaurant.cancellation', cancelBooking);
  intentMap.set('restaurant.update', updateBooking);
  intentMap.set('restaurant.menu', menuRequest);
  intentMap.set('restaurant.dishPrice', dishPrice);
  agent.handleRequest(intentMap);
});  

// Nguyen, 0416533779 book a table for 5 adults and 5 children at 18 tomorrow 
// i want to cancel a booking 
// i want to see the menu
// how much does risotto cost?