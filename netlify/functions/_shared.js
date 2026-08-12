const crypto = require("crypto");

const jsonHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

function json(statusCode, body) {
    return {
        statusCode,
        headers: jsonHeaders,
        body: JSON.stringify(body)
    };
}

function parseBody(event) {
    try {
        return JSON.parse(event.body || "{}");
    } catch {
        return {};
    }
}

function handleOptions(event) {
    if (event.httpMethod === "OPTIONS") {
        return json(200, { ok: true });
    }

    return null;
}

function requireMethod(event, method = "POST") {
    if (event.httpMethod !== method) {
        return json(405, { error: `Use ${method}` });
    }

    return null;
}

function getRazorpayAuth() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return null;
    }

    return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

function verifyRazorpaySignature(orderId, paymentId, signature) {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret || !orderId || !paymentId || !signature) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

async function supabaseInsert(table, payload) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        return null;
    }

    const response = await fetch(`${url}/rest/v1/${table}`, {
        method: "POST",
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || "Supabase insert failed");
    }

    return response.json();
}

module.exports = {
    json,
    parseBody,
    handleOptions,
    requireMethod,
    getRazorpayAuth,
    verifyRazorpaySignature,
    supabaseInsert
};
