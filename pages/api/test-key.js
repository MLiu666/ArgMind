// Test endpoint for Google Gemini API key
export default async function handler(req, res) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not found' });
    }

    try {
        // Simple test request to Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: "Hello, please respond with 'API key is working!'"
                        }]
                    }]
                })
            }
        );

        const responseText = await response.text();
        console.log('API Response:', responseText);

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'API key validation failed',
                status: response.status,
                details: responseText
            });
        }

        return res.status(200).json({
            message: 'API key is valid',
            details: JSON.parse(responseText)
        });
    } catch (error) {
        console.error('Test error:', error);
        return res.status(500).json({
            error: 'Test failed',
            details: error.message
        });
    }
} 