"""
Test file for Threaded Comments/Chat API
Tests all comment endpoints: GET, POST, REACT, DELETE, COUNT
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
TEST_PRODUCT_ID = "4a705dfd-a5cd-4765-a1db-5485572d5f26"

# Credentials
ADMIN_EMAIL = "admin@ystore.com"
ADMIN_PASSWORD = "admin"


class TestCommentsAPI:
    """Test suite for threaded comments API"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, auth_token):
        """Headers with auth token"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }
    
    # Test: GET threaded comments
    def test_get_product_comments_threaded(self):
        """Test GET /api/comments/product/{product_id} returns threaded structure"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Verify structure of at least one comment
        if len(data) > 0:
            comment = data[0]
            assert "id" in comment
            assert "product_id" in comment
            assert "user_id" in comment
            assert "user_name" in comment
            assert "comment" in comment
            assert "reactions" in comment
            assert "replies" in comment
            assert "created_at" in comment
            print(f"Found {len(data)} top-level comments with threaded structure")
    
    # Test: GET flat comments
    def test_get_product_comments_flat(self):
        """Test GET /api/comments/product/{product_id}/flat returns flat list"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}/flat")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} total comments (flat)")
    
    # Test: GET comments count
    def test_get_comments_count(self):
        """Test GET /api/comments/count/{product_id} returns count"""
        response = requests.get(f"{BASE_URL}/api/comments/count/{TEST_PRODUCT_ID}")
        
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 0
        print(f"Comments count: {data['count']}")
    
    # Test: Create comment requires auth
    def test_create_comment_requires_auth(self):
        """Test POST /api/comments without auth returns 401/403"""
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json={
                "product_id": TEST_PRODUCT_ID,
                "comment": "Test comment without auth"
            }
        )
        
        assert response.status_code in [401, 403]
        print("Create comment correctly requires authentication")
    
    # Test: Create new comment (top-level)
    def test_create_top_level_comment(self, auth_headers):
        """Test POST /api/comments creates a new top-level comment"""
        test_comment = f"TEST_Comment_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/comments",
            headers=auth_headers,
            json={
                "product_id": TEST_PRODUCT_ID,
                "comment": test_comment,
                "parent_id": None
            }
        )
        
        assert response.status_code == 200, f"Failed to create comment: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "id" in data
        assert data["comment"] == test_comment
        assert data["product_id"] == TEST_PRODUCT_ID
        assert data["parent_id"] is None
        assert "user_name" in data
        assert "user_id" in data
        
        print(f"Created comment with ID: {data['id']}")
        return data["id"]
    
    # Test: Create reply with parent_id
    def test_create_reply_comment(self, auth_headers):
        """Test POST /api/comments with parent_id creates a reply"""
        # First get existing comments to find a parent
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        assert len(comments) > 0, "No comments found to reply to"
        parent_id = comments[0]["id"]
        
        test_reply = f"TEST_Reply_{uuid.uuid4().hex[:8]}"
        
        response = requests.post(
            f"{BASE_URL}/api/comments",
            headers=auth_headers,
            json={
                "product_id": TEST_PRODUCT_ID,
                "comment": test_reply,
                "parent_id": parent_id
            }
        )
        
        assert response.status_code == 200, f"Failed to create reply: {response.text}"
        data = response.json()
        
        # Verify reply structure
        assert data["parent_id"] == parent_id
        assert data["comment"] == test_reply
        
        print(f"Created reply to {parent_id}: {data['id']}")
        return data["id"]
    
    # Test: Reply to non-existent parent fails
    def test_create_reply_invalid_parent(self, auth_headers):
        """Test POST /api/comments with invalid parent_id returns 404"""
        fake_parent_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/comments",
            headers=auth_headers,
            json={
                "product_id": TEST_PRODUCT_ID,
                "comment": "Reply to non-existent",
                "parent_id": fake_parent_id
            }
        )
        
        assert response.status_code == 404
        print("Invalid parent_id correctly returns 404")
    
    # Test: React to comment (add like)
    def test_react_to_comment_like(self, auth_headers):
        """Test POST /api/comments/{id}/react with 'likes' reaction"""
        # Get a comment to react to
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        assert len(comments) > 0, "No comments to react to"
        comment_id = comments[0]["id"]
        
        # Add like reaction
        response = requests.post(
            f"{BASE_URL}/api/comments/{comment_id}/react",
            headers=auth_headers,
            params={"reaction_type": "likes"}
        )
        
        assert response.status_code == 200, f"React failed: {response.text}"
        data = response.json()
        
        assert "success" in data
        assert data["success"] == True
        assert "reacted" in data
        assert "reactions" in data
        
        print(f"Reacted to comment {comment_id}: {data}")
    
    # Test: React to comment (add heart)
    def test_react_to_comment_heart(self, auth_headers):
        """Test POST /api/comments/{id}/react with 'hearts' reaction"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        assert len(comments) > 0
        comment_id = comments[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{comment_id}/react",
            headers=auth_headers,
            params={"reaction_type": "hearts"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"Heart reaction added: {data['reactions']}")
    
    # Test: Invalid reaction type
    def test_react_invalid_type(self, auth_headers):
        """Test POST /api/comments/{id}/react with invalid reaction type returns 400"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        assert len(comments) > 0
        comment_id = comments[0]["id"]
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{comment_id}/react",
            headers=auth_headers,
            params={"reaction_type": "invalid"}
        )
        
        assert response.status_code == 400
        print("Invalid reaction type correctly returns 400")
    
    # Test: React to non-existent comment
    def test_react_to_nonexistent_comment(self, auth_headers):
        """Test reacting to non-existent comment returns 404"""
        fake_id = str(uuid.uuid4())
        
        response = requests.post(
            f"{BASE_URL}/api/comments/{fake_id}/react",
            headers=auth_headers,
            params={"reaction_type": "likes"}
        )
        
        assert response.status_code == 404
        print("React to non-existent comment correctly returns 404")
    
    # Test: React requires auth
    def test_react_requires_auth(self):
        """Test POST /api/comments/{id}/react without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        if len(comments) > 0:
            comment_id = comments[0]["id"]
            response = requests.post(
                f"{BASE_URL}/api/comments/{comment_id}/react",
                params={"reaction_type": "likes"}
            )
            assert response.status_code in [401, 403]
            print("React correctly requires authentication")
    
    # Test: Delete own comment
    def test_delete_own_comment(self, auth_headers):
        """Test DELETE /api/comments/{id} deletes own comment"""
        # First create a test comment to delete
        test_comment = f"TEST_ToDelete_{uuid.uuid4().hex[:8]}"
        
        create_response = requests.post(
            f"{BASE_URL}/api/comments",
            headers=auth_headers,
            json={
                "product_id": TEST_PRODUCT_ID,
                "comment": test_comment
            }
        )
        
        assert create_response.status_code == 200
        comment_id = create_response.json()["id"]
        
        # Now delete it
        delete_response = requests.delete(
            f"{BASE_URL}/api/comments/{comment_id}",
            headers=auth_headers
        )
        
        assert delete_response.status_code == 200
        data = delete_response.json()
        assert "message" in data
        
        # Verify it's deleted
        verify_response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}/flat")
        all_ids = [c["id"] for c in verify_response.json()]
        assert comment_id not in all_ids, "Comment was not deleted"
        
        print(f"Successfully deleted comment {comment_id}")
    
    # Test: Delete requires auth
    def test_delete_requires_auth(self):
        """Test DELETE /api/comments/{id} without auth returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        comments = response.json()
        
        if len(comments) > 0:
            comment_id = comments[0]["id"]
            response = requests.delete(f"{BASE_URL}/api/comments/{comment_id}")
            assert response.status_code in [401, 403]
            print("Delete correctly requires authentication")
    
    # Test: Delete non-existent comment
    def test_delete_nonexistent_comment(self, auth_headers):
        """Test DELETE /api/comments/{id} for non-existent comment returns 404"""
        fake_id = str(uuid.uuid4())
        
        response = requests.delete(
            f"{BASE_URL}/api/comments/{fake_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 404
        print("Delete non-existent comment correctly returns 404")
    
    # Test: Verify threaded structure integrity
    def test_threaded_structure_integrity(self):
        """Verify replies are nested correctly in parent comments"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}")
        
        assert response.status_code == 200
        comments = response.json()
        
        # Check that parent_id is None for top-level comments
        for comment in comments:
            assert comment["parent_id"] is None, "Top-level comment has parent_id"
            
            # Check replies have the correct parent_id
            for reply in comment.get("replies", []):
                assert reply["parent_id"] == comment["id"], "Reply parent_id mismatch"
        
        print("Threaded structure integrity verified")


class TestCommentsCleanup:
    """Cleanup test data after all tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_cleanup_test_comments(self, auth_headers):
        """Clean up TEST_ prefixed comments"""
        response = requests.get(f"{BASE_URL}/api/comments/product/{TEST_PRODUCT_ID}/flat")
        comments = response.json()
        
        deleted = 0
        for comment in comments:
            if comment["comment"].startswith("TEST_"):
                del_response = requests.delete(
                    f"{BASE_URL}/api/comments/{comment['id']}",
                    headers=auth_headers
                )
                if del_response.status_code == 200:
                    deleted += 1
        
        print(f"Cleaned up {deleted} test comments")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
