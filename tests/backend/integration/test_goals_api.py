"""
Integration tests for Goals API endpoints
"""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.integration
class TestSprintGoalsAPI:
    """Test /api/goals/sprint endpoints."""

    def test_create_sprint_goal_success(self, client: TestClient):
        """Test POST /api/goals/sprint with valid data returns 200 (Bug #3: should be 201)."""
        response = client.post(
            '/api/goals/sprint',
            json={'text': 'Complete testing suite', 'start_date': '2025-11-01', 'end_date': '2025-11-14'},
        )

        assert response.status_code == 201
        data = response.json()
        assert data['text'] == 'Complete testing suite'
        assert data['start_date'] == '2025-11-01'
        assert data['end_date'] == '2025-11-14'
        assert 'id' in data
        assert 'created_at' in data
        assert 'days_remaining' in data

    def test_create_sprint_goal_invalid_date_range(self, client: TestClient):
        """Test POST /api/goals/sprint with end_date before start_date returns 400."""
        response = client.post(
            '/api/goals/sprint',
            json={
                'text': 'Invalid dates',
                'start_date': '2025-11-14',
                'end_date': '2025-11-01',  # Before start_date
            },
        )

        assert response.status_code == 400
        assert 'end_date must be after start_date' in response.json()['detail']

    def test_create_sprint_goal_overlapping_allowed(self, client: TestClient):
        """Test POST /api/goals/sprint with overlapping dates is now allowed."""
        # Create first goal
        response1 = client.post(
            '/api/goals/sprint', json={'text': 'Sprint 1', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        assert response1.status_code == 201

        # Create overlapping goal - should now be allowed
        response2 = client.post(
            '/api/goals/sprint',
            json={
                'text': 'Sprint 2',
                'start_date': '2025-11-10',  # Overlaps with Sprint 1
                'end_date': '2025-11-20',
            },
        )

        assert response2.status_code == 201
        data = response2.json()
        assert data['text'] == 'Sprint 2'
        assert data['start_date'] == '2025-11-10'
        assert data['end_date'] == '2025-11-20'

    def test_create_sprint_goal_adjacent_allowed(self, client: TestClient):
        """Test creating adjacent sprint goals (end date + 1 day = start date) is allowed."""
        # Create first goal
        client.post(
            '/api/goals/sprint', json={'text': 'Sprint 1', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        # Create adjacent goal (starts day after first ends)
        response = client.post(
            '/api/goals/sprint',
            json={
                'text': 'Sprint 2',
                'start_date': '2025-11-15',  # Day after Sprint 1 ends
                'end_date': '2025-11-28',
            },
        )

        assert response.status_code == 201

    def test_get_all_sprint_goals(self, client: TestClient):
        """Test GET /api/goals/sprint returns all sprint goals."""
        # Create multiple goals
        goals_data = [
            {'text': 'Sprint 1', 'start_date': '2025-10-01', 'end_date': '2025-10-14'},
            {'text': 'Sprint 2', 'start_date': '2025-11-01', 'end_date': '2025-11-14'},
            {'text': 'Sprint 3', 'start_date': '2025-12-01', 'end_date': '2025-12-14'},
        ]
        for goal_data in goals_data:
            client.post('/api/goals/sprint', json=goal_data)

        response = client.get('/api/goals/sprint')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Should be ordered by start_date
        assert data[0]['text'] == 'Sprint 1'
        assert data[1]['text'] == 'Sprint 2'
        assert data[2]['text'] == 'Sprint 3'

    def test_get_sprint_for_date_active(self, client: TestClient):
        """Test GET /api/goals/sprint/{date} returns active goal."""
        # Create goal
        client.post(
            '/api/goals/sprint', json={'text': 'Active Sprint', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        # Query for date within range
        response = client.get('/api/goals/sprint/2025-11-07')

        assert response.status_code == 200
        data = response.json()
        assert data['text'] == 'Active Sprint'
        assert 'days_remaining' in data
        # Days remaining from Nov 7 to Nov 14
        assert data['days_remaining'] == 7

    def test_get_sprint_for_date_upcoming(self, client: TestClient):
        """Test GET /api/goals/sprint/{date} returns upcoming goal if no active."""
        # Create future goal
        client.post(
            '/api/goals/sprint', json={'text': 'Future Sprint', 'start_date': '2025-12-01', 'end_date': '2025-12-14'}
        )

        # Query for date before goal starts
        response = client.get('/api/goals/sprint/2025-11-15')

        assert response.status_code == 200
        data = response.json()
        assert data['text'] == 'Future Sprint'
        # Days remaining from Nov 15 to Dec 14 = 29 days (positive, not negative)
        # This is how production calculates it
        assert data['days_remaining'] == 29

    def test_get_sprint_for_date_not_found(self, client: TestClient):
        """Test GET /api/goals/sprint/{date} returns 404 when no goal exists."""
        response = client.get('/api/goals/sprint/2025-11-07')

        assert response.status_code == 404
        assert 'No sprint goal found' in response.json()['detail']

    def test_update_sprint_goal_text(self, client: TestClient):
        """Test PUT /api/goals/sprint/{id} updates goal text.

        Bug #2 fixed: The endpoint now correctly defines 'today' variable.
        """
        # Create goal
        create_response = client.post(
            '/api/goals/sprint', json={'text': 'Original text', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        goal_id = create_response.json()['id']

        # Update text
        response = client.put(f'/api/goals/sprint/{goal_id}', json={'text': 'Updated text'})

        assert response.status_code == 200
        data = response.json()
        assert data['text'] == 'Updated text'
        assert data['start_date'] == '2025-11-01'  # Unchanged
        assert data['end_date'] == '2025-11-14'  # Unchanged

    def test_update_sprint_goal_dates(self, client: TestClient):
        """Test PUT /api/goals/sprint/{id} updates goal dates.

        Bug #2 fixed: The endpoint now correctly defines 'today' variable.
        """
        # Create goal
        create_response = client.post(
            '/api/goals/sprint', json={'text': 'Sprint', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        goal_id = create_response.json()['id']

        # Update dates
        response = client.put(
            f'/api/goals/sprint/{goal_id}', json={'start_date': '2025-11-05', 'end_date': '2025-11-20'}
        )

        assert response.status_code == 200
        data = response.json()
        assert data['start_date'] == '2025-11-05'
        assert data['end_date'] == '2025-11-20'

    def test_update_sprint_goal_invalid_dates(self, client: TestClient):
        """Test PUT /api/goals/sprint/{id} with invalid dates returns 400."""
        # Create goal
        create_response = client.post(
            '/api/goals/sprint', json={'text': 'Sprint', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        goal_id = create_response.json()['id']

        # Try to update with invalid dates
        response = client.put(
            f'/api/goals/sprint/{goal_id}',
            json={
                'start_date': '2025-11-20',
                'end_date': '2025-11-10',  # Before start
            },
        )

        assert response.status_code == 400
        assert 'end_date must be after start_date' in response.json()['detail']

    def test_update_sprint_goal_not_found(self, client: TestClient):
        """Test PUT /api/goals/sprint/{id} with non-existent ID returns 404."""
        response = client.put('/api/goals/sprint/99999', json={'text': 'Updated'})

        assert response.status_code == 404
        assert 'not found' in response.json()['detail']

    def test_update_sprint_goal_overlapping_allowed(self, client: TestClient):
        """Test updating sprint goal to overlap with another is now allowed."""
        # Create two goals
        create1 = client.post(
            '/api/goals/sprint', json={'text': 'Sprint 1', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        goal1_id = create1.json()['id']

        client.post(
            '/api/goals/sprint', json={'text': 'Sprint 2', 'start_date': '2025-12-01', 'end_date': '2025-12-14'}
        )

        # Update goal 1 to overlap with goal 2 - should now be allowed
        response = client.put(
            f'/api/goals/sprint/{goal1_id}',
            json={
                'start_date': '2025-11-20',
                'end_date': '2025-12-05',  # Overlaps with Sprint 2
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data['start_date'] == '2025-11-20'
        assert data['end_date'] == '2025-12-05'

    def test_delete_sprint_goal_success(self, client: TestClient):
        """Test DELETE /api/goals/sprint/{id} deletes goal."""
        # Create goal
        create_response = client.post(
            '/api/goals/sprint', json={'text': 'To be deleted', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )
        goal_id = create_response.json()['id']

        # Delete goal
        response = client.delete(f'/api/goals/sprint/{goal_id}')

        assert response.status_code == 200
        assert 'deleted successfully' in response.json()['message']

        # Verify it's gone
        get_response = client.get('/api/goals/sprint')
        assert len(get_response.json()) == 0

    def test_delete_sprint_goal_not_found(self, client: TestClient):
        """Test DELETE /api/goals/sprint/{id} with non-existent ID returns 404."""
        response = client.delete('/api/goals/sprint/99999')

        assert response.status_code == 404
        assert 'not found' in response.json()['detail']


@pytest.mark.integration
class TestQuarterlyGoalsAPI:
    """Test /api/goals/quarterly endpoints."""

    def test_create_quarterly_goal_success(self, client: TestClient):
        """Test POST /api/goals/quarterly with valid data returns 200 (Bug #3: should be 201)."""
        response = client.post(
            '/api/goals/quarterly', json={'text': 'Q4 2025 Goals', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )

        assert response.status_code == 201
        data = response.json()
        assert data['text'] == 'Q4 2025 Goals'
        assert data['start_date'] == '2025-10-01'
        assert data['end_date'] == '2025-12-31'
        assert 'id' in data
        assert 'created_at' in data

    def test_create_quarterly_goal_invalid_date_range(self, client: TestClient):
        """Test POST /api/goals/quarterly with end_date before start_date returns 400."""
        response = client.post(
            '/api/goals/quarterly',
            json={
                'text': 'Invalid dates',
                'start_date': '2025-12-31',
                'end_date': '2025-10-01',  # Before start_date
            },
        )

        assert response.status_code == 400
        assert 'end_date must be after start_date' in response.json()['detail']

    def test_create_quarterly_goal_overlapping_allowed(self, client: TestClient):
        """Test POST /api/goals/quarterly with overlapping dates is now allowed."""
        # Create first goal
        response1 = client.post(
            '/api/goals/quarterly', json={'text': 'Q4 2025', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )
        assert response1.status_code == 201

        # Create overlapping goal - should now be allowed
        response2 = client.post(
            '/api/goals/quarterly',
            json={
                'text': 'Q1 2026 early',
                'start_date': '2025-12-01',  # Overlaps with Q4 2025
                'end_date': '2026-03-31',
            },
        )

        assert response2.status_code == 201
        data = response2.json()
        assert data['text'] == 'Q1 2026 early'
        assert data['start_date'] == '2025-12-01'
        assert data['end_date'] == '2026-03-31'

    def test_get_all_quarterly_goals(self, client: TestClient):
        """Test GET /api/goals/quarterly returns all quarterly goals."""
        # Create multiple goals
        goals_data = [
            {'text': 'Q1', 'start_date': '2025-01-01', 'end_date': '2025-03-31'},
            {'text': 'Q2', 'start_date': '2025-04-01', 'end_date': '2025-06-30'},
            {'text': 'Q3', 'start_date': '2025-07-01', 'end_date': '2025-09-30'},
        ]
        for goal_data in goals_data:
            client.post('/api/goals/quarterly', json=goal_data)

        response = client.get('/api/goals/quarterly')

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        # Should be ordered by start_date
        assert data[0]['text'] == 'Q1'
        assert data[1]['text'] == 'Q2'
        assert data[2]['text'] == 'Q3'

    def test_get_quarterly_for_date_active(self, client: TestClient):
        """Test GET /api/goals/quarterly/{date} returns active goal."""
        # Create goal
        client.post(
            '/api/goals/quarterly', json={'text': 'Q4 2025', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )

        # Query for date within range
        response = client.get('/api/goals/quarterly/2025-11-15')

        assert response.status_code == 200
        data = response.json()
        assert data['text'] == 'Q4 2025'
        assert 'days_remaining' in data

    def test_get_quarterly_for_date_not_found(self, client: TestClient):
        """Test GET /api/goals/quarterly/{date} returns 404 when no goal exists."""
        response = client.get('/api/goals/quarterly/2025-11-07')

        assert response.status_code == 404
        assert 'No quarterly goal found' in response.json()['detail']

    def test_update_quarterly_goal_success(self, client: TestClient):
        """Test PUT /api/goals/quarterly/{id} updates goal.

        Bug #2 fixed: The endpoint now correctly defines 'today' variable.
        """
        # Create goal
        create_response = client.post(
            '/api/goals/quarterly', json={'text': 'Original', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )
        goal_id = create_response.json()['id']

        # Update
        response = client.put(f'/api/goals/quarterly/{goal_id}', json={'text': 'Updated'})

        assert response.status_code == 200
        data = response.json()
        assert data['text'] == 'Updated'

    def test_delete_quarterly_goal_success(self, client: TestClient):
        """Test DELETE /api/goals/quarterly/{id} deletes goal."""
        # Create goal
        create_response = client.post(
            '/api/goals/quarterly', json={'text': 'To delete', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )
        goal_id = create_response.json()['id']

        # Delete
        response = client.delete(f'/api/goals/quarterly/{goal_id}')

        assert response.status_code == 200
        assert 'deleted successfully' in response.json()['message']


@pytest.mark.integration
class TestGoalsAPIEdgeCases:
    """Test edge cases and special scenarios."""

    def test_sprint_and_quarterly_goals_independent(self, client: TestClient):
        """Test that sprint and quarterly goals don't interfere with each other."""
        # Create quarterly goal
        client.post(
            '/api/goals/quarterly', json={'text': 'Q4 Goals', 'start_date': '2025-10-01', 'end_date': '2025-12-31'}
        )

        # Create sprint goal that overlaps with quarterly (should be allowed)
        response = client.post(
            '/api/goals/sprint', json={'text': 'Sprint in Q4', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        assert response.status_code == 201

        # Both should be retrievable for same date
        sprint_response = client.get('/api/goals/sprint/2025-11-10')
        quarterly_response = client.get('/api/goals/quarterly/2025-11-10')

        assert sprint_response.status_code == 200
        assert quarterly_response.status_code == 200

    def test_days_remaining_calculation(self, client: TestClient):
        """Test that days_remaining is calculated correctly based on viewed date."""
        # Create goal
        client.post(
            '/api/goals/sprint', json={'text': 'Test Sprint', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        # Query from different dates
        response_early = client.get('/api/goals/sprint/2025-11-01')  # Start date
        response_mid = client.get('/api/goals/sprint/2025-11-07')  # Middle
        response_late = client.get('/api/goals/sprint/2025-11-13')  # Near end

        assert response_early.json()['days_remaining'] == 13  # 14 days - 1 day
        assert response_mid.json()['days_remaining'] == 7  # 7 days remaining
        assert response_late.json()['days_remaining'] == 1  # 1 day remaining

    def test_empty_goal_text_allowed(self, client: TestClient):
        """Test that empty goal text is accepted (may be a bug, similar to Bug #1 for labels)."""
        response = client.post(
            '/api/goals/sprint', json={'text': '', 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        # Document current behavior
        assert response.status_code == 201
        # Note: Empty text is accepted (similar to Bug #1 for labels)

    def test_goal_with_very_long_text(self, client: TestClient):
        """Test creating goal with very long text."""
        long_text = 'A' * 10000
        response = client.post(
            '/api/goals/sprint', json={'text': long_text, 'start_date': '2025-11-01', 'end_date': '2025-11-14'}
        )

        # Should succeed
        assert response.status_code == 201
        assert len(response.json()['text']) == 10000
