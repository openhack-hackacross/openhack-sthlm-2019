const express = require('express')
const app = express()
const port = 3000
const convert = require('xml-js')
const fetch = require("node-fetch");
const feed = require('rss-to-json');
const filter = require('./filterDocument.js');
let flaggedItems = []


app.get('/', (req, res) => res.render('index.ejs'))

app.get('/test1', (req, res) => res.send('Hello test world!'))


app.get('/type/fires', (req, res) => 
    res.json(flaggedItems))



app.listen(port, "0.0.0.0", () => console.log(`Example app listening on port ${port}!`))

function fetchData(url) {
fetch(url) // Call the fetch function passing the url of the API as a parameter
.then((res) => res.json())
.then(function(data) {
    console.log(data.name)
    // Your code for handling the data you get from the API
})
.catch(function() {
    // This is where you run code if the server returns any errors
});
}



function helsingborgRss(){
    feed.load('https://api.helsingborg.se/alarm/alarms/feed/', function(err, rss){
    let items = rss.items
    for(let item of items) {
        if (filter(item.title)) {
            jsonItem = {
                type: 'fire',
                title: item.title,
                lat: 56.0442,
                long: 12.7041,
                time: item.pubDate,
                source: 'Helsingborg Alarm RSS',
                url: item.url
            }
            flaggedItems.push(jsonItem);
        }
    }
});
}
 helsingborgRss();

function policeEvent(url) {
    fetch(url) // Call the fetch function passing the url of the API as a parameter
    .then((res) => res.json())
    .then(function(data) {
        for(let item of data) {
            if (filter(item.summary)) {
                let gps = item.location.gps.split(',')
                jsonItem = {
                    type: 'fire',
                    title: item.summary,
                    lat: parseFloat(gps[0]),
                    long: parseFloat(gps[1]),
                    time: item.datetime,
                    source: 'Polisens händelser',
                    url: item.url
                }
                flaggedItems.push(jsonItem);
            }

        }
    })
    .catch(function() {
        // This is where you run code if the server returns any errors
    });
    }
    policeEvent('https://polisen.se/api/events?&DateTime='+getTodaysDate())

    function getTodaysDate() {
        return new Date().toISOString().slice(0,10);
    }
