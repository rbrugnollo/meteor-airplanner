import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorize } from '../methods/authorize';

WebApp.connectHandlers.use('/api/flights/authorize', (req, res) => {
  // Check if it's a POST request
  if (req.method === 'POST') {
    let body = '';
    req.on(
      'data',
      Meteor.bindEnvironment((data) => (body += data)),
    );
    req.on(
      'end',
      Meteor.bindEnvironment(() => {
        try {
          const { userId, flightId } = JSON.parse(body);
          // Call the Meteor method
          authorize({ userId, flightId, authorized: true })
            .then(() => {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end();
            })
            .catch((error) => {
              console.log(error);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Error calling Meteor method' }));
            });
        } catch (parseError) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      }),
    );
  } else {
    // Respond with a 405 Method Not Allowed for non-POST requests
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }
});
