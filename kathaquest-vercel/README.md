# KathaQuest — Vercel deploy version

Same game as before, restructured so it deploys as ONE project on Vercel
(frontend + backend together, one free URL).

```
kathaquest-vercel/
  api/turn.js     ← the "Dungeon Master" — a serverless function Vercel auto-hosts
  src/            ← the React game screen
  index.html, vite.config.js, package.json
```

## Deploy steps — GitHub + Vercel

1. **Create a GitHub repo** (on github.com, click "New repository", give it a name
   like `kathaquest`, keep it Public or Private, don't add a README — you already have one).

2. **Push this folder to it.** Open a terminal inside this `kathaquest-vercel` folder:
   ```bash
   git init
   git add .
   git commit -m "KathaQuest starter"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kathaquest.git
   git push -u origin main
   ```

3. **Go to vercel.com**, sign in with GitHub, click "Add New" → "Project", and
   import the `kathaquest` repo you just pushed. Vercel auto-detects it's a
   Vite project — leave all build settings as default.

4. **Add your API key before deploying**: in the "Environment Variables" section
   of the import screen, add:
   - Key: `GEMINI_API_KEY`
   - Value: your key from aistudio.google.com

5. Click **Deploy**. In about a minute you'll get a live URL like
   `kathaquest.vercel.app` — that's your shareable demo link.

## Testing locally before you deploy (optional but recommended)

```bash
npm install -g vercel   # one-time
npm install
cp .env.local.example .env.local
# paste your key into .env.local
vercel dev
```

This runs the frontend AND the `/api/turn` function together on
http://localhost:3000, exactly like production.

## If you update the code later

Any `git push` to `main` automatically redeploys on Vercel — no manual redeploy step.
