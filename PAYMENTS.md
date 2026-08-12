# Campus One Payments and Income

## How money comes to you

Campus One cannot receive real money from only static HTML, CSS, and JavaScript. For public payments you need a Razorpay merchant account connected to your bank account and a small backend/API.

Real flow:

1. Student clicks `Buy Notes`, `AI Chat/Summary`, or `Unlock AI Summarizer ₹20`.
2. App calls your backend endpoint `/api/razorpay/create-order`.
3. Backend creates a Razorpay order for the correct amount.
4. Razorpay Checkout collects payment.
5. Backend verifies the payment signature or webhook.
6. App unlocks the paid item only after verified success.
7. Razorpay settles money to the bank account linked to your Razorpay merchant account.

## Notes seller income

For note-file purchases, the seller sets the price inside the app. The app records:

- `70%` for the uploader.
- `30%` for the platform owner.

Example: if a student sells notes for `₹100`, the app records `₹70` as uploader earnings and `₹30` as platform earnings.

Important: the frontend tracks earnings, but actual payout to uploaders must happen through one of these:

- Manual payout: you pay sellers by UPI/bank after checking `My Earnings`.
- Automated payout: use Razorpay Route/Payouts from your backend.

## AI feature income

AI Chat/Summary and the student AI Notes Summarizer are fixed at `₹20`. These are platform features, so that payment should go to the platform owner account. They do not need uploader revenue sharing unless you decide to add it later.

After a student unlocks the AI Notes Summarizer, the app shows the upload/paste form and generates:

- 8-point summary.
- Day-by-day study plan.
- 5 MCQs.
- Deadline list.

## Minimum backend endpoints needed

Create these before accepting real money:

- `POST /api/razorpay/create-order`
  - Input: `{ noteId, amount, currency, type }`
  - Server checks the note price from database, not from browser input.
  - Server creates Razorpay order and returns `{ id, amount, currency }`.

- `POST /api/razorpay/verify-payment`
  - Input: Razorpay payment response.
  - Server verifies signature using Razorpay key secret.
  - Server creates purchase row and earnings row.

- `POST /api/claude-notes`
  - Input: note text or extracted file content.
  - Server calls the Gemini API.
  - Server stores summary, study plan, MCQs, and deadlines.

## Public today recommendation

Deploy the frontend publicly today, but keep Razorpay in demo mode until the backend is live. Once Razorpay keys, backend verification, and Supabase database are connected, switch to real payments.
