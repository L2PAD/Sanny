"""
Backend API Tests for Y-Store Marketplace Refactoring

Tests cover:
- Health check (version 2.0.0, modular architecture)
- Categories endpoint
- Products endpoint
- Auth endpoints (login, me)
- Popular categories, Promotions, Custom sections
- Featured reviews
- Sitemap XML
"""
import pytest
import requests
import os

# Use the public backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://store-rebuild-3.preview.emergentagent.com"

# Test credentials
ADMIN_EMAIL = "admin@ystore.com"
ADMIN_PASSWORD = "admin"


class TestHealthCheck:
    """Health check endpoint - verify modular architecture"""
    
    def test_health_endpoint_returns_200(self):
        """GET /api/health should return 200"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.text}"
        print(f"✓ Health check returned 200")
    
    def test_health_returns_version_2_0_0(self):
        """Health should return version 2.0.0 for modular architecture"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("version") == "2.0.0", f"Expected version 2.0.0, got {data.get('version')}"
        print(f"✓ Version is 2.0.0")
    
    def test_health_returns_modular_architecture(self):
        """Health should indicate modular architecture"""
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("architecture") == "modular", f"Expected architecture 'modular', got {data.get('architecture')}"
        print(f"✓ Architecture is modular")


class TestCategoriesEndpoint:
    """Categories endpoint tests"""
    
    def test_get_categories_returns_200(self):
        """GET /api/categories should return 200"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200, f"Categories failed: {response.text}"
        print(f"✓ Categories endpoint returned 200")
    
    def test_get_categories_returns_list(self):
        """Categories should return a list"""
        response = requests.get(f"{BASE_URL}/api/categories")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Categories returns list with {len(data)} items")
    
    def test_get_categories_tree_format(self):
        """GET /api/categories?tree=true should return tree structure"""
        response = requests.get(f"{BASE_URL}/api/categories", params={"tree": "true"})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list), "Tree format should return list"
        print(f"✓ Categories tree format works")


class TestProductsEndpoint:
    """Products endpoint tests"""
    
    def test_get_products_returns_200(self):
        """GET /api/products should return 200"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Products failed: {response.text}"
        print(f"✓ Products endpoint returned 200")
    
    def test_get_products_returns_list(self):
        """Products should return a list"""
        response = requests.get(f"{BASE_URL}/api/products")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Products returns list with {len(data)} items")
    
    def test_get_products_with_filters(self):
        """Products endpoint should support filters"""
        response = requests.get(f"{BASE_URL}/api/products", params={"skip": 0, "limit": 5})
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5, "Limit should be respected"
        print(f"✓ Products filtering works")
    
    def test_get_products_with_sort(self):
        """Products should support sorting"""
        response = requests.get(f"{BASE_URL}/api/products", params={"sort_by": "price_asc"})
        assert response.status_code == 200
        print(f"✓ Products sorting works")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """POST /api/auth/login should authenticate admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "user" in data, "Response should contain user"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Login with wrong credentials should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Invalid credentials return 401")
    
    def test_get_me_with_valid_token(self):
        """GET /api/auth/me should return current user with valid token"""
        # First login to get token
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Then get current user
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Get me failed: {response.text}"
        
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        print(f"✓ Get current user works")
    
    def test_get_me_without_token(self):
        """GET /api/auth/me without token should fail"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Get me without token returns {response.status_code}")


class TestPopularCategories:
    """Popular categories endpoint tests"""
    
    def test_get_popular_categories_returns_200(self):
        """GET /api/popular-categories should return 200"""
        response = requests.get(f"{BASE_URL}/api/popular-categories")
        assert response.status_code == 200, f"Popular categories failed: {response.text}"
        print(f"✓ Popular categories returned 200")
    
    def test_get_popular_categories_returns_list(self):
        """Popular categories should return a list"""
        response = requests.get(f"{BASE_URL}/api/popular-categories")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Popular categories returns list with {len(data)} items")


class TestPromotions:
    """Promotions endpoint tests"""
    
    def test_get_promotions_returns_200(self):
        """GET /api/promotions should return 200"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        assert response.status_code == 200, f"Promotions failed: {response.text}"
        print(f"✓ Promotions returned 200")
    
    def test_get_promotions_returns_list(self):
        """Promotions should return a list"""
        response = requests.get(f"{BASE_URL}/api/promotions")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Promotions returns list with {len(data)} items")


class TestCustomSections:
    """Custom sections endpoint tests"""
    
    def test_get_custom_sections_returns_200(self):
        """GET /api/custom-sections should return 200"""
        response = requests.get(f"{BASE_URL}/api/custom-sections")
        assert response.status_code == 200, f"Custom sections failed: {response.text}"
        print(f"✓ Custom sections returned 200")
    
    def test_get_custom_sections_returns_list(self):
        """Custom sections should return a list"""
        response = requests.get(f"{BASE_URL}/api/custom-sections")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Custom sections returns list with {len(data)} items")


class TestFeaturedReviews:
    """Featured reviews endpoint tests"""
    
    def test_get_featured_reviews_returns_200(self):
        """GET /api/reviews/featured should return 200"""
        response = requests.get(f"{BASE_URL}/api/reviews/featured")
        assert response.status_code == 200, f"Featured reviews failed: {response.text}"
        print(f"✓ Featured reviews returned 200")
    
    def test_get_featured_reviews_returns_list(self):
        """Featured reviews should return a list"""
        response = requests.get(f"{BASE_URL}/api/reviews/featured")
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ Featured reviews returns list with {len(data)} items")


class TestSitemap:
    """Sitemap XML endpoint tests"""
    
    def test_sitemap_returns_200(self):
        """GET /api/sitemap.xml should return 200"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        assert response.status_code == 200, f"Sitemap failed: {response.text}"
        print(f"✓ Sitemap returned 200")
    
    def test_sitemap_returns_xml(self):
        """Sitemap should return XML content"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        content_type = response.headers.get("content-type", "")
        assert "xml" in content_type.lower(), f"Expected XML content-type, got {content_type}"
        print(f"✓ Sitemap returns XML content-type")
    
    def test_sitemap_contains_valid_xml(self):
        """Sitemap should contain valid XML structure"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml")
        content = response.text
        assert '<?xml version="1.0"' in content, "Missing XML declaration"
        assert '<urlset' in content, "Missing urlset element"
        assert '</urlset>' in content, "Missing closing urlset"
        print(f"✓ Sitemap has valid XML structure")


class TestActualOffers:
    """Actual offers endpoint tests"""
    
    def test_get_actual_offers_returns_200(self):
        """GET /api/actual-offers should return 200"""
        response = requests.get(f"{BASE_URL}/api/actual-offers")
        assert response.status_code == 200, f"Actual offers failed: {response.text}"
        print(f"✓ Actual offers returned 200")


class TestRobotsTxt:
    """Robots.txt endpoint tests"""
    
    def test_robots_txt_returns_200(self):
        """GET /api/robots.txt should return 200"""
        response = requests.get(f"{BASE_URL}/api/robots.txt")
        assert response.status_code == 200, f"Robots.txt failed: {response.text}"
        print(f"✓ Robots.txt returned 200")
    
    def test_robots_txt_returns_text(self):
        """Robots.txt should return text content"""
        response = requests.get(f"{BASE_URL}/api/robots.txt")
        content_type = response.headers.get("content-type", "")
        assert "text" in content_type.lower(), f"Expected text content-type, got {content_type}"
        print(f"✓ Robots.txt returns text content-type")


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
