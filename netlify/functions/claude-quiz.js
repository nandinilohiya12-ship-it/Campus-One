const { json, parseBody, handleOptions, requireMethod } = require("./_shared");

function normalizeQuizText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
}

function splitQuizSentences(text) {
    return normalizeQuizText(text)
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 28)
        .slice(0, 60);
}

function titleCase(value) {
    return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function extractQuizKeywords(text, subject) {
    const stopWords = new Set("about above after again against also because before being between could every first from have into more most only other should their there these those through under using very which while with without your this that they them then than will were what when where".split(" "));
    const counts = new Map();
    normalizeQuizText(`${subject || ""} ${text || ""}`).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g)?.forEach((word) => {
        if (stopWords.has(word)) {
            return;
        }
        counts.set(word, (counts.get(word) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word]) => titleCase(word));
}

// Content-aware fallback used when ANTHROPIC_API_KEY is missing or the Claude call fails.
// Extractive, not AI-generated, but always reflects the student's actual notes.
function fallbackQuiz(title, subject, content) {
    const cleanTitle = title || "these notes";
    const cleanSubject = subject || "the subject";
    const sentences = splitQuizSentences(content);
    const keywords = extractQuizKeywords(content, cleanSubject);
    const topKeywords = keywords.length ? keywords : [cleanSubject, "Definitions", "Examples", "Formulas"];

    const questions = [];
    const baseCount = Math.max(8, Math.min(10, topKeywords.length + 4));

    for (let index = 0; index < baseCount; index += 1) {
        const anchor = topKeywords[index % topKeywords.length];
        const distractors = topKeywords.filter((word) => word !== anchor).slice(0, 3);
        while (distractors.length < 3) {
            distractors.push(`Unrelated concept ${distractors.length + 1}`);
        }
        const options = [anchor, ...distractors];
        // deterministic shuffle so the correct answer isn't always first
        const correctIndex = index % 4;
        const finalOptions = [...distractors];
        finalOptions.splice(correctIndex, 0, anchor);

        questions.push({
            id: `q${index + 1}`,
            question: sentences[index]
                ? `Based on ${cleanTitle}, which term is most closely tied to: "${sentences[index].slice(0, 90)}"?`
                : `Which of these is a high-weightage topic in ${cleanTitle}?`,
            options: finalOptions,
            correct_index: correctIndex,
            explanation: `${anchor} appears as a recurring, high-weightage term in ${cleanTitle} (${cleanSubject}).`
        });
    }

    return { questions };
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
    const fallback = fallbackQuiz(body.title, body.subject, body.content);

    if (!apiKey) {
        return json(200, fallback);
    }

    const prompt = `Generate a quiz from the provided notes. Return ONLY valid JSON:
{ "questions": [{ "id": "q1", "question": "...", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "..." }] }
Generate 8-10 questions covering the most important/high-weightage concepts only. Avoid trivial or trick questions.

Title: ${body.title || "Uploaded notes"}
Subject: ${body.subject || "General"}
Notes text: ${body.content || "No extracted text was available for this file."}`;

    try {
        const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 2200, temperature: 0.7 }
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

        const questions = Array.isArray(parsed.questions) ? parsed.questions.filter((q) => q && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.correct_index)) : [];

        if (!questions.length) {
            return json(200, fallback);
        }

        return json(200, {
            questions: questions.map((q, index) => ({
                id: q.id || `q${index + 1}`,
                question: String(q.question || "").trim(),
                options: q.options.map((option) => String(option)),
                correct_index: Math.max(0, Math.min(3, q.correct_index)),
                explanation: String(q.explanation || "").trim()
            }))
        });
    } catch {
        return json(200, fallback);
    }
};
