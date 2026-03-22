const http = require('http');

const data = JSON.stringify({
  cropType: 'Rice',
  imageBase64: 'data:image/jpeg;base64,L3RtcC90ZXN0'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/disease-detect',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'x-language': 'en'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Response Body:');
    console.log(body.substring(0, 500)); // Show beginning of body
    if (body.startsWith('<!DOCTYPE')) {
        console.log('--- ERROR: RECEIVED HTML INSTEAD OF JSON ---');
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
