const { json, parseBody, handleOptions, requireMethod, getRazorpayAuth } = require("./_shared");

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) {
        return options;
    }

    const methodError = requireMethod(event);
    if (methodError) {
        return methodError;
    }

    const auth = getRazorpayAuth();
    if (!auth) {
        return json(500, { error: "Razorpay environment variables are missing." });
    }

    const body = parseBody(event);
    const amount = Number(body.amount);
    const currency = body.currency || "INR";
    const type = body.type || "note";

    if (!Number.isInteger(amount) || amount < 100) {
        return json(400, { error: "Invalid payment amount." });
    }

    try {
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount,
                currency,
                receipt: `campus_${Date.now()}`,
                notes: {
                    noteId: body.noteId || "",
                    type
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return json(response.status, { error: data.error?.description || "Could not create Razorpay order." });
        }

        return json(200, {
            id: data.id,
            amount: data.amount,
            currency: data.currency
        });
    } catch {
        return json(500, { error: "Razorpay order request failed." });
    }
};
