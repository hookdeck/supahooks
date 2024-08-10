# Outbound Webhooks Demo for Hookdeck

A demo of using [Hookdeck](<(https://hookdeck.com?ref=github-outbound-webhooks-demo) as your outbound webhook infrastructure.

![Outbound Webhooks Demo with Hookdeck](docs/outbound-webhooks-demo.png)

## Getting Started

[Signup for Hookdeck](https://dashboard.hookdeck.com?ref=github-outbound-webhooks-demo), and from within a project, get your API key from **Settings -> Secrets**.

Add the credentials to a `.env.local` file:

```
HOOKDECK_API_KEY=<API_KEY>
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

Install the project dependencies:

```bash
npm i
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

- [Hookdeck Documentation](https://hookdeck.com/docs?ref=github-outbound-webhooks-demo)
- [Next.js](https://nextjs.org)
