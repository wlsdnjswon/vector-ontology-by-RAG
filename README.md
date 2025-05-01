This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Overview

This project implements an **Ontology & Vector based RAG (Retrieval-Augmented Generation) Chatbot**. It combines structured knowledge from an ontology (RDF graph) and unstructured information from documents (vector embeddings) to provide more accurate and context-rich answers through a language model.

**Experience the live demo here:**

**[https://vector-ontology-by-frontend-rag-git-main-wlsdnjswons-projects.vercel.app/](https://vector-ontology-by-frontend-rag-git-main-wlsdnjswons-projects.vercel.app/)**

Feel free to interact with the chatbot and explore its capabilities!

## Features

*   **Hybrid RAG:** Utilizes both ontology graph lookups and vector similarity search for retrieving relevant context.
*   **Conversational AI:** Maintains conversation history for more coherent interactions.
*   **Ontology Integration:** Leverages structured knowledge about specific entities (like people, papers, patents) defined in an RDF ontology.
*   **Document Retrieval:** Finds relevant information from a collection of documents (e.g., PDFs) using vector embeddings.
*   **Interactive UI:** Built with Next.js and shadcn/ui for a clean and responsive chat interface.
*   **Typing Effect:** Simulates realistic chatbot responses.

## Getting Started (Development)

To run this project locally for development:

1.  **Clone the repository.**
2.  **Set up the Backend API:**
    *   Ensure you have the Python Flask backend running (refer to the backend's README or instructions).
    *   The backend should be accessible (e.g., at `http://localhost:5000`).
    *   Make sure the backend has the necessary `OPENAI_API_KEY` configured.
3.  **Set up the Frontend:**
    *   Navigate to the frontend project directory.
    *   Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        # or
        pnpm install
        # or
        bun install
        ```
    *   Create a `.env.local` file in the root of the frontend project.
    *   Add the backend API URL to the `.env.local` file:
        ```
        NEXT_PUBLIC_API_URL=http://localhost:5000/chat 
        # Replace with your actual running backend API URL if different
        ```
    *   Run the development server:
        ```bash
        npm run dev
        # or
        yarn dev
        # or
        pnpm dev
        # or
        bun dev
        ```
4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important Deployment Steps:**

1.  Deploy the Flask backend API first (e.g., on Render, Fly.io) and get its public URL.
2.  When deploying the Next.js frontend on Vercel, set the `NEXT_PUBLIC_API_URL` environment variable in the Vercel project settings to the **full public URL of your deployed backend API** (e.g., `https://your-backend-name.onrender.com/chat`).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
