from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel
from app.database import get_db
from app import models
import ollama
import os
import re
from html import unescape

router = APIRouter()

# Get Ollama base URL from environment or use default
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

class LLMRequest(BaseModel):
    entry_ids: list[int]  # Support multiple entries
    additional_prompt: str = ""
    model: str = "mistral:latest"

class LLMResponse(BaseModel):
    response: str
    model: str
    prompt: str  # The full prompt sent to LLM

class ModelInfo(BaseModel):
    name: str
    size: int = 0
    modified: str = ""

def html_to_markdown(html_content: str) -> str:
    """Convert HTML content to markdown"""
    if not html_content:
        return ""
    
    # Unescape HTML entities
    text = unescape(html_content)
    
    # Convert headers
    text = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h5[^>]*>(.*?)</h5>', r'##### \1\n', text, flags=re.DOTALL)
    text = re.sub(r'<h6[^>]*>(.*?)</h6>', r'###### \1\n', text, flags=re.DOTALL)
    
    # Convert bold
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    
    # Convert italic
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text, flags=re.DOTALL)
    
    # Convert links
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)
    
    # Convert link preview divs to markdown links
    def convert_link_preview(match):
        preview_html = match.group(0)
        url = re.search(r'(?:data-url|url)="([^"]*)"', preview_html)
        title = re.search(r'(?:data-title|title)="([^"]*)"', preview_html)
        description = re.search(r'(?:data-description|description)="([^"]*)"', preview_html)
        
        result = "\n[Link Preview]\n"
        if title:
            result += f"Title: {title.group(1)}\n"
        if description:
            result += f"Description: {description.group(1)}\n"
        if url:
            result += f"URL: {url.group(1)}\n"
        return result + "\n"
    
    text = re.sub(r'<div[^>]*data-link-preview[^>]*>.*?</div>', convert_link_preview, text, flags=re.DOTALL)
    
    # Convert code blocks
    text = re.sub(r'<pre[^>]*><code[^>]*>(.*?)</code></pre>', r'```\n\1\n```', text, flags=re.DOTALL)
    
    # Convert inline code
    text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', text, flags=re.DOTALL)
    
    # Convert blockquotes
    text = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', lambda m: '\n'.join('> ' + line for line in m.group(1).strip().split('\n')) + '\n', text, flags=re.DOTALL)
    
    # Convert lists
    text = re.sub(r'<ul[^>]*>(.*?)</ul>', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'<ol[^>]*>(.*?)</ol>', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'<li[^>]*>(.*?)</li>', r'- \1\n', text, flags=re.DOTALL)
    
    # Convert line breaks
    text = re.sub(r'<br\s*/?>', '\n', text)
    
    # Convert paragraphs
    text = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', text, flags=re.DOTALL)
    
    # Remove remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Clean up multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

@router.post("/query", response_model=LLMResponse)
async def query_llm(request: LLMRequest, db: Session = Depends(get_db)):
    """Send entry data to LLM with optional additional prompt"""
    
    if not request.entry_ids:
        raise HTTPException(status_code=400, detail="No entry IDs provided")
    
    # Get all entries, eagerly load daily_note and labels
    entries = db.query(models.NoteEntry).options(
        joinedload(models.NoteEntry.daily_note),
        joinedload(models.NoteEntry.labels)
    ).filter(
        models.NoteEntry.id.in_(request.entry_ids)
    ).order_by(models.NoteEntry.created_at).all()
    
    if not entries:
        raise HTTPException(status_code=404, detail="No entries found")
    
    # Build the prompt
    prompt_parts = []
    
    if len(entries) > 1:
        prompt_parts.append(f"# Analysis of {len(entries)} Entries\n")
    
    # Process each entry
    for idx, entry in enumerate(entries, 1):
        daily_note = entry.daily_note
        
        # Convert content to markdown
        if entry.content_type == 'code':
            content_md = f"```\n{entry.content}\n```"
        else:
            content_md = html_to_markdown(entry.content)
        
        # Entry header
        if len(entries) > 1:
            prompt_parts.append(f"\n## Entry {idx} - {daily_note.date}")
        else:
            prompt_parts.append(f"# Entry from {daily_note.date}")
        
        prompt_parts.append(f"Created: {entry.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Add metadata
        metadata = []
        if entry.is_important:
            metadata.append("⭐ Important")
        if entry.is_completed:
            metadata.append("✓ Completed")
        if entry.include_in_report:
            metadata.append("📄 In Report")
        if entry.is_dev_null:
            metadata.append("💀 /dev/null")
        
        if metadata:
            prompt_parts.append(f"Status: {' | '.join(metadata)}")
        
        # Add labels
        if entry.labels:
            label_names = [label.name for label in entry.labels]
            prompt_parts.append(f"Labels: {', '.join(label_names)}")
        
        # Add daily goal if present
        if daily_note.daily_goal:
            prompt_parts.append(f"Daily Goal: {daily_note.daily_goal}")
        
        # Add content
        prompt_parts.append(f"\n### Content\n\n{content_md}\n")
        prompt_parts.append("---")
    
    # Add user's additional prompt
    if request.additional_prompt:
        prompt_parts.append(f"\n## Question/Request\n\n{request.additional_prompt}")
    
    full_prompt = "\n".join(prompt_parts)
    
    # Query Ollama
    try:
        client = ollama.Client(host=OLLAMA_BASE_URL)
        response = client.chat(
            model=request.model,
            messages=[
                {
                    'role': 'user',
                    'content': full_prompt,
                }
            ]
        )
        
        return LLMResponse(
            response=response['message']['content'],
            model=request.model,
            prompt=full_prompt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM query failed: {str(e)}")

@router.get("/models", response_model=list[ModelInfo])
async def list_models():
    """List available Ollama models"""
    try:
        client = ollama.Client(host=OLLAMA_BASE_URL)
        models_response = client.list()
        
        models_list = []
        for model in models_response.get('models', []):
            models_list.append(ModelInfo(
                name=model.get('name', ''),
                size=model.get('size', 0),
                modified=model.get('modified_at', '')
            ))
        
        return models_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list models: {str(e)}")

@router.post("/models/pull")
async def pull_model(model_name: str):
    """Pull a new model from Ollama"""
    try:
        client = ollama.Client(host=OLLAMA_BASE_URL)
        # Pull the model (this may take a while for large models)
        client.pull(model_name)
        return {"message": f"Successfully pulled model: {model_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to pull model: {str(e)}")

