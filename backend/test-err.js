const fs = require('fs');
const http = require('http');

http.get('http://localhost:5000/api/requests/6abde4e8bcf077f9a6e70df2/send-quotation', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', data));
});
