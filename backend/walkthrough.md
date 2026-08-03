# Telegram Notification Integration

I have successfully updated your backend to support Telegram notifications when an event request status is changed!

## What Changed

### 1. Database Schema
- Added `telegramChatId` to the `Request.js` Mongoose schema so you can store the customer's Telegram ID when they submit a form.

### 2. Request Controllers
- **`createRequest`**: Now accepts `telegramChatId` and saves it to the database when a new request is created. It also forwards this ID to your existing "New Request" n8n webhook so you have it immediately if needed.
- **`updateRequest`**: Added a new trigger block. Whenever an admin updates the `status` of an event request (to "Approved", "Rejected", or "In Review"), it now fires a POST request to a brand new webhook URL: `N8N_STATUS_WEBHOOK_URL`.

### 3. Environment Variables
- Added `N8N_STATUS_WEBHOOK_URL` to your `backend/.env` file. I used a placeholder URL for now. 

## Next Steps for You

### 1. Set Up the n8n Workflow
1. Open n8n and create a **New Workflow**.
2. Open the [telegram_workflow.md](file:///c:/Users/Asus/.gemini/antigravity-ide/brain/0d5a3dd8-fed3-4dd2-97c6-902cf0b155bf/telegram_workflow.md) file I created for you.
3. Copy the JSON block and paste it directly into your blank n8n canvas.
4. Double-click the **Webhook** node, copy the **Test URL**, and replace the placeholder in your `backend/.env` file.
5. Restart your backend server (`npm run dev`).

### 2. Configure Telegram
1. Double click any of the Telegram nodes in n8n.
2. Select **Create New Credential**.
3. I noticed you already have `TELEGRAM_APIKEY` in your `.env`! Paste that exact API key into the n8n credential field.

### 3. Test the Flow
To test this successfully, you need a real Telegram Chat ID in your database.
1. Message your Telegram Bot from your personal Telegram app and say "Hello".
2. Message `@userinfobot` on Telegram to get your personal Chat ID (it will be a string of numbers).
3. Create a new event request on your frontend, and manually insert your Chat ID into the database for that request (or update the frontend form to accept it).
4. Go to n8n, click **Execute Workflow** to start listening.
5. In your admin portal, change the status of that request to "Approved".
6. You will instantly receive the approved message on Telegram!
