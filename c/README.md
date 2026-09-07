# Vocabulary Steps

A vocabulary practice app where learners must complete every question in a set correctly before moving on. A missed definition immediately shows the correct answer, then that word returns later in the same set until it is answered correctly. The administrator alone can add, edit, or remove words and change the questions-per-set length.

## Run locally

1. Install [Node.js 20+](https://nodejs.org/).
2. Run `npm install`.
3. Copy `.env.example` to `.env`, then choose a strong `ADMIN_PASSWORD` and a long random `SESSION_SECRET`.
4. Load those variables in your shell, then run `npm start` and open `http://localhost:3000`.

PowerShell example:

```powershell
$env:ADMIN_PASSWORD='your-long-password'
$env:SESSION_SECRET='a-long-random-value'
npm start
```

## Deploying from GitHub

Push this repository to GitHub, then deploy it to a Node-capable host (such as Render, Railway, Fly.io, or a VPS). Set `ADMIN_PASSWORD` and `SESSION_SECRET` as **host environment variables**, never in GitHub files. Attach persistent storage and set `VOCAB_DATA_PATH` to a file on that persistent volume; otherwise host restarts can discard vocabulary edits.

GitHub Pages is not suitable for this version: it is static-only and would expose any administrator password in the browser. The server verifies administrator sessions and keeps the password secret.

## Vocabulary format

The initial list is in `data/vocabulary.json`. Use the Administrator screen after deployment for routine changes. Definitions are checked case-insensitively; exact wording is required. The data format supports optional `acceptedAnswers` for alternate phrasings if you add them directly to the JSON.
