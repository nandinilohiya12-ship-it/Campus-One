const { json, parseBody, handleOptions, requireMethod } = require("./_shared");

const STOP_WORDS = new Set("about above after again against also because before being between could every first from have into more most only other should their there these those through under using very which while with without your this that they them then than will were what when where".split(" "));

function normalizeStudyText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
}

function splitStudySentences(text) {
    return normalizeStudyText(text)
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 28)
        .slice(0, 60);
}

function titleCase(value) {
    return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractStudyKeywords(text, subject) {
    const counts = new Map();
    normalizeStudyText(`${subject || ""} ${text || ""}`).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g)?.forEach((word) => {
        if (STOP_WORDS.has(word)) {
            return;
        }
        counts.set(word, (counts.get(word) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => titleCase(word));
}

function scoreSentence(sentence, keywords) {
    const lower = sentence.toLowerCase();
    return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 3 : 0), 0) + Math.min(sentence.length / 80, 3);
}

const IMPORTANCE_CYCLE = ["high", "high", "medium", "medium", "medium", "low", "low", "low"];
const PRIORITY_CYCLE = ["high weightage", "needs practice", "revision"];

// Content-aware fallback used when ANTHROPIC_API_KEY is missing or the Claude call fails.
// This is NOT AI-generated — it's extractive (keyword/sentence scoring) — but it always
// reflects the student's actual pasted/extracted text instead of returning static boilerplate.
function fallbackOutput(title, subject, content, fileName) {
    const cleanTitle = title || "Uploaded notes";
    const cleanSubject = subject || "the subject";
    const sourceText = normalizeStudyText(content);
    const hasContent = sourceText.length > 40;
    const sentences = splitStudySentences(sourceText);
    const keywords = extractStudyKeywords(sourceText, cleanSubject);
    const flowKeywords = keywords.length ? keywords : [cleanSubject, "Definitions", "Examples", "Formulas"];

    const ranked = hasContent && sentences.length
        ? sentences.slice().sort((a, b) => scoreSentence(b, keywords) - scoreSentence(a, keywords))
        : [];

    const summary_points = [];
    for (let index = 0; index < 8; index += 1) {
        const sentence = ranked[index];
        const point = sentence
            ? (sentence.length > 190 ? `${sentence.slice(0, 187)}...` : sentence)
            : `${cleanTitle} highlights ${flowKeywords[index % flowKeywords.length]} as an important exam topic${hasContent ? "" : ` in ${cleanSubject}`}.`;
        summary_points.push({ point, importance: IMPORTANCE_CYCLE[index] });
    }

    const study_plan = [1, 2, 3, 4, 5].map((day) => {
        const focusWord = flowKeywords[(day - 1) % flowKeywords.length];
        return {
            day,
            focus: day === 1 ? `First read-through of ${cleanTitle}` : day === 5 ? "Timed revision test" : `Deep-dive: ${focusWord}`,
            tasks: day === 5
                ? ["Attempt a timed self-test", "Fix every wrong answer"]
                : [`Revise ${focusWord} with short handwritten notes`, "Solve 2-3 practice questions"],
            est_minutes: day === 1 ? 30 : day === 5 ? 60 : 45
        };
    });

    const key_dates = [
        { date: "Day 2", description: `Finish first revision pass of ${cleanTitle}.` },
        { date: "Day 4", description: "Complete weak-topic revision." },
        { date: "Day 5", description: "Finish timed practice test." }
    ];

    const topics = flowKeywords.slice(0, 6).map((name, index) => ({
        name,
        priority: PRIORITY_CYCLE[index % PRIORITY_CYCLE.length]
    }));

    return { summary_points, study_plan, key_dates, topics };
}

function coerceImportance(value) {
    const lower = String(value || "").toLowerCase();
    return ["high", "medium", "low"].includes(lower) ? lower : "medium";
}

function coercePriority(value) {
    const lower = String(value || "").toLowerCase();
    return ["high weightage", "revision", "needs practice"].includes(lower) ? lower : "revision";
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
    const fallback = fallbackOutput(body.title, body.subject, body.content, body.fileName);

    if (!apiKey) {
        return json(200, fallback);
    }

    const hasRealContent = Boolean((body.content || "").trim().length > 40);

    const systemPrompt = `You are an academic note summarizer for Indian engineering/college students. Given raw notes, return ONLY valid JSON, no markdown, no preamble, in this exact shape:
{
 "summary_points": [{ "point": "...", "importance": "high|medium|low" }], // exactly 8 items
 "study_plan": [{ "day": 1, "focus": "...", "tasks": ["...","..."], "est_minutes": 45 }],
 "key_dates": [{ "date": "...", "description": "..." }],
 "topics": [{ "name": "...", "priority": "high weightage|revision|needs practice" }]
}
Be specific and concrete — no generic filler. Base every field strictly on the provided notes.`;

    const userPrompt = `${hasRealContent ? "" : "The notes text below is thin or missing (likely a non-text file format). Build the best possible pack from the title, subject, and file name, and keep topics honestly generic in that case rather than inventing fake specifics.\n\n"}Title: ${body.title || "Uploaded notes"}
Subject: ${body.subject || "General"}
File name: ${body.fileName || ""}
Notes text: ${body.content || "No extracted text was available for this file."}`;

    try {
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: { maxOutputTokens: 2600, temperature: 0.7 }
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

        const summary_points = Array.isArray(parsed.summary_points) && parsed.summary_points.length
            ? parsed.summary_points.slice(0, 8).map((item, index) => ({
                point: String(item?.point || fallback.summary_points[index]?.point || "").trim(),
                importance: coerceImportance(item?.importance)
            }))
            : fallback.summary_points;

        const study_plan = Array.isArray(parsed.study_plan) && parsed.study_plan.length
            ? parsed.study_plan.map((item, index) => ({
                day: Number.isInteger(item?.day) ? item.day : index + 1,
                focus: String(item?.focus || "").trim() || fallback.study_plan[index % fallback.study_plan.length].focus,
                tasks: Array.isArray(item?.tasks) && item.tasks.length ? item.tasks.map(String) : fallback.study_plan[index % fallback.study_plan.length].tasks,
                est_minutes: Number.isFinite(item?.est_minutes) ? item.est_minutes : 45
            }))
            : fallback.study_plan;

        const key_dates = Array.isArray(parsed.key_dates) && parsed.key_dates.length
            ? parsed.key_dates.map((item) => ({ date: String(item?.date || "").trim(), description: String(item?.description || "").trim() }))
            : fallback.key_dates;

        const topics = Array.isArray(parsed.topics) && parsed.topics.length
            ? parsed.topics.map((item, index) => ({
                name: String(item?.name || fallback.topics[index % fallback.topics.length]?.name || "").trim(),
                priority: coercePriority(item?.priority)
            }))
            : fallback.topics;

        return json(200, { summary_points, study_plan, key_dates, topics });
    } catch {
        return json(200, fallback);
    }
};
