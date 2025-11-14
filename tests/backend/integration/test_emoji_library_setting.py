"""
Integration tests for emoji_library setting in app_settings.
"""
from fastapi.testclient import TestClient


class TestEmojiLibrarySetting:
    """Test emoji library preference setting."""

    def test_get_default_emoji_library(self, client: TestClient):
        """Test that default emoji library is emoji-picker-react."""
        response = client.get('/api/settings')
        assert response.status_code == 200
        data = response.json()
        assert 'emoji_library' in data
        assert data['emoji_library'] == 'emoji-picker-react'

    def test_update_emoji_library_to_emoji_mart(self, client: TestClient):
        """Test updating emoji library preference to emoji-mart."""
        response = client.patch(
            '/api/settings',
            json={'emoji_library': 'emoji-mart'},
        )
        assert response.status_code == 200
        data = response.json()
        assert data['emoji_library'] == 'emoji-mart'
        
        # Verify it persists
        get_response = client.get('/api/settings')
        assert get_response.json()['emoji_library'] == 'emoji-mart'

    def test_update_emoji_library_to_emoji_picker_react(self, client: TestClient):
        """Test updating emoji library preference to emoji-picker-react."""
        # First set to emoji-mart
        client.patch('/api/settings', json={'emoji_library': 'emoji-mart'})
        
        # Then change to emoji-picker-react
        response = client.patch(
            '/api/settings',
            json={'emoji_library': 'emoji-picker-react'},
        )
        assert response.status_code == 200
        data = response.json()
        assert data['emoji_library'] == 'emoji-picker-react'

    def test_emoji_library_setting_persists_across_updates(self, client: TestClient):
        """Test that emoji library setting persists when other settings are updated."""
        # Set emoji library
        client.patch('/api/settings', json={'emoji_library': 'emoji-mart'})
        
        # Update a different setting (e.g., timezone)
        client.patch('/api/settings', json={'timezone': 'America/New_York'})
        
        # Verify emoji library is unchanged
        response = client.get('/api/settings')
        assert response.json()['emoji_library'] == 'emoji-mart'

    def test_emoji_library_included_in_backup(self, client: TestClient):
        """Test that emoji library setting is included in backup export."""
        # Set emoji library
        client.patch('/api/settings', json={'emoji_library': 'emoji-mart'})
        
        # Export backup
        response = client.get('/api/backup/export')
        assert response.status_code == 200
        data = response.json()
        
        assert 'app_settings' in data
        assert data['app_settings']['emoji_library'] == 'emoji-mart'

    def test_emoji_library_restored_from_backup(self, client: TestClient):
        """Test that emoji library setting is restored from backup import."""
        backup_data = {
            'version': '7.0',
            'app_settings': {
                'timezone': 'UTC',
                'emoji_library': 'emoji-mart',
            },
            'daily_notes': [],
            'labels': [],
            'lists': [],
            'sprint_goals': [],
            'quarterly_goals': [],
            'search_history': [],
            'custom_emojis': [],
        }
        
        response = client.post('/api/backup/import', json=backup_data)
        assert response.status_code == 200
        
        # Verify emoji library was restored
        settings_response = client.get('/api/settings')
        assert settings_response.json()['emoji_library'] == 'emoji-mart'

