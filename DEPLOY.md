# Campus One Deployment

This folder is a static mobile-first PWA. Deploy the contents of this folder as the site root.

## Quick Deploy

- Vercel: import this folder as a static project, no build command, output directory `./`.
- Netlify: drag this folder into Netlify Drop, or set publish directory to `outputs/campus-one`.
- GitHub Pages: upload these files and enable Pages from the branch/folder.

## Public Today Checklist

1. Deploy this folder to Vercel or Netlify.
2. Open the deployed HTTPS link on mobile and install it from browser menu.
3. Keep `config.js` in demo mode if you only need a public prototype today.
4. For real shared data, create Supabase and set `demoMode: false`.
5. For real money, connect the backend endpoints listed in `PAYMENTS.md` before switching Razorpay live.

## Mobile Install

After deployment, open the HTTPS URL on your phone.

- Android Chrome: menu -> Add to Home screen.
- iPhone Safari: Share -> Add to Home Screen.

## Production Backends

The frontend includes demo fallbacks for the AI features (now backed by Gemini) and Razorpay. It also includes Supabase support.

## Supabase Setup

1. Create a Supabase project.
2. Open Supabase SQL Editor.
3. Run `supabase-schema.sql`.
4. Create real users in Supabase Auth.
5. Insert a matching row in `profiles` for each user.
6. Open `config.js` and set:

```js
window.CAMPUS_ONE_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLISHABLE_ANON_KEY",
  razorpayKeyId: "rzp_live_OR_TEST_KEY_ID",
  demoMode: false
};
```

After this, the profile picker, notes marketplace, and CR board use Supabase data.

## Room and CR Lock Flow

- CR enters college, batch, room code, and CR PIN.
- If the room does not exist, the CR creates it.
- CR can copy the room invite link from the dashboard.
- Students join using the same room code or invite link.
- CR can turn on `Freeze CR access`.
- CR features require the room CR PIN; students cannot self-open CR tools.

For real multi-phone usage, Supabase must be connected because browser storage is local to one phone. The schema includes:

- `rooms`
- `profiles.room_code`
- `announcements.room_code`
- `notes.room_code`
- `cr_posts.room_code`

This package includes Netlify Functions for:

- `/api/claude-notes` for AI summary/chat/study tools (now powered by Google Gemini).
- `/api/razorpay/create-order` for Razorpay order creation.
- `/api/razorpay/verify-payment` for Razorpay signature verification.

Add these in Netlify Site Settings -> Environment Variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Only `razorpayKeyId` goes in `config.js`. Never put `RAZORPAY_KEY_SECRET` in frontend files.

## Income Management

Money from real payments settles into the bank account connected to your Razorpay merchant account. Seller earnings are tracked in the app as `70%` of the note sale price, while platform earnings are `30%`. Read `PAYMENTS.md` before enabling live payments.
