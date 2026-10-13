# TheBytely

AI-powered website platform for small businesses in India.

- **client/**: React + Vite + Tailwind CSS (the website you designed)
- **server/**: Node.js + Express (the AI website builder, assistant and enquiries)

## What the server does

The client sends everything to one endpoint, `POST /api/command`, as
`{ "command": "...", "payload": { ... } }`.

| Command | What it does |
|---|---|
| `create_website` | Takes a business brief and returns a **basic** 3-page website (Home, About, Contact) written by AI, plus HTML previews. |
| `render_website` | Re-renders a basic website after the visitor edits text or colour. No AI is used. |
| `ask_assistant` | Answers visitor questions about TheBytely (robot chat). |
| `submit_enquiry` | Validates and saves a project enquiry. Totals are recalculated on the server. |

### How "basic websites only" is enforced

This is built into the code, not only the prompt:

1. **Command allow-list.** Anything else (for example `add_chatbot` or `create_premium_website`) is refused with a "paid service" message.
2. **Strict input.** `create_website` accepts only `name`, `type`, `location`, `style` and `products`. Options such as `parallax`, `chatbot` or `extraPages` are rejected.
3. **The AI writes words, not code.** It must answer through a fixed tool schema (headline, intro, 3 highlights, About text, Contact text). It never writes HTML or CSS.
4. **The server builds the site.** `server/src/render.js` turns the text into plain HTML/CSS with three pages, no JavaScript, no animation and no third-party code, so a basic site cannot contain add-ons.
5. **Output check.** If the AI mentions chatbots, parallax, 3D, payments, booking and similar, the server asks it to try again, then falls back to a built-in template.
6. **Rate limit.** Default 5 free drafts per hour per visitor IP (`GENERATE_PER_HOUR`).

The rules live in `server/src/policy.js`.

## Run it on your computer

You need Node.js 18.17 or newer.

```bash
# 1. Install everything
npm run setup

# 2. Configure the server
cp server/.env.example server/.env
#    then open server/.env and paste your ANTHROPIC_API_KEY
#    (without a key the builder still works using built-in templates)

# 3. Start the server (terminal 1)
npm run dev:server

# 4. Start the website (terminal 2)
npm run dev:client
```

Open http://localhost:5173

## Run it for real (one server)

```bash
npm run setup
npm run build        # builds the React app into client/dist
npm start            # the Node server also serves the website
```

Open http://localhost:3001. When deploying to Render, Railway or similar, set
`TRUST_PROXY=1` and add your environment variables from `server/.env.example`.

## Tests

```bash
npm test
```

15 tests cover the basic-only rules, input validation, HTML injection,
rate limiting, the AI retry logic (mocked) and enquiry pricing.

## Reading enquiries

Enquiries are saved to `server/data/enquiries.jsonl`. To read them over HTTP set
`ADMIN_TOKEN` in `server/.env`, then:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/enquiries
```

## Notes

- Keep `ANTHROPIC_API_KEY` on the server only. It is never sent to the browser.
- Source-code export (₹999) is shown as "coming soon" and is not built.
- The one-draft-per-month Free Studio limit needs accounts, which are not built
  yet. Until then the hourly rate limit protects your AI costs.
- The rate limiter keeps counts in memory and resets when the server restarts.
