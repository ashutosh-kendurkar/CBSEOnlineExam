# Student Magnet Exam Portal

This project is a React + TypeScript application built with Vite. It uses Firebase Authentication and is ready to deploy on [Vercel](https://vercel.com/).

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file based on `.env.example` and add your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Building

To generate a production build:

```bash
npm run build
```

The output will be placed in the `dist` directory.

## Deployment on Vercel

1. Push this repository to GitHub.
2. Import the project into Vercel.
3. In the Vercel dashboard, set the following Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
4. Deploy. Vercel will run `npm run build` and serve the `dist` folder.

This repository includes a `vercel.json` that rewrites all routes to `index.html` for proper client-side routing.
