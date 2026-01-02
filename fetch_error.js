const https = require('https');

https.get('https://gold-rush-2025.web.app/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Response Body:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Body:', data);
        }
    });
}).on('error', (err) => {
    console.error("Error:", err.message);
});
