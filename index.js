const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => res.render('index.ejs'))

app.get('/test1', (req, res) => res.send('Hello test world!'))

app.get('/type/fires', (req, res) => 
    res.json({type: 'fire', description: 'placeholder', source: 'source', link: 'url here', location: {
        long: 59.3258414,
        lat:  17.70188
    }
    }))



app.listen(port, () => console.log(`Example app listening on port ${port}!`))