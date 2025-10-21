# Service Credentials Setup Guide

This guide explains how to set up API credentials for authenticated link previews from Google Docs, Jira, and Slack.

## Overview

Daily Workspace can fetch rich previews from authenticated services like Google Docs, Jira, and Slack. To enable this feature, you need to configure API credentials for each service you want to use.

## Google Docs

### Option 1: API Key (for public or domain-shared documents)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**
4. Navigate to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy the API key
7. In Daily Workspace Settings, paste the API key in the **Google Docs API Key** field
8. Click **Save Google Credentials**

### Option 2: OAuth Access Token (for private documents)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Drive API**
4. Navigate to **APIs & Services** > **Credentials**
5. Create OAuth 2.0 credentials
6. Configure the OAuth consent screen
7. Add required scopes: `https://www.googleapis.com/auth/drive.readonly`
8. Generate an access token using OAuth flow
9. In Daily Workspace Settings, paste the access token in the **Access Token** field
10. Click **Save Google Credentials**

**Note:** OAuth tokens expire, so you'll need to refresh them periodically or implement a refresh token flow.

## Jira

### Setup

1. Log in to your Atlassian account
2. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
3. Click **Create API token**
4. Give it a label (e.g., "Daily Workspace")
5. Copy the API token immediately (you won't be able to see it again)

### Configuration

In Daily Workspace Settings, enter:
- **Jira URL**: Your Jira instance URL (e.g., `https://your-company.atlassian.net`)
- **Email**: Your Atlassian account email
- **API Token**: The token you created above

Click **Save Jira Credentials**.

### Permissions

The API token will have the same permissions as your user account. Make sure you have access to view the Jira issues you want to preview.

## Slack

### Setup

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** > **From scratch**
3. Give your app a name (e.g., "Daily Workspace Previews")
4. Select your workspace
5. Navigate to **OAuth & Permissions**
6. Add the following **Bot Token Scopes**:
   - `channels:history` - View messages in public channels
   - `groups:history` - View messages in private channels
   - `im:history` - View messages in direct messages
   - `users:read` - View user information
7. Install the app to your workspace
8. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### Configuration

In Daily Workspace Settings:
- **Bot/User Token**: Paste the token you copied
- Click **Save Slack Credentials**

### Permissions

The bot will only be able to access messages in channels where it's been added. To preview messages from a channel:
1. Open the channel in Slack
2. Type `/invite @YourAppName`
3. The bot will be added to the channel

## How It Works

When you paste a link to a Google Doc, Jira issue, or Slack message in your Daily Workspace entries:

1. The app detects the service from the URL
2. If credentials are configured, it uses the API to fetch rich metadata
3. If credentials are not configured or API fails, it falls back to standard web scraping
4. The preview is automatically generated and displayed

## Security Notes

- All credentials are stored securely in your local database
- Tokens are never sent to third parties (only to the respective service APIs)
- You can delete credentials at any time from the Settings page
- Use the "show/hide" toggle to verify your tokens before saving

## Troubleshooting

### Google Docs
- **"Link preview not available"**: Check that your API key/token is valid and the document is accessible
- **403 Error**: The document may be private and require an OAuth token instead of an API key

### Jira
- **No preview**: Verify your Jira URL is correct (including https://) and doesn't have a trailing slash
- **401 Error**: Check that your email and API token are correct

### Slack
- **No preview**: Ensure the bot has been added to the channel containing the message
- **Token expired**: Slack tokens don't expire, but check if the app was uninstalled from your workspace

## API Rate Limits

Be aware of API rate limits for each service:
- **Google Drive API**: 1,000 requests per 100 seconds per user
- **Jira API**: Varies by plan, typically 300 requests per minute
- **Slack API**: Tier-based, typically 100+ requests per minute

## Privacy

When you configure service credentials, Daily Workspace can fetch metadata about documents/issues/messages you have access to. This data is:
- Fetched only when you paste a link
- Stored only as a preview (title, description, thumbnail)
- Never shared with third parties
- Deleted when you delete the entry


