const http = require('http');

const data = JSON.stringify({ message: 'test' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chatbot',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('--- RESPONSE ---');
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    console.log(`Body: ${body}`);
  });
});

req.on('error', (error) => {
  console.error('--- ERROR ---');
  console.error(error);
});

req.write(data);
req.end();
