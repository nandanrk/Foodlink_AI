# FoodLink AI – n8n Workflow Automation Setup Guide

This guide explains step-by-step how to set up and run **n8n** to automate email alerts for FoodLink AI.

---

## 📋 Overview of Workflows

1. **Donation Created Workflow** (`donation_created_workflow.json`)
   - **Trigger:** Webhook event sent by backend when a Restaurant Donor creates a new food listing.
   - **Action:** Sends email alerts to all registered **NGOs / Food Banks** informing them about the available food.

2. **Donation Accepted Workflow** (`donation_accepted_workflow.json`)
   - **Trigger:** Webhook event sent by backend when an NGO accepts a food donation.
   - **Action:** Sends email alerts to **Volunteer Delivery Partners** containing pickup details (Restaurant address & phone) and delivery details (NGO address & phone) along with the Pickup OTP.

---

## 🚀 Step 1: Start n8n

You can run n8n using **npx** (Node.js) or **Docker**:

### Option A: Via `npx` (Easiest)
```bash
npx n8n
```
n8n will start at `http://localhost:5678`.

### Option B: Via Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

---

## 📥 Step 2: Import Workflows into n8n

1. Open `http://localhost:5678` in your browser.
2. Click on **Workflows** in the left sidebar.
3. Click **Add Workflow** -> Click **...** (menu at top right) -> Select **Import from File**.
4. Import `donation_created_workflow.json`.
5. Import `donation_accepted_workflow.json`.
6. **Activate** both workflows by toggling the switch at the top right of each workflow to **Active**.

---

## ⚙️ Step 3: Configure Email Credentials in n8n

For the **Send Email** node in n8n, configure SMTP credentials:

- **SMTP Host:** `smtp.gmail.com` (or Mailtrap / SendGrid)
- **Port:** `465` (SSL) or `587` (TLS)
- **User:** Your Gmail address (e.g. `your-email@gmail.com`)
- **Password:** App Password generated from Google Account (Security -> 2-Step Verification -> App passwords)

---

## 🔗 Step 4: Verify Backend `.env`

Ensure your `backend/.env` file contains the webhook endpoints:

```env
N8N_DONATION_CREATED_WEBHOOK_URL=http://localhost:5678/webhook/donation-created
N8N_DONATION_ACCEPTED_WEBHOOK_URL=http://localhost:5678/webhook/donation-accepted
```

*(If testing using n8n Test Webhooks, replace `/webhook/` with `/webhook-test/`)*.

---

## 🧪 Step 5: Test the Integration

1. Start your FoodLink AI backend:
   ```bash
   cd backend
   npm run dev
   ```
2. Log in as a **Restaurant Donor** and create a new donation listing.
   - Look at the backend terminal: You will see `🚀 Triggering n8n Donation Created Webhook...`
   - Registered NGOs will receive the email notification!
3. Log in as an **NGO** and accept the donation.
   - Look at the backend terminal: You will see `🚀 Triggering n8n Donation Accepted Webhook...`
   - Volunteer Delivery Partners will receive the pickup & delivery dispatch email!
