# AI Resume Analyser - Web Client 🖥️

This directory houses the presentation layer of the application. It is constructed as a modern, statically typed **Next.js** SPA/SSR engine optimized for fluid user interactions, immediate feedback loops, and highly accessible dashboard interfaces.

---

## 💡 Key Architectural Pillars (For Technical Reviewers)

*   **Explicit TypeScript Contracts**: Zero usage of `any`. Every piece of data incoming from the AI microservice maps cleanly to immutable interfaces defined in `src/types/resume.ts`.
*   **Modular Component Pattern**: UI components like `ResumeUploader` and `ResumeResult` are fully decoupled. They handle isolated states, making them simple to unit test and maintain.
*   **Optimal UX/UI Design**: Built with a sleek, cinematic professional aesthetic featuring intentional loading animations, clear visual error processing, and fully responsive layouts that render beautifully across mobile and desktop.
*   **Strict Styling Architecture**: Utilizes PostCSS and Tailwind CSS utility tokens to eliminate heavy, unmaintainable stylesheets and guarantee uniform global design constants.

---

## 🛠️ Core Technology Stack

*   **Framework**: Next.js (App Router architecture)
*   **Language**: TypeScript (Strict-mode compliant)
*   **Style Engine**: Tailwind CSS + PostCSS
*   **Linter/Formatter**: ESLint + Prettier configuration

---

## 📂 Structural Codebase Breakdown

```bash
   src/
   ├── app/
   │   ├── globals.css      # Core style variables, animations, and typography tokens
   │   ├── layout.tsx       # Root wrapper initializing metadata and viewport controls
   │   └── page.tsx         # The main dashboard orchestration viewport
   ├── components/
   │   ├── ResumeUploader.tsx # Handles drag-and-drop logic, local client validations, and HTTP POST actions
   │   └── ResumeResult.tsx   # Renders the parsed AI payloads, ATS score trackers, and skill badges
   └── types/
   └── resume.ts        # Enforces type-safety interfaces matching backend JSON payloads
```

## 📦 Prerequisites

*   Node.js (v18.17 or higher recommended)
*   npm, yarn, or pnpm

## 🛠️ Installation & Setup

1. **Navigate to the frontend directory:**
```bash
   cd Resume-Analyzer-Frontend
```
2. Install dependencies:

```bash
   npm install
```
   ### or
```bash
   yarn install
```
3. Configure Environment Variables:
Create a .env.local file in the root of this directory and add your backend API URL (and any other required variables):
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000 # Replace with your actual backend URL
```
4. Run the development server:
```bash
npm run dev
```
   ### or
```bash
   yarn dev
```

5. Open the app:
Open http://localhost:3000 with your browser to see the result.
