const { json, parseBody, handleOptions, requireMethod } = require("./_shared");

// Fallback used when ANTHROPIC_API_KEY is missing or the Claude call fails.
// Builds a plausible schedule from whatever topics and day-text were provided,
// so the feature still feels personal offline instead of returning boilerplate.
function fallbackPlan(topics, dayText) {
    const cleanTopics = Array.isArray(topics) && topics.length
        ? topics
        : [{ name: "Revision", priority: "revision" }];

    const highPriority = cleanTopics.filter((topic) => topic.priority === "high weightage");
    const ordered = [...highPriority, ...cleanTopics.filter((topic) => !highPriority.includes(topic))];

    const mentionsEvening = /evening|night|after \d|late/i.test(dayText || "");
    const mentionsMorning = /morning|early|before college|before class/i.test(dayText || "");
    const mentionsBusy = /busy|packed|no time|exam|lab|practical/i.test(dayText || "");

    const slots = [];
    if (mentionsMorning) {
        slots.push({ time_block: "Before college", topic: ordered[0] });
    }
    slots.push({ time_block: mentionsBusy ? "Shortest free gap" : "First free hour", topic: ordered[0] || ordered[1] });
    slots.push({ time_block: "Lunch break / gap between classes", topic: ordered[1] || ordered[0] });
    slots.push({ time_block: mentionsEvening ? "Late evening, low energy" : "Evening after classes", topic: ordered[2] || ordered[0] });

    const personalized_plan = slots
        .filter((slot) => slot.topic)
        .map((slot) => ({
            time_block: slot.time_block,
            activity: `Revise ${slot.topic.name}`,
            reason: slot.topic.priority === "high weightage"
                ? `${slot.topic.name} is high weightage, so it gets your best energy slot.`
                : slot.topic.priority === "needs practice"
                    ? `${slot.topic.name} needs practice, so a shorter, focused block works well here.`
                    : `${slot.topic.name} only needs a quick revision pass right now.`
        }));

    return {
        personalized_plan: personalized_plan.length ? personalized_plan : [
            { time_block: "Whenever you're free today", activity: `Revise ${ordered[0]?.name || "your notes"}`, reason: "No specific free time was mentioned, so this fits anywhere in your day." }
        ],
        note: mentionsBusy
            ? "Your day sounds packed — even 15-20 minutes on the high-weightage topic beats skipping it."
            : "Stick to short, focused blocks instead of one long session."
    };
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
    const topics = Array.isArray(body.topics) ? body.topics : [];
    const dayText = String(body.dayText || "").trim();
    const fallback = fallbackPlan(topics, dayText);

    if (!apiKey) {
        return json(200, fallback);
    }

    if (!dayText) {
        return json(200, { personalized_plan: [], note: "Tell us about your day first so the plan can fit around it." });
    }

    const prompt = `You are a study planner. You have two inputs: (1) topics with priority levels from a note summary, and (2) a student's free-text description of their day and energy patterns. Build a realistic study schedule that fits INTO their actual day — don't ignore their stated commitments. Return ONLY valid JSON:
{ "personalized_plan": [{ "time_block": "...", "activity": "...", "reason": "..." }], "note": "one short practical line, no generic motivational fluff" }

Topics with priority: ${JSON.stringify(topics)}
Student's day description: ${dayText}`;

    try {
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 1400, temperature: 0.7 }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return json(200, fallback);
        }

        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
        const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
        const jsonSlice = cleaned.slice(cleaned.indexOf("{"), cleaned.lastIndexOf("}") + 1);
        const parsed = JSON.parse(jsonSlice);

        const plan = Array.isArray(parsed.personalized_plan) ? parsed.personalized_plan : fallback.personalized_plan;

        return json(200, {
            personalized_plan: plan.length ? plan : fallback.personalized_plan,
            note: String(parsed.note || fallback.note).trim()
        });
    } catch {
        return json(200, fallback);
    }
};
