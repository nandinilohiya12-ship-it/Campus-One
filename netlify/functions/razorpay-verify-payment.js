const {
    json,
    parseBody,
    handleOptions,
    requireMethod,
    verifyRazorpaySignature,
    supabaseInsert
} = require("./_shared");

exports.handler = async (event) => {
    const options = handleOptions(event);
    if (options) {
        return options;
    }

    const methodError = requireMethod(event);
    if (methodError) {
        return methodError;
    }

    const body = parseBody(event);
    const verified = verifyRazorpaySignature(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature
    );

    if (!verified) {
        return json(400, { verified: false, error: "Payment signature verification failed." });
    }

    const purchase = body.purchase;

    if (purchase?.noteId && purchase?.buyerId) {
        const grossAmount = Number(purchase.grossAmount || 0);
        const uploaderEarned = purchase.purchaseType === "file" ? Math.round(grossAmount * 0.7) : 0;
        const platformEarned = grossAmount - uploaderEarned;

        try {
            await supabaseInsert("note_purchases", {
                note_id: purchase.noteId,
                buyer_id: purchase.buyerId,
                purchase_type: purchase.purchaseType === "file" ? "file" : "ai",
                gross_amount: grossAmount,
                uploader_earned: uploaderEarned,
                platform_earned: platformEarned,
                payment_id: body.razorpay_payment_id
            });
        } catch (error) {
            return json(500, {
                verified: true,
                error: "Payment verified, but purchase could not be saved.",
                detail: error.message
            });
        }
    }

    return json(200, {
        verified: true,
        paymentId: body.razorpay_payment_id
    });
};
