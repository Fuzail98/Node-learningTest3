require('dotenv').config();
const express = require('express');
const dns = require('dns');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urlDatabase = {};
let urlCounter = 1; 

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const urlPattern = /^(https?:\/\/(www\.)?|localhost:3000\/).+/;
  console.log(req.body.url)
  if(!req.body.url || req.body == undefined || !urlPattern.test(req.body.url)) {
    return res.json({error: "invalid url"})
  }
  const originalUrl = req.body.url
  console.log(originalUrl, ">>>>>>>>>>")

  const hostname = new URL(originalUrl).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = urlCounter;
    urlDatabase[shortUrl] = originalUrl;
    urlCounter++;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = req.params.short_url;

  // Look up the short URL in the in-memory database
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    // Redirect to the original URL if found
    return res.redirect(originalUrl);
  } else {
    // Return an error if the short URL is not found
    return res.json({ error: 'No short URL found for the given input' });
  }
});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
