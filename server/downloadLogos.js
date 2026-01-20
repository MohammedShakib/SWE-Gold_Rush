const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(dest));
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const logos = [
    { name: 'visa.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
    { name: 'mastercard.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
    { name: 'amex.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' },
    { name: 'bkash.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Bkash_logo_2022.png/800px-Bkash_logo_2022.png' },
    { name: 'nagad.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Nagad_Logo.png/800px-Nagad_Logo.png' },
    { name: 'rocket.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Rocket_Mobile_Banking_Logo.svg' },
    { name: 'dbbl.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Dutch-Bangla_Bank_Limited_Logo.svg' }
];

const destDir = path.resolve('..', 'client', 'public', 'icons');

// Ensure directory exists (recursive creation)
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

console.log(`Downloading logos to: ${destDir}`);

const downloadAll = async () => {
    for (const logo of logos) {
        try {
            const destPath = path.join(destDir, logo.name);
            await downloadFile(logo.url, destPath);
            console.log(`✅ Downloaded: ${logo.name}`);
        } catch (err) {
            console.error(`❌ Failed to download ${logo.name}:`, err.message);
        }
    }
};

downloadAll();
