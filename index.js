const express = require("express");
const app = express();
const port = 3000;
const convert = require("xml-js");
const fetch = require("node-fetch");
const feed = require("rss-to-json");
const filter = require("./filterDocument.js");
let flaggedItems = [];
let accidentItems = [];
let fireItems = [];
const PORT = process.env.PORT;

app.get("/", (req, res) => res.render("index.ejs"));

app.get("/test1", (req, res) => res.send("Hello test world!"));

app.get("/type/all", (req, res) => res.json(flaggedItems));

app.get("/type/fires", (req, res) => res.json(fireItems));

app.get("/type/accidents", (req, res) => res.json(accidentItems));

app.listen(PORT, () => console.log(`Example app listening on port ${port}!`));

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
helsingborgRss();

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
policeEvent("https://polisen.se/api/events?&DateTime=" + getTodaysDate());

function getTodaysDate() {
  return new Date().toISOString().slice(0, 10);
}

function hdRss() {
  feed.load("https://www.hd.se/rss.xml?latest=x", function(err, rss) {
    let items = rss.items;
    for (let item of items) {
      let typeOfItem = filter(item.content_encoded);
      if (typeOfItem != null) {
        jsonItem = {
          type: typeOfItem,
          title: item.content_encoded,
          lat: 56.0442, // Placeholder
          lng: 12.7041, // Placeholder
          time: item.pubDate,
          source: "HD RSS",
          url: item.link
        };
        addToTypeArray(jsonItem);
      }
    }
  });
}
hdRss();

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
p4Malmöhus();

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
