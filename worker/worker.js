export default {
  async fetch(request, env) {

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // répondre au preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    if (request.method !== "POST") {
      return new Response("POST only", {
        status: 405,
        headers: corsHeaders
      });
    }

    try {

      const { prompt } = await request.json();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Improve this prompt:\n\n${prompt}`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      const result =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Optimization failed";

      return new Response(JSON.stringify({ result }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });

    } catch (err) {

      return new Response(JSON.stringify({ error: err.toString() }), {
        status: 500,
        headers: corsHeaders
      });

    }
  }
};