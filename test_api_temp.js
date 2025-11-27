const GEMINI_API_KEY = "AIzaSyC0KuddyiTw488GVpTXlPN_J9G1ylY9vo8";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

async function testApiKey() {
    console.log('Testing Gemini API Key...');
    try {
        const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }],
            }),
        });

        if (response.ok) {
            console.log('API Key is valid!');
            const data = await response.json();
            console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        } else {
            console.error('API Key check failed:', response.status, response.statusText);
            const errorData = await response.json();
            console.error('Error details:', errorData);
        }
    } catch (error) {
        console.error('Error testing API key:', error);
    }
}

testApiKey();
