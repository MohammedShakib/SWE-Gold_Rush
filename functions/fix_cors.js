const admin = require('firebase-admin');

// Initialize with default credentials
// This relies on the environment having credentials (e.g. gcloud auth application-default login)
// or being in a Google Cloud environment.
try {
    admin.initializeApp({
        projectId: 'gold-rush-2025',
        storageBucket: 'gold-rush-2025.firebasestorage.app'
    });
} catch (e) {
    // Already initialized?
    if (!admin.apps.length) console.error("Init Error:", e);
}

const bucket = admin.storage().bucket('gold-rush-2025.firebasestorage.app');

async function setCors() {
    console.log("Setting CORS configuration...");
    try {
        const corsConfiguration = [
            {
                origin: ["http://localhost:5173", "http://localhost:5000", "http://127.0.0.1:5173", "https://gold-rush-2025.web.app", "https://gold-rush-2025.firebaseapp.com"],
                method: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
                responseHeader: ["Authorization", "Content-Type", "x-goog-resumable", "x-firebase-storage-version"],
                maxAgeSeconds: 3600
            }
        ];

        await bucket.setCorsConfiguration(corsConfiguration);
        console.log("SUCCESS: CORS configuration updated successfully!");
    } catch (error) {
        console.error("FAILURE: Error setting CORS:", error);
        console.log("------------------------------------------");
        console.log("Troubleshooting:");
        console.log("1. Ensure you have run 'gcloud auth application-default login' if running locally.");
        console.log("2. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable.");
    }
}

setCors();
