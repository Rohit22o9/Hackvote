# 🗳️ Render Deployment Guide (HackVote)

This guide provides step-by-step instructions for deploying your **Hackathon Voting System** to Render, using your Hostinger domain and Cloudflare as the DNS manager.

---

## 🛠️ Step 1: Push your latest changes
All recent fixes (including the restored models and synced frontend URLs) MUST be pushed to your GitHub repository first.

1.  Open your terminal at the project root.
2.  Save and push your latest code:
    ```bash
    git add .
    git commit -m "Build: Preparing for Render deployment and fixing frontend URLs"
    git push origin your-branch-name
    ```

---

## 🚀 Step 2: Deploy on Render

1.  **Log in** to your [Render Dashboard](https://dashboard.render.com).
2.  **Create New Web Service**: Click "+ New" -> "Web Service".
3.  **Connect Repo**: Find and connect your GitHub repository.
4.  **Configure Instance**:
    *   **Name**: `hackathon-voting-system` (or your choice).
    *   **Region**: Select the one closest to you (e.g., `Singapore`).
    *   **Root Directory**: `backend` (⚠️ **CRITICAL**)
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**: Go to the "Environment" tab and add these:
    *   `MONGODB_URI`: (Your MongoDB Atlas connection string)
    *   `JWT_SECRET`: (Any long, random string)
    *   **`PORT`**: `5000` (Render will use this)

---

## 🌐 Step 3: Connect your Domain (Hostinger + Cloudflare)

1.  **Configure Nameservers**: 
    - In your **Hostinger** dashboard, change the Nameservers for your domain to point to **Cloudflare** (e.g., `lina.ns.cloudflare.com`).
2.  **In Render Dashboard**: 
    - Go to "Settings" -> "Custom Domains" and add your domain (e.g., `vote.yourdomain.com`).
    - Render will provide a **CNAME** target (e.g., `hack-vote.onrender.com`).
3.  **In Cloudflare Dashboard**:
    - Add a **CNAME** record:
        - **Type**: `CNAME`
        - **Name**: `@` (root) OR `vote` (subdomain)
        - **Target**: `your-app-name.onrender.com`
        - **Proxy Status**: `Proxied` (Orange cloud enabled)

---

## ✅ Step 4: Final Verification
Once the deployment is "Live" on Render:
1.  **Seed the Data**: If you need to populate the initial 70 projects, run the seed script locally pointing to your PRODUCTION database, OR use the Render "Shell" tab to run:
    ```bash
    npm run seed
    ```
2.  **Test Login**: Visit your domain, enter a PRN, and ensure you land on the dashboard with project cards visible.

---

### ⚠️ Troubleshooting Checklist
*   **White Screen?** Check the Browser Console (F12) for 404 or 401 errors.
*   **CORS Issues?** Ensure `backend/server.js` allows your custom domain.
*   **Database connection failure?** Verify your MongoDB Atlas IP Whitelist allows "All IPs" (`0.0.0.0/0`) during the hackathon.
