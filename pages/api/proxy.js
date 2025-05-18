// Google Gemini API Integration
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Google API key not configured. Please add GOOGLE_API_KEY to environment variables.' });
    }

    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }

        console.log('Making request to Google Gemini API...');
        
        const prompt = `You are an expert writing instructor. Please provide a detailed analysis of the following argumentative text. Structure your feedback into these specific sections:

1. Thesis Development:
- Clarity of main argument
- Strength of position

2. Evidence Usage:
- Quality of supporting evidence
- Integration of examples

3. Logical Flow:
- Organization of ideas
- Transitions between paragraphs

4. Language & Style:
- Clarity of expression
- Academic tone
- Grammar and mechanics

5. Overall Persuasiveness:
- Effectiveness of argumentation
- Impact on reader

Text to analyze:
${text}

Please provide specific examples from the text to support your feedback in each section.`;

        // Using the alternative API endpoint format
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        console.log('API URL:', apiUrl);
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            safetySettings: [{
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_NONE"
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1000,
                topP: 0.8,
                topK: 40
            }
        };

        console.log('Request body structure:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: `Google API error: ${response.status}`,
                details: responseText
            });
        }

        const data = JSON.parse(responseText);
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            console.error('Unexpected API response format:', JSON.stringify(data, null, 2));
            throw new Error('Unexpected API response format');
        }

        return res.status(200).json({
            feedback: data.candidates[0].content.parts[0].text
        });
    } catch (error) {
        console.error('API proxy error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
} 