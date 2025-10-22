# 🚀 Workshop: Fullstack Web App with the T3 Stack

This guide walks you through setting up and running a **fullstack web application** built with the **T3 Stack** — a modern framework combining TypeScript, Next.js, Prisma, Tailwind, tRPC, and NextAuth.

---

## 🧰 Prerequisites

### 1. Install Node.js & npm
Next.js requires Node.js (v18 or higher).

**Steps:**
1. Go to [nodejs.org/en/download](https://nodejs.org/en/download)
2. Download the **LTS** version for your OS (Windows/macOS/Linux)
3. Install Node.js using default options
4. Verify installation:
   ```bash
   node -v
   npm -v
   ```
   You should see version numbers printed.

---

### 2. Install a Code Editor
We recommend **Visual Studio Code (VS Code)**.

**Steps:**
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install it
3. (Optional) Install helpful extensions:
   - **ES7+ React/Redux/React-Native snippets**
   - **Prettier – Code formatter**

---

### 3. Install Git (Version Control)
**Steps:**
1. Go to [git-scm.com/install](https://git-scm.com/install/)
2. Download and install Git
3. Verify installation:
   ```bash
   git --version
   ```

---

## ⚡ Create a T3 Stack App

We’ll use the official **Create T3 App** tool to scaffold our project.

```bash
npx create-t3-app@latest
```

When prompted, choose:

| Option | Choice |
|--------|---------|
| **Project Name** | `web-workshop` (or your own) |
| **Language** | TypeScript ✅ |
| **Styling** | Tailwind CSS ✅ |
| **tRPC** | Yes ✅ |
| **Auth Provider** | NextAuth.js ✅ |
| **ORM** | Prisma ✅ |
| **App Router** | Yes ✅ |
| **Database** | SQLite (LibSQL) ✅ |
| **Linting/Formatting** | ESLint + Prettier ✅ |
| **Initialize Git** | Yes ✅ |
| **Install Dependencies** | Yes ✅ |
| **Import Alias** | `src` ✅ |

---

## 🔑 Setting up Discord Authentication (NextAuth)

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application**
3. Navigate to **OAuth2 → General**
4. Copy the **Client ID** → paste into `.env`:
   ```
   DISCORD_CLIENT_ID=your_client_id
   ```
5. Under **Client Secret**, click **Reset Secret**, then copy it:
   ```
   DISCORD_CLIENT_SECRET=your_client_secret
   ```
6. Add a redirect URI:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```
7. Save your changes.

> You can use the same app for production, but it’s safer to create separate ones for dev and prod.

---

Ensure the contents of
```bash
npx auth secret
```

Is in
```bash
AUTH_SECRET="<secret>"
```

### Run the App
```bash
cd web-workshop
npx prisma generate
pnpm db:push
npm run dev
```

Open your browser to [http://localhost:3000](http://localhost:3000).
You should see your Next.js app running with Tailwind styling.

---

## 🧠 Learn More About the T3 Stack

If you’re new to these tools, check out their documentation:

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [T3 Stack Docs](https://create.t3.gg/)

Join the [T3 Discord Community](https://t3.gg/discord) for help.

---

## 🚀 Deployment Guides

You can deploy your finished project using:

- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

---

## ✅ Verify Everything Works

Once you’ve completed all steps:
1. Run `npm run dev`
2. Visit [http://localhost:3000](http://localhost:3000)
3. Test sign-in with Discord
4. Confirm database and styling are functional

---

### 💡 Tip
This setup is intentionally minimal so you can focus on understanding how the stack pieces fit together. You’ll extend this scaffold in the workshop to add features like API endpoints, database operations, and authentication logic.

---

© 2025 WMU Developer Club — Web Workshop
