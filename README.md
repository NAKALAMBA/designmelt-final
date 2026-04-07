# DesignMelt Final

Single-page marketing site for DesignMelt built with Vite, vanilla JavaScript, Motion, Lenis, and a Supabase-backed booking intake form.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Supabase Setup

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_TABLE=booking_requests
```

Expected table columns:

- `name` (text)
- `phone` (text)
- `email` (text)
- `service` (text)
- `preferred_date` (date or text)
- `brief` (text)
- `source` (text)

## Notes

- Booking requests in the scheduler section are inserted into Supabase.
- The contact form still opens WhatsApp with a prefilled message.
