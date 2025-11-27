import { GEMINI_API_KEY, GEMINI_API_URL } from './constants/api';

async function testGeminiApi() {
    console.log('Testing Gemini API...');
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }],
            }),
        });

        if (response.ok) {
            console.log('Gemini API Key is valid!');
            const data = await response.json();
            console.log('Response:', data.candidates[0].content.parts[0].text);
        } else {
            console.error('Gemini API check failed:', response.status, response.statusText);
            const errorData = await response.json();
            console.error('Error details:', errorData);
        }
    } catch (error) {
        console.error('Error testing Gemini API:', error);
    }
}

testGeminiApi();
