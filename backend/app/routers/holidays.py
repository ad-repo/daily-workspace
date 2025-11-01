from fastapi import APIRouter, HTTPException
import requests
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter()

# Popular cultural holidays not included in federal holiday APIs
CULTURAL_HOLIDAYS = [
    {"name": "New Year's Eve", "month": 12, "day": 31},
    {"name": "Valentine's Day", "month": 2, "day": 14},
    {"name": "St. Patrick's Day", "month": 3, "day": 17},
    {"name": "April Fools' Day", "month": 4, "day": 1},
    {"name": "Cinco de Mayo", "month": 5, "day": 5},
    {"name": "Halloween", "month": 10, "day": 31},
]

def get_cultural_holidays_for_year(year: int) -> List[Dict]:
    """Generate cultural holidays for a given year."""
    holidays = []
    for holiday in CULTURAL_HOLIDAYS:
        date = datetime(year, holiday["month"], holiday["day"]).date()
        holidays.append({
            "name": holiday["name"],
            "date": date.isoformat(),
            "localName": holiday["name"],
            "countryCode": "US",
            "type": "cultural"
        })
    return holidays

@router.get("/upcoming")
async def get_upcoming_holidays(days: int = 7, country: str = "US") -> List[Dict]:
    """
    Get upcoming holidays within the specified number of days.
    Combines federal holidays from Nager.Date API with popular cultural holidays.
    
    Args:
        days: Number of days ahead to check for holidays (default: 7)
        country: Country code (default: US)
    
    Returns:
        List of holidays with name and date
    """
    today = datetime.now().date()
    cutoff_date = today + timedelta(days=days)
    upcoming = []
    
    # 1. Fetch federal holidays from API
    try:
        url = f"https://date.nager.at/api/v3/NextPublicHolidays/{country}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        api_holidays = response.json()
        
        for holiday in api_holidays:
            holiday_date = datetime.strptime(holiday["date"], "%Y-%m-%d").date()
            
            if today <= holiday_date <= cutoff_date:
                upcoming.append({
                    "name": holiday["name"],
                    "date": holiday["date"],
                    "localName": holiday.get("localName", holiday["name"]),
                    "countryCode": holiday.get("countryCode", country),
                    "type": "federal"
                })
    except requests.RequestException as e:
        print(f"Holiday API error: {e}")
    except Exception as e:
        print(f"Unexpected error fetching federal holidays: {e}")
    
    # 2. Add cultural holidays
    current_year = today.year
    next_year = current_year + 1
    
    # Get cultural holidays for current and next year
    cultural = get_cultural_holidays_for_year(current_year) + get_cultural_holidays_for_year(next_year)
    
    for holiday in cultural:
        holiday_date = datetime.strptime(holiday["date"], "%Y-%m-%d").date()
        
        if today <= holiday_date <= cutoff_date:
            upcoming.append(holiday)
    
    # Remove duplicates (in case a holiday appears in both lists)
    seen = set()
    unique_holidays = []
    for holiday in upcoming:
        key = (holiday["date"], holiday["name"])
        if key not in seen:
            seen.add(key)
            unique_holidays.append(holiday)
    
    # Sort by date (closest first)
    unique_holidays.sort(key=lambda x: x["date"])
    
    return unique_holidays

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

