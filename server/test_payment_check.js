const start = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/payment/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Empty body
        });

        if (response.status === 404) {
            console.log("RESULT: SERVER_NOT_UPDATED");
        } else {
            console.log(`RESULT: SERVER_UPDATED (Status: ${response.status})`);
        }
    } catch (e) {
        console.log("RESULT: ERROR_CONNECTING", e.message);
    }
};

start();
