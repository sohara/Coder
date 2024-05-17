## Getting Started

### Install the dependencies

Run `npm install`

### Environment variables

This app requires several environment variables for operation. You can copy `.env.example` to `.env` and replace the placeholders. `DATABASE_URL` doesn't need to change unless you want to change the location of the SQLite DB.

#### AUTH_SECRET

Run `npx auth secret` to generate a new auth secret, then add it the `.env` file.

#### AUTH_GITHUB_ID and AUTH_GITHUB_SECRET

To enable oauth authentication via Github you will need to register an app. Documentation can be found here: https://authjs.dev/guides/configuring-github#registering-your-app

### Running the Application

Simply run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
