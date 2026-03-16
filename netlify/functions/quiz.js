exports.handler = async function(event) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // CORS headers — allow your Netlify site to call this function
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };

    try {
        const { course, difficulty, num } = JSON.parse(event.body);

        // Validate inputs
        if (!course || !difficulty || !num) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        const prompt = `You are an expert IT certification instructor creating practice exam questions for students studying ${course}.

Generate exactly ${num} multiple-choice questions at ${difficulty} difficulty level.

STRICT RULES:
- Each question must have exactly 4 answer options labeled A, B, C, D
- Only ONE correct answer per question
- Questions must be realistic and relevant to actual ${course} certification exams
- Include a mix of conceptual, scenario-based, and command/syntax questions
- Explanations must be thorough — explain WHY the answer is correct AND why the others are wrong

Respond ONLY with a valid JSON array. No markdown, no backticks, no preamble. Example format:
[
  {
    "question": "Which command displays all IP configuration details on Windows?",
    "options": ["ipconfig", "ipconfig /all", "netstat -an", "ping localhost"],
    "correct": 1,
    "explanation": "ipconfig /all displays full IP configuration including MAC address, DNS servers, and DHCP info. Plain ipconfig only shows IP, subnet, and gateway.",
    "topic": "Network Commands",
    "difficulty": "easy"
  }
]

correct is the 0-based index of the correct option.
Generate ${num} questions now for ${course}:`;

        // Call Claude API using the environment variable — key never exposed to browser
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY,   // Loaded from Netlify env var
                "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 8000,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            return {
                statusCode: response.status,
                headers,
                body: JSON.stringify({ error: err.error?.message || "API error" })
            };
        }

        const data = await response.json();
        const raw = data.content[0].text.trim();
        const clean = raw
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        // Validate it's real JSON before sending back
        JSON.parse(clean);

        return { statusCode: 200, headers, body: clean };

    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message || "Server error" })
        };
    }
};