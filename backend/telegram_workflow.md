# n8n Telegram Status Notification Workflow

Copy the JSON block below and paste it directly into a **NEW** n8n workflow canvas.

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "status-update",
        "options": {}
      },
      "id": "060d4778-9e63-47a8-8e65-748981b2a95f",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [180, 300]
    },
    {
      "parameters": {
        "dataType": "string",
        "value1": "={{ $json.body.status }}",
        "rules": {
          "rules": [
            {
              "operation": "equal",
              "value2": "Approved"
            },
            {
              "operation": "equal",
              "value2": "Rejected"
            },
            {
              "operation": "equal",
              "value2": "In Review"
            }
          ]
        }
      },
      "id": "e4418af8-90d1-44eb-9964-b81600889f02",
      "name": "Switch",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [420, 300]
    },
    {
      "parameters": {
        "chatId": "={{ $('Webhook').item.json.body.telegramChatId }}",
        "text": "=🎉 Hello {{ $('Webhook').item.json.body.customerName }},\n\nGreat news! Your event request has been *Approved*.\n\n*Details:*\n- Request ID: {{ $('Webhook').item.json.body.requestId }}\n- Event Name: {{ $('Webhook').item.json.body.title }}\n- Event Date: {{ $('Webhook').item.json.body.eventDate }}\n\nWe will be in touch shortly to coordinate further details.",
        "additionalFields": {
          "parse_mode": "Markdown"
        }
      },
      "id": "273a5a41-b851-460d-a77a-227cc4f42bb0",
      "name": "Telegram - Approved",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [660, 120]
    },
    {
      "parameters": {
        "chatId": "={{ $('Webhook').item.json.body.telegramChatId }}",
        "text": "=Hello {{ $('Webhook').item.json.body.customerName }},\n\nUnfortunately, your event request has been *Rejected*.\n\n*Details:*\n- Request ID: {{ $('Webhook').item.json.body.requestId }}\n- Event Name: {{ $('Webhook').item.json.body.title }}\n\nWe apologize for the inconvenience. Please contact support if you have any questions.",
        "additionalFields": {
          "parse_mode": "Markdown"
        }
      },
      "id": "e2f07ab9-bb6e-44bb-8b17-76b6bb17f303",
      "name": "Telegram - Rejected",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [660, 300]
    },
    {
      "parameters": {
        "chatId": "={{ $('Webhook').item.json.body.telegramChatId }}",
        "text": "=Hello {{ $('Webhook').item.json.body.customerName }},\n\nYour event request is now *In Review*.\n\n*Details:*\n- Request ID: {{ $('Webhook').item.json.body.requestId }}\n- Event Name: {{ $('Webhook').item.json.body.title }}\n\nOur team is currently evaluating your request. We will update you as soon as possible.",
        "additionalFields": {
          "parse_mode": "Markdown"
        }
      },
      "id": "1fa30edb-b230-4e55-9610-d02cd38ce9b7",
      "name": "Telegram - In Review",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [660, 480]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Switch",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Switch": {
      "main": [
        [
          {
            "node": "Telegram - Approved",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Telegram - Rejected",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Telegram - In Review",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Steps to Configure

1. Paste this JSON into a new n8n workflow.
2. Double-click any of the **Telegram** nodes.
3. In the credentials dropdown, select **Create New Credential**.
4. Paste the **Telegram Bot Token** you received from BotFather (I see you already have `TELEGRAM_APIKEY` in your `.env`!).
5. Save the credential. It will automatically apply to all three Telegram nodes.
