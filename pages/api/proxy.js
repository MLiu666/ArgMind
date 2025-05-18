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

    if (!process.env.HUGGING_FACE_API_KEY) {
        return res.status(500).json({ error: 'Hugging Face API key not configured' });
    }

    try {
        const { model, payload } = req.body;

        if (!model || !payload) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Hugging Face API error:', error);
            return res.status(response.status).json({ 
                error: `Hugging Face API error: ${response.status}`,
                details: error
            });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('API proxy error:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
} 