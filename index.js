const express = require('express')
const app = express()
const port = 3000
const convert = require('xml-js')
const fetch = require("node-fetch");
const feed = require('rss-to-json');
const natural = require("natural");
const tokenizer = new natural.AggressiveTokenizerSv();
const filters = ["brinner", "brand", "skogsbrand", "eld", "eldssvåda"];
let items = {}
let flaggedItems = []


app.get('/', (req, res) => res.render('index.ejs'))

app.get('/test1', (req, res) => res.send('Hello test world!'))


app.get('/type/fires', (req, res) => 
    res.json(flaggedItems))



app.listen(port, () => console.log(`Example app listening on port ${port}!`))

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


/*
feed.load('https://api.helsingborg.se/alarm/alarms/feed/', function(err, rss){
    items = rss.items
    for(let item of items) {
        if (filterDocument(item.title)) {
            jsonItem = createJSONItem(item.title, item.description, "fire", "location");
            flaggedItems.push(jsonItem);
        }
    }
    console.log(flaggedItems)
    
});
*/

function helsingborgrss(){
    feed.load('https://api.helsingborg.se/alarm/alarms/feed/', function(err, rss){
    items = rss.items
    for(let item of items) {
        if (filterDocument(item.title)) {
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
    console.log(flaggedItems) 
});
}
helsingborgrss();

function filterDocument(documentDescription) {
    const documentLowerCase = documentDescription.toLowerCase();
    const tokens = tokenizer.tokenize(documentDescription);
    for(let filter of filters) {
        if (documentLowerCase.includes(filter)) {
            return true;
        }
    }
    return false;
}


    // https://api.helsingborg.se/alarm/alarms/feed/