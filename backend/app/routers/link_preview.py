import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl

router = APIRouter()


class LinkPreviewRequest(BaseModel):
    url: HttpUrl


class LinkPreviewResponse(BaseModel):
    url: str
    title: str | None = None
    description: str | None = None
    image: str | None = None
    site_name: str | None = None


@router.post('/preview', response_model=LinkPreviewResponse)
async def get_link_preview(request: LinkPreviewRequest):
    """Fetch metadata for a given URL"""
    url = str(request.url)

    # Extract domain info for fallback
    from urllib.parse import urlparse

    parsed_url = urlparse(url)
    domain = parsed_url.netloc.replace('www.', '')

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
                except Exception:
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
            preview.description = 'Link preview not available'

        return preview

    except requests.exceptions.Timeout:
        # Return basic preview on timeout
        return LinkPreviewResponse(
            url=url, title=domain, description='Link preview not available (timeout)', site_name=domain
        )
    except requests.exceptions.RequestException:
        # Return basic preview on request errors (404, 403, etc.)
        return LinkPreviewResponse(
            url=url,
            title=domain,
            description='Link preview not available (access restricted or not found)',
            site_name=domain,
        )
    except Exception:
        # Return basic preview on any other error
        return LinkPreviewResponse(url=url, title=domain, description='Link preview not available', site_name=domain)
