# Basic Notes on Deploying Web Projects

## What is Deployment?
Deployment means putting your project online so anyone can access it through a web browser.

## Frontend vs Backend
- **Frontend**: The part users see (React, HTML, CSS, JS). Runs in the browser.
- **Backend**: The part that handles data, logic, and storage (Python/Flask, Node.js, etc.). Runs on a server.

## Why Deploy Both?
- If your app only shows static content (no data, no login, no saving), you can deploy just the frontend.
- If your app needs to save data, login, or interact with a database, you must deploy the backend too.

## Common Deployment Platforms
- **Frontend**: Vercel, Netlify, GitHub Pages (for static sites)
- **Backend**: Render, Heroku, Railway, AWS, Azure

## How It Works
1. **Frontend** is deployed to a service (like Vercel) and gets a public URL.
2. **Backend** is deployed to a service (like Render) and gets a public API URL.
3. Your frontend code uses the backend’s public URL to send/receive data.

## Typical Steps
1. Push your code to GitHub.
2. Connect your GitHub repo to a deployment service.
3. Configure build settings (if needed).
4. Deploy and get a public URL.

## Key Terms
- **Build**: The process of preparing your code for deployment (minifying, bundling, etc.).
- **Production**: The live, public version of your app.
- **Environment Variables**: Settings (like API keys) that change between local and deployed versions.

---
If you want more details on any part, or want to see a visual diagram, just ask!
