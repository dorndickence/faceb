// Import required libraries
const express = require('express'); 
const bodyParser = 
require('body-parser'); const request = 
require('request'); const { spawn } = 
require('child_process');
// Initialize the Express App
const app = express();
// Set up body-parser middleware
app.use(bodyParser.urlencoded({ 
extended: false })); 
app.use(bodyParser.json());
// Set up Facebook webhook route
app.get('/webhook', (req, res) => {
  // Verify webhook
  if (req.query['hub.verify_token'] === 
  'YOUR_VERIFY_TOKEN') {
    res.send(req.query['hub.challenge']);
  } else {
    res.send('Invalid verify token');
  }
});
// Handle Facebook webhook events
app.post('/webhook', (req, res) => { 
  const data = req.body;
  // Make sure this is a page 
  // subscription
  if (data.object === 'page') {
    // Iterate over each entry
    data.entry.forEach(entry => { const 
      pageID = entry.id; const 
      timeOfEvent = entry.time;
      // Iterate over each messaging 
      // event
      entry.messaging.forEach(event => 
      {
        if (event.message) { 
          handleMessage(event);
        } else {
          console.log('Webhook received 
          unknown event:', event);
        }
      });
    });
    res.sendStatus(200);
  }
});
// Handle incoming messages
function handleMessage(event) { const 
  senderID = event.sender.id; const 
  messageText = event.message.text; if 
  (messageText.startsWith('!')) {
    const userInput = 
    messageText.slice(1).trim();
    // Perform prediction using your 
    // trained model
    const pythonProcess = 
    spawn('python', 
    ['your_model_script.py', 
    userInput]); 
    pythonProcess.stdout.on('data', 
    (data) => {
      const response = data.toString();
      // Send the prediction result 
      // back to the user
      sendTextMessage(senderID, 
      response);
    });
  }
}
// Send text message to the user
function sendTextMessage(recipientID, 
messageText) {
  request({ uri: 
    'https://graph.facebook.com/v12.0/me/messages', 
    qs: { access_token: 
    'YOUR_FACEBOOK_PAGE_ACCESS_TOKEN' 
    },
    method: 'POST', json: { recipient: 
      { id: recipientID }, message: { 
      text: messageText }
    }
  }, (error, response) => {
    if (error) { console.error('Failed 
      to send message:', error);
    } else if (response.body.error) {
      console.error('Facebook API 
      Error:', response.body.error);
    }
  });
}
// Start the server
app.listen(3000, () => { 
  console.log('Server is running on 
  port 3000');
});

