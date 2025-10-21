from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, HttpUrl
import requests
from bs4 import BeautifulSoup
from typing import Optional
import re
import json
from urllib.parse import urlparse, urljoin
from app.database import get_db
from app import models

router = APIRouter()

class LinkPreviewRequest(BaseModel):
    url: HttpUrl

class LinkPreviewResponse(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    site_name: Optional[str] = None

def get_service_credentials(service_name: str, db: Session) -> Optional[dict]:
    """Get credentials for a service from database"""
    credential = db.query(models.ServiceCredential).filter(
        models.ServiceCredential.service_name == service_name
    ).first()
    
    if credential:
        try:
            creds = json.loads(credential.credentials)
            config = json.loads(credential.config)
            return {"credentials": creds, "config": config}
        except json.JSONDecodeError:
            return None
    return None

def fetch_google_doc_preview(url: str, doc_id: str, credentials: Optional[dict]) -> Optional[LinkPreviewResponse]:
    """Fetch preview for Google Docs using API if credentials are available"""
    if not credentials or not credentials.get("credentials"):
        return None
    
    try:
        # Try to use Google Drive API to get file metadata
        creds_data = credentials["credentials"]
        
        # Support for API key or OAuth token
        api_key = creds_data.get("api_key")
        access_token = creds_data.get("access_token")
        
        if api_key:
            # Use API key for public or domain-shared docs
            api_url = f"https://www.googleapis.com/drive/v3/files/{doc_id}"
            params = {
                "key": api_key,
                "fields": "name,description,thumbnailLink,iconLink"
            }
            response = requests.get(api_url, params=params, timeout=5)
        elif access_token:
            # Use OAuth access token for private docs
            api_url = f"https://www.googleapis.com/drive/v3/files/{doc_id}"
            headers = {"Authorization": f"Bearer {access_token}"}
            params = {"fields": "name,description,thumbnailLink,iconLink"}
            response = requests.get(api_url, headers=headers, params=params, timeout=5)
        else:
            return None
        
        if response.status_code == 200:
            data = response.json()
            return LinkPreviewResponse(
                url=url,
                title=data.get("name", "Google Doc"),
                description=data.get("description", ""),
                image=data.get("thumbnailLink") or data.get("iconLink"),
                site_name="Google Docs"
            )
    except Exception as e:
        print(f"Error fetching Google Doc preview: {e}")
    
    return None

def fetch_jira_issue_preview(url: str, issue_key: str, credentials: Optional[dict]) -> Optional[LinkPreviewResponse]:
    """Fetch preview for Jira issue using API"""
    if not credentials or not credentials.get("credentials"):
        return None
    
    try:
        creds_data = credentials["credentials"]
        config_data = credentials.get("config", {})
        
        jira_url = config_data.get("jira_url")
        email = creds_data.get("email")
        api_token = creds_data.get("api_token")
        
        if not all([jira_url, email, api_token]):
            return None
        
        # Fetch issue details from Jira API
        api_url = f"{jira_url}/rest/api/3/issue/{issue_key}"
        auth = (email, api_token)
        response = requests.get(api_url, auth=auth, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            fields = data.get("fields", {})
            
            # Extract relevant information
            summary = fields.get("summary", issue_key)
            description = fields.get("description", "")
            
            # Try to get plain text description
            if isinstance(description, dict):
                # Jira's new format (Atlassian Document Format)
                description_text = ""
                for content in description.get("content", []):
                    if content.get("type") == "paragraph":
                        for text_node in content.get("content", []):
                            if text_node.get("type") == "text":
                                description_text += text_node.get("text", "")
                description = description_text[:200]
            
            issue_type = fields.get("issuetype", {}).get("name", "Issue")
            status = fields.get("status", {}).get("name", "")
            
            preview_desc = f"[{issue_type}] {status}"
            if description:
                preview_desc += f" - {description}"
            
            # Try to get issue type icon
            icon_url = fields.get("issuetype", {}).get("iconUrl")
            
            return LinkPreviewResponse(
                url=url,
                title=f"{issue_key}: {summary}",
                description=preview_desc,
                image=icon_url,
                site_name="Jira"
            )
    except Exception as e:
        print(f"Error fetching Jira preview: {e}")
    
    return None

def fetch_slack_message_preview(url: str, credentials: Optional[dict]) -> Optional[LinkPreviewResponse]:
    """Fetch preview for Slack message using API"""
    if not credentials or not credentials.get("credentials"):
        return None
    
    try:
        creds_data = credentials["credentials"]
        token = creds_data.get("token")  # Bot token or user token
        
        if not token:
            return None
        
        # Extract channel and message timestamp from Slack URL
        # Format: https://workspace.slack.com/archives/CHANNEL_ID/pMESSAGE_TS
        match = re.search(r'/archives/([^/]+)/p(\d+)', url)
        if not match:
            return None
        
        channel_id = match.group(1)
        message_ts = match.group(2)
        # Convert message timestamp format (remove 'p' prefix and add decimal point)
        message_ts = f"{message_ts[:10]}.{message_ts[10:]}"
        
        # Fetch message using Slack API
        api_url = "https://slack.com/api/conversations.history"
        headers = {"Authorization": f"Bearer {token}"}
        params = {
            "channel": channel_id,
            "latest": message_ts,
            "limit": 1,
            "inclusive": "true"
        }
        
        response = requests.get(api_url, headers=headers, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") and data.get("messages"):
                message = data["messages"][0]
                text = message.get("text", "")
                user = message.get("user", "Unknown")
                
                # Try to get user info
                user_info_url = "https://slack.com/api/users.info"
                user_params = {"user": user}
                user_response = requests.get(user_info_url, headers=headers, params=user_params, timeout=5)
                
                username = user
                user_image = None
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if user_data.get("ok") and user_data.get("user"):
                        username = user_data["user"].get("real_name") or user_data["user"].get("name", user)
                        user_image = user_data["user"].get("profile", {}).get("image_72")
                
                return LinkPreviewResponse(
                    url=url,
                    title=f"Message from {username}",
                    description=text[:200] + ("..." if len(text) > 200 else ""),
                    image=user_image,
                    site_name="Slack"
                )
    except Exception as e:
        print(f"Error fetching Slack preview: {e}")
    
    return None

@router.post("/preview", response_model=LinkPreviewResponse)
async def get_link_preview(request: LinkPreviewRequest, db: Session = Depends(get_db)):
    """Fetch metadata for a given URL"""
    url = str(request.url)
    
    # Extract domain info for fallback
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace('www.', '')
    
    # Try authenticated fetching for specific services first
    # Google Docs
    if 'docs.google.com' in domain or 'drive.google.com' in domain:
        doc_id_match = re.search(r'/document/d/([a-zA-Z0-9-_]+)', url)
        if doc_id_match:
            doc_id = doc_id_match.group(1)
            google_creds = get_service_credentials("google", db)
            if google_creds:
                auth_preview = fetch_google_doc_preview(url, doc_id, google_creds)
                if auth_preview:
                    return auth_preview
    
    # Jira
    if 'atlassian.net' in domain or 'jira' in domain:
        # Extract issue key (e.g., PROJ-123)
        issue_match = re.search(r'/browse/([A-Z]+-\d+)', url)
        if issue_match:
            issue_key = issue_match.group(1)
            jira_creds = get_service_credentials("jira", db)
            if jira_creds:
                auth_preview = fetch_jira_issue_preview(url, issue_key, jira_creds)
                if auth_preview:
                    return auth_preview
    
    # Slack
    if 'slack.com' in domain:
        slack_creds = get_service_credentials("slack", db)
        if slack_creds:
            auth_preview = fetch_slack_message_preview(url, slack_creds)
            if auth_preview:
                return auth_preview
    
    # Fallback to standard HTML scraping for all other URLs or if auth failed
    try:
        # Special handling for Google Docs/Drive
        is_google_doc = 'docs.google.com' in domain or 'drive.google.com' in domain
        
        # Fetch the URL with a timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        # For Google Docs, try to get the export/preview page which might have more info
        if is_google_doc and '/document/d/' in url:
            # Try to extract document ID and get title from export page
            import re
            doc_id_match = re.search(r'/document/d/([a-zA-Z0-9-_]+)', url)
            if doc_id_match:
                doc_id = doc_id_match.group(1)
                # Try the preview URL which sometimes has the title
                preview_url = f'https://docs.google.com/document/d/{doc_id}/preview'
                try:
                    response = requests.get(preview_url, headers=headers, timeout=5, allow_redirects=True)
                    if response.status_code != 200:
                        # Fallback to original URL
                        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
                except:
                    response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
            else:
                response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        else:
            response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
            
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Extract metadata
        preview = LinkPreviewResponse(url=url, site_name=domain)
        
        # Try Open Graph tags first (most social media sites use these)
        og_title = soup.find('meta', property='og:title')
        og_description = soup.find('meta', property='og:description')
        og_image = soup.find('meta', property='og:image')
        og_site_name = soup.find('meta', property='og:site_name')
        
        # Try Twitter card tags as fallback
        twitter_title = soup.find('meta', attrs={'name': 'twitter:title'})
        twitter_description = soup.find('meta', attrs={'name': 'twitter:description'})
        twitter_image = soup.find('meta', attrs={'name': 'twitter:image'})
        
        # Title
        if og_title:
            preview.title = og_title.get('content')
        elif twitter_title:
            preview.title = twitter_title.get('content')
        elif soup.title:
            title_text = soup.title.string
            # For Google Docs, clean up the title (it often has " - Google Docs" suffix)
            if is_google_doc and title_text:
                title_text = title_text.replace(' - Google Docs', '').replace(' - Google Drive', '').strip()
                if title_text and title_text != 'Google Docs':
                    preview.title = title_text
        
        # Description
        if og_description:
            preview.description = og_description.get('content')
        elif twitter_description:
            preview.description = twitter_description.get('content')
        else:
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                preview.description = meta_desc.get('content')
        
        # Image
        if og_image:
            preview.image = og_image.get('content')
        elif twitter_image:
            preview.image = twitter_image.get('content')
        
        # Make image URL absolute if it's relative
        if preview.image and not preview.image.startswith('http'):
            from urllib.parse import urljoin
            preview.image = urljoin(url, preview.image)
        
        # Site name
        if og_site_name:
            preview.site_name = og_site_name.get('content')
        
        # If we couldn't get any meaningful data, return basic preview
        if not preview.title and not preview.description:
            preview.title = domain
            preview.description = "Link preview not available"
        
        return preview
        
    except requests.exceptions.Timeout:
        # Return basic preview on timeout
        return LinkPreviewResponse(
            url=url,
            title=domain,
            description="Link preview not available (timeout)",
            site_name=domain
        )
    except requests.exceptions.RequestException:
        # Return basic preview on request errors (404, 403, etc.)
        return LinkPreviewResponse(
            url=url,
            title=domain,
            description="Link preview not available (access restricted or not found)",
            site_name=domain
        )
    except Exception:
        # Return basic preview on any other error
        return LinkPreviewResponse(
            url=url,
            title=domain,
            description="Link preview not available",
            site_name=domain
        )

