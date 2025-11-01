from fastapi import APIRouter, HTTPException
import requests
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter()

@router.get("/upcoming")
async def get_upcoming_holidays(days: int = 7, country: str = "US") -> List[Dict]:
    """
    Get upcoming holidays within the specified number of days.
    Uses Nager.Date API (free, no auth required).
    
    Args:
        days: Number of days ahead to check for holidays (default: 7)
        country: Country code (default: US)
    
    Returns:
        List of holidays with name and date
    """
    try:
        # Fetch upcoming public holidays from Nager.Date API
        url = f"https://date.nager.at/api/v3/NextPublicHolidays/{country}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        holidays = response.json()
        
        # Filter holidays within the specified days range
        today = datetime.now().date()
        cutoff_date = today + timedelta(days=days)
        
        upcoming = []
        for holiday in holidays:
            holiday_date = datetime.strptime(holiday["date"], "%Y-%m-%d").date()
            
            # Include holidays from today up to cutoff_date
            if today <= holiday_date <= cutoff_date:
                upcoming.append({
                    "name": holiday["name"],
                    "date": holiday["date"],
                    "localName": holiday.get("localName", holiday["name"]),
                    "countryCode": holiday.get("countryCode", country)
                })
        
        # Sort by date (closest first)
        upcoming.sort(key=lambda x: x["date"])
        
        return upcoming
        
    except requests.RequestException as e:
        # If API fails, return empty list instead of error
        # This allows the app to function without holiday backgrounds
        print(f"Holiday API error: {e}")
        return []
    except Exception as e:
        print(f"Unexpected error fetching holidays: {e}")
        return []

@router.get("/current")
async def get_current_holiday(days: int = 7, country: str = "US") -> Dict:
    """
    Get the closest upcoming holiday within the specified days range.
    
    Args:
        days: Number of days ahead to check (default: 7)
        country: Country code (default: US)
    
    Returns:
        Single holiday object or None if no holidays found
    """
    holidays = await get_upcoming_holidays(days=days, country=country)
    
    if holidays:
        return holidays[0]  # Return the closest one
    
    return {"name": None, "date": None}

