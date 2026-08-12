const { json, parseBody, handleOptions, requireMethod } = require("./_shared");

const HELP_SYSTEM_PROMPT = "You are the Campus One Help Assistant, free for all users. Campus One has room-code based access, a CR Board for announcements, a premium AI Notes Summarizer (\u20b920/note pack \u2014 includes summary, quiz, personalized planner), and a notes marketplace. Help users navigate the app, understand features, troubleshoot login/room issues, and answer general questions. If someone asks you to summarize notes or generate a quiz directly here, tell them that's the premium AI Notes Summarizer and point them to it \u2014 don't do it yourself. Keep answers short and direct.";

const FALLBACK_REPLY = "I can help with room codes, the CR Board, notes marketplace, and general navigation. For summarizing notes or generating a quiz, use the premium AI Notes Summarizer \u2014 that's a paid feature, not this chat.";

function fallbackReply(message) {
    const lower = String(message || "").toLowerCase();
    if (lower.includes("summar") || lower.includes("quiz")) {
        return "Summarizing notes and generating quizzes is part of the premium AI Notes Summarizer (\u20b920/note pack). Head to the Notes tab and unlock it there \u2014 I can't generate that here.";
    }
    if (lower.includes("room") || lower.includes("code")) {
        return "Your room code comes from your CR. Enter it on the join screen to see your college's shared notes, announcements, and CR Board.";
    }
    if (lower.includes("cr board") || lower.includes("announce")) {
        return "The CR Board shows announcements posted by your class rep. Only the CR can post; everyone in the room can read.";
    }
    return FALLBACK_REPLY;
}

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) {
        return options;
    }

    const methodError = requireMethod(event);
    if (methodError) {
        return methodError;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const body = parseBody(event);
    const message = String(body.message || "").trim();
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    if (!message) {
        return json(400, { error: "Message required" });
    }

    if (!apiKey) {
        return json(200, { reply: fallbackReply(message) });
    }

    // Free-tier feature: cheap/fast model, tight token cap, no premium budget spent here.
    const contents = [
        ...history
            .filter((turn) => turn && turn.role && turn.content)
            .map((turn) => ({
                role: turn.role === "assistant" ? "model" : "user",
                parts: [{ text: String(turn.content).slice(0, 800) }]
            })),
        { role: "user", parts: [{ text: message.slice(0, 800) }] }
    ];

    try {
        const model = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash-lite";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: HELP_SYSTEM_PROMPT }] },
                    contents,
                    generationConfig: { maxOutputTokens: 220, temperature: 0.6 }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return json(200, { reply: fallbackReply(message) });
        }

        const text = (data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "").trim();
        return json(200, { reply: text || fallbackReply(message) });
    } catch {
        return json(200, { reply: fallbackReply(message) });
    }
};
