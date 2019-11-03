const express = require("express");
const app = express();
const convert = require("xml-js");
const fetch = require("node-fetch");
const feed = require("rss-to-json");
const filter = require("./filterDocument.js");
let flaggedItems = [];
let accidentItems = [];
let fireItems = [];
//const PORT = 3000;                // Port for localhost
const PORT = process.env.PORT; // Port for heroku

app.get("/", (req, res) => res.render("index.ejs"));
app.get("/type/all", (req, res) => res.json(flaggedItems));
app.get("/type/fires", (req, res) => res.json(fireItems));
app.get("/type/accidents", (req, res) => res.json(accidentItems));

// Set port for localhost to run locally :)
app.listen(PORT, () => console.log("Now up at " + PORT));

/**
 * Template for fetching API/JSON data
 * @param {*} url Url to API
 */
function fetchData(url) {
  fetch(url) // Call the fetch function passing the url of the API as a parameter
    .then(res => res.json())
    .then(function(data) {
      console.log(data.name);
      // Your code for handling the data you get from the API
    })
    .catch(function() {
      // This is where you run code if the server returns any errors
    });
}

/**
 * Fetches rss data from Helsingborgs larm rss, and creates a json object
 * lat & lng are currently using placeholder data for Helsingborg
 */
function helsingborgRss() {
  feed.load("https://api.helsingborg.se/alarm/alarms/feed/", function(
    err,
    rss
  ) {
    let items = rss.items;
    for (let item of items) {
      let typeOfItem = filter(item.title);
      if (typeOfItem != null) {
        jsonItem = {
          type: typeOfItem,
          title: item.title,
          lat: 56.0442,
          lng: 12.7041,
          time: item.pubDate,
          source: "Helsingborg Alarm RSS",
          url: item.url
        };
        addToTypeArray(jsonItem);
      }
    }
  });
}

/**
 * Fetches JSON data from Polisens händelser api, and creates a json object
 */
function policeEvent(url) {
  fetch(url) // Call the fetch function passing the url of the API as a parameter
    .then(res => res.json())
    .then(function(data) {
      for (let item of data) {
        let typeOfItem = filter(item.summary);
        if (typeOfItem != null) {
          let gps = item.location.gps.split(",");
          jsonItem = {
            type: typeOfItem,
            title: item.summary,
            lat: parseFloat(gps[0]),
            lng: parseFloat(gps[1]),
            time: item.datetime,
            source: "Polisens händelser",
            url: item.url
          };
          addToTypeArray(jsonItem);
        }
      }
    })
    .catch(function() {
      // This is where you run code if the server returns any errors
    });
}

/**
 * Fetches rss data from Helsingborgs dagblad rss, and creates a json object
 * lat & lng are currently using placeholder data for Helsingborg
 */
function hdRss() {
  feed.load("https://www.hd.se/rss.xml?latest=x", function(err, rss) {
    let items = rss.items;
    for (let item of items) {
      let typeOfItem = filter(item.content_encoded);
      if (typeOfItem != null) {
        jsonItem = {
          type: typeOfItem,
          title: item.content_encoded,
          lat: 56.0442, // Placeholder Helsingborg
          lng: 12.7041, // Placeholder Helsingborg
          time: item.pubDate,
          source: "HD RSS",
          url: item.link
        };
        addToTypeArray(jsonItem);
      }
    }
  });
}

/**
 * Fetches rss data from p4Malmöhus, and creates a json object
 * lat & lng are currently using placeholder data for Malmö
 */
function p4Malmöhus() {
  feed.load("https://api.sr.se/api/rss/channel/96?format=1", function(
    err,
    rss
  ) {
    let items = rss.items;
    for (let item of items) {
      let typeOfItem = filter(item.title + " " + item.description);
      if (typeOfItem != null) {
        jsonItem = {
          type: typeOfItem,
          title: item.title + " " + item.description,
          lat: 55.60331, // Placeholder Malmö
          lng: 13.00131, // Placeholder Malmö
          time: item.pubDate,
          source: "P4 Malmöhus",
          url: item.link
        };
        addToTypeArray(jsonItem);
      }
    }
  });
}

/**
 * Gets todays date, format yyyy-mm-dd
 */
function getTodaysDate() {
  return new Date().toISOString().slice(0, 10);
}

function emptyAllArrays() {
    flaggedItems.length = 0;
    accidentItems.length = 0;
    fireItems.length = 0;
}

/**
 * Takes an json object and adds it to an array, depending on its type.
 * @param {*} jsonItem to be added to array
 */
function addToTypeArray(jsonItem) {
  flaggedItems.push(jsonItem);
  switch (jsonItem.type) {
    case "fire":
      fireItems.push(jsonItem);
      break;
    case "accident":
      accidentItems.push(jsonItem);
  }
}

policeEvent("https://polisen.se/api/events?&DateTime=" + getTodaysDate());
helsingborgRss();
p4Malmöhus();
hdRss();

setTimeout(function(){ 
    emptyAllArrays();
    policeEvent("https://polisen.se/api/events?&DateTime=" + getTodaysDate());
    helsingborgRss();
    p4Malmöhus();
    hdRss();
}, 30000);

