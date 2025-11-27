import { GEMINI_API_KEY } from './constants/api';

const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
];

async function testModel(model: string) {
    console.log(`Testing model: ${model}...`);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }],
            }),
        });

        console.log(`Model ${model} status: ${response.status}`);
        if (response.ok) {
            console.log(`SUCCESS: ${model} works!`);
            const data = await response.json();
            console.log('Response snippet:', data.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 50));
        } else {
            console.log(`FAILURE: ${model} failed.`);
            const errorData = await response.json();
            console.error('Error details:', JSON.stringify(errorData, null, 2));
        }
    } catch (error) {
        console.error(`Error testing ${model}:`, error);
    }
    console.log('---');
}

async function runTests() {
    for (const model of models) {
        await testModel(model);
    }
}

runTests();
