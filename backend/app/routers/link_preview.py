from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import requests
from bs4 import BeautifulSoup
from typing import Optional
import re

router = APIRouter()

class LinkPreviewRequest(BaseModel):
    url: HttpUrl

class LinkPreviewResponse(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    site_name: Optional[str] = None

@router.post("/preview", response_model=LinkPreviewResponse)
async def get_link_preview(request: LinkPreviewRequest):
    """Fetch metadata for a given URL"""
    url = str(request.url)
    
    try:
        # Fetch the URL with a timeout
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'lxml')
        
        # Extract metadata
        preview = LinkPreviewResponse(url=url)
        
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
            preview.title = soup.title.string
        
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
        else:
            # Extract domain from URL
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            preview.site_name = domain.replace('www.', '')
        
        return preview
        
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Request timeout")
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

