const fetch = require('node-fetch');

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_ID = process.env.model_id; // e.g. meta-llama/Meta-Llama-3-8B-Instruct

/**
 * Sends a chat completion request to a Llama-3 Instruct model via HF Inference Router.
 * Uses the OpenAI-compatible /v1/chat/completions endpoint.
 */
const generateItineraryFromLlama = async (userData) => {
    const { destination, budget, duration, dietary, allergies, request } = userData;

    const systemPrompt = `You are an expert travel planner. When given a travel request, you MUST respond with ONLY a valid JSON object, no markdown, no explanation. The JSON must follow this exact structure:
{
  "tripName": "string",
  "duration": "string",
  "budget": "string",
  "dailyPlan": [
    { "activity": "string", "food": "string" }
  ],
  "tips": ["string"]
}`;

    const userMessage = `Plan a ${duration} trip to ${destination} with a budget of ${budget || 'flexible'}.
Dietary preference: ${dietary}.
Allergies: ${allergies || 'none'}.
Special requests: ${request || 'general sightseeing'}.

Respond with ONLY the JSON object.`;

    try {
        const response = await fetch(
            `https://router.huggingface.co/v1/chat/completions`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 1500,
                    temperature: 0.7,
                    stream: false
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error(`HF API returned HTTP ${response.status}:`, errText);

            if (response.status === 404) {
                throw new Error(`HF_API_ERROR: Model '${MODEL_ID}' not found (404). Make sure you have been granted access at huggingface.co/${MODEL_ID}`);
            }
            if (response.status === 401) {
                throw new Error(`HF_API_ERROR: Unauthorized (401). Your HF_TOKEN is invalid or missing.`);
            }
            if (response.status === 403) {
                throw new Error(`HF_API_ERROR: Forbidden (403). Your token does not have access to this model. Visit huggingface.co/${MODEL_ID} and request access.`);
            }
            throw new Error(`HF_API_ERROR: HTTP ${response.status} - ${errText}`);
        }

        const result = await response.json();

        if (result.error) {
            if (result.error.toLowerCase().includes('loading')) {
                return { error: 'MODEL_WAKING_UP', msg: 'The AI model is warming up. Please try again in ~30 seconds.' };
            }
            console.error('HF API error body:', result.error);
            throw new Error(`HF_API_ERROR: ${result.error}`);
        }

        // Chat completion response: { choices: [{ message: { content: '...' } }] }
        const rawOutput = result?.choices?.[0]?.message?.content;

        if (!rawOutput) {
            console.error('Unexpected HF response format:', JSON.stringify(result));
            throw new Error('UNEXPECTED_RESPONSE_FORMAT');
        }

        // Strip any markdown fences the model might add (```json ... ```)
        const stripped = rawOutput.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

        // Extract the JSON object from the cleaned output
        const jsonStart = stripped.indexOf('{');
        const jsonEnd = stripped.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
            console.error('No JSON found in model output:', rawOutput);
            throw new Error('INVALID_JSON_OUTPUT');
        }

        const cleanJson = stripped.substring(jsonStart, jsonEnd);
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error('Llama Service Error:', error.message || error);
        throw new Error(error.message || 'AI_GENERATION_FAILED');
    }
};

module.exports = { generateItineraryFromLlama };