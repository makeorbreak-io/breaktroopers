require('dotenv').config();

// Initialize using verification token from environment variables
const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);
const port = process.env.PORT || 3000;

// Initialize an Express application
const express = require('express');
const bodyParser = require('body-parser');
const { WebClient } = require('@slack/client');
const app = express();

const web = new WebClient(process.env.SLACK_BOT_TOKEN);

// You must use a body parser for JSON before mounting the adapter
app.use(bodyParser.json());

app.post('/', (req, res) => {
  if(req.body.challenge) {
    res.send({challenge : req.body.challenge});
    return;
  }
});


// Mount the event handler on a route
// NOTE: you must mount to a path that matches the Request URL that was configured earlier
app.use('/slack/events', slackEvents.expressMiddleware());

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event)=> {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// See: https://api.slack.com/methods/chat.postMessage
web.chat.postMessage({ channel: "CA6DX1HQD", text: "Hello World!" });

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`);
});