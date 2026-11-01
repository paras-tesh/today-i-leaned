# Razhaye Aseman

Front end for an online course site teaching western tropical astrology and practical feng shui. The interface is in Persian (RTL).

Built with React 18, Vite and React Router.

## Getting started

```
npm install
```

Copy `.env.example` to `.env` and fill in the project URL and the publishable key from the Supabase dashboard, then:

```
npm run dev
```

## Supabase setup

Run the files in `supabase/` once, in order, from the SQL editor:

1. `01_schema.sql` tables, access rules (row level security) and storage buckets
2. `02_coupon_function.sql` coupon check used by the cart, plus two sample coupons
3. `03_sample_courses.sql` optional sample courses
4. `04_admin_emails.sql` list of emails that get admin access

Add the admin emails to the `admin_emails` table (Table Editor, lowercase). Anyone who signs in with one of them sees a "panel" button on their account page and in the header. Turn on email confirmation in Supabase Auth before going live, so nobody can sign up with an address that isn't theirs.

The admin panel is at `/admin`.

## Still to do

- Payment: `src/lib/payment.js` calls an Edge Function named `payment-start` that does not exist yet. It should create the order, request a Zarinpal payment and return `{ redirectUrl }`; a second function verifies the payment and creates the enrollment.
- Large videos: uploads are plain requests, which is fine for small files. Hour-long videos need resumable uploads or a video host.
- Sending a real confirmation email (custom SMTP) before launch.

## Scripts

- `npm run dev` start the dev server
- `npm run build` production build into `dist`
- `npm run preview` serve the production build locally
