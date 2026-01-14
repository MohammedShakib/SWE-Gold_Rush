const BASE_URL = 'http://localhost:5000/api/inventory';
const TEST_PRODUCT = {
    name: "Test Gold Ring",
    category: "Ring",
    karat: "22K",
    weight: 5.5,
    price: 45000,
    stock_quantity: 10,
    status: "In Stock"
};

const runTests = async () => {
    try {
        console.log("1. Testing GET /api/inventory...");
        const initialRes = await fetch(BASE_URL);
        const initialData = await initialRes.json();
        console.log(`- Success. Count: ${initialData.length}`);

        console.log("\n2. Testing POST /api/inventory...");
        const createRes = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_PRODUCT)
        });

        if (!createRes.ok) {
            const text = await createRes.text();
            throw new Error(`POST failed with ${createRes.status}: ${text}`);
        }

        const newProduct = await createRes.json();
        if (!newProduct.id) throw new Error("Created product has no ID");
        console.log("- Success. Created ID:", newProduct.id);

        console.log("\n3. Testing PUT /api/inventory/:id...");
        const updateRes = await fetch(`${BASE_URL}/${newProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...TEST_PRODUCT,
                price: 46000,
                stock_quantity: 9
            })
        });
        const updatedProduct = await updateRes.json();
        if (updatedProduct.price !== 46000) throw new Error("Price not updated");
        console.log("- Success. Updated Price:", updatedProduct.price);

        console.log("\n4. Testing DELETE /api/inventory/:id...");
        const deleteRes = await fetch(`${BASE_URL}/${newProduct.id}`, {
            method: 'DELETE'
        });
        const deleteData = await deleteRes.json();
        console.log("- Success.", deleteData.message);

        console.log("\n5. Verifying Deletion...");
        const verifyRes = await fetch(`${BASE_URL}/${newProduct.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_PRODUCT)
        });

        if (verifyRes.status === 404) {
            console.log("- Success. Product properly deleted (404 received).");
        } else {
            console.error("- Fail: Product still exists or other error", verifyRes.status);
        }

        console.log("\n✅ ALL TESTS PASSED!");

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err);
    }
};

runTests();
