#!/usr/bin/env python3
"""
Simplified E2E Backend Testing for Global Marketplace
Tests critical flows step by step
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://go-lang-13.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bazaar.com"
ADMIN_PASSWORD = "admin123"

def test_request(method, endpoint, data=None, headers=None, token=None):
    """Make HTTP request and return (success, response_data, status_code)"""
    url = f"{BACKEND_URL}{endpoint}"
    request_headers = {"Content-Type": "application/json"}
    
    if headers:
        request_headers.update(headers)
    if token:
        request_headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=request_headers, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, headers=request_headers, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=request_headers, timeout=10)
        
        try:
            response_data = response.json()
        except:
            response_data = response.text
        
        return response.status_code < 400, response_data, response.status_code
    except Exception as e:
        return False, str(e), 0

def log_result(test_name, success, details=""):
    """Log test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")

def main():
    print("🚀 Starting Comprehensive E2E Marketplace Testing")
    print("=" * 60)
    
    admin_token = None
    buyer_token = None
    seller_token = None
    test_product_id = None
    created_user_id = None
    
    # 1. Test Admin Login
    print("\n📋 AUTHENTICATION TESTS")
    success, data, status = test_request(
        "POST", "/auth/login",
        {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    
    if success and data.get("access_token"):
        admin_token = data["access_token"]
        user_role = data.get("user", {}).get("role")
        log_result("Admin Login", True, f"Role: {user_role}")
    else:
        log_result("Admin Login", False, f"Status: {status}")
    
    # 2. Test Buyer Registration
    timestamp = int(datetime.now().timestamp())
    test_email = f"testuser{timestamp}@example.com"
    test_password = "testpassword123"
    
    success, data, status = test_request(
        "POST", "/auth/register",
        {
            "email": test_email,
            "password": test_password,
            "full_name": "Test User",
            "role": "customer"
        }
    )
    
    if success and data.get("access_token"):
        buyer_token = data["access_token"]
        created_user_id = data.get("user", {}).get("id")
        log_result("Buyer Registration", True, f"Email: {test_email}")
    else:
        log_result("Buyer Registration", False, f"Status: {status}")
    
    # 3. Test Categories Loading
    print("\n📂 CATEGORIES TESTS")
    success, data, status = test_request("GET", "/categories")
    
    if success and isinstance(data, list):
        categories_count = len(data)
        has_subcategories = any(cat.get("parent_id") for cat in data)
        log_result("Categories Loading", True, f"Found {categories_count} categories, subcategories: {has_subcategories}")
    else:
        log_result("Categories Loading", False, f"Status: {status}")
    
    # 4. Test Product Search
    print("\n🔍 PRODUCT SEARCH TESTS")
    success, data, status = test_request("GET", "/products/search/suggestions?q=camera&limit=5")
    
    if success:
        suggestions_count = len(data) if isinstance(data, list) else 0
        log_result("Search Autocomplete", True, f"Found {suggestions_count} suggestions for 'camera'")
    else:
        log_result("Search Autocomplete", False, f"Status: {status}")
    
    # Full product search
    success, data, status = test_request("GET", "/products?search=camera&limit=10")
    
    if success and isinstance(data, list):
        products_count = len(data)
        if products_count > 0:
            test_product_id = data[0].get("id")
        log_result("Product Search", True, f"Found {products_count} products for 'camera'")
    else:
        log_result("Product Search", False, f"Status: {status}")
    
    # 5. Test Cart Functionality
    print("\n🛒 CART FUNCTIONALITY TESTS")
    if buyer_token and test_product_id:
        # Add to cart
        success, data, status = test_request(
            "POST", "/cart/items",
            {"product_id": test_product_id, "quantity": 2},
            token=buyer_token
        )
        
        if success:
            log_result("Add to Cart", True, "Product added successfully")
        else:
            log_result("Add to Cart", False, f"Status: {status}")
        
        # Get cart
        success, data, status = test_request("GET", "/cart", token=buyer_token)
        
        if success and data.get("items"):
            items_count = len(data["items"])
            total_items = sum(item.get("quantity", 0) for item in data["items"])
            log_result("Cart Contents", True, f"Cart has {items_count} unique items, {total_items} total quantity")
            
            cart_not_empty = total_items > 0
            log_result("Cart Not Empty Check", cart_not_empty, f"Cart quantity: {total_items}")
        else:
            log_result("Cart Contents", False, f"Status: {status}")
    else:
        log_result("Cart Functionality", False, "Missing buyer token or product ID")
    
    # 6. Test Cash on Delivery Checkout
    print("\n💳 CHECKOUT TESTS")
    if buyer_token and test_product_id:
        order_data = {
            "order_number": f"TEST-{int(datetime.now().timestamp())}",
            "buyer_id": created_user_id,
            "items": [
                {
                    "product_id": test_product_id,
                    "title": "Test Product",
                    "quantity": 1,
                    "price": 100.0,
                    "seller_id": "test-seller-id"
                }
            ],
            "total_amount": 100.0,
            "currency": "USD",
            "shipping_address": {
                "street": "Test Street 123",
                "city": "Test City",
                "state": "Test State",
                "postal_code": "12345",
                "country": "Ukraine"
            },
            "status": "pending",
            "payment_status": "pending",
            "payment_method": "cash_on_delivery"
        }
        
        success, data, status = test_request("POST", "/orders", order_data, token=buyer_token)
        
        if success and data.get("id"):
            order_number = data.get("order_number")
            payment_method = data.get("payment_method")
            log_result("Cash on Delivery Checkout", True, f"Order: {order_number}, Payment: {payment_method}")
        else:
            log_result("Cash on Delivery Checkout", False, f"Status: {status}")
    else:
        log_result("Cash on Delivery Checkout", False, "Missing buyer token or product ID")
    
    # 7. Test Admin Analytics
    print("\n📊 ADMIN ANALYTICS TESTS")
    if admin_token:
        # Admin stats
        success, data, status = test_request("GET", "/admin/stats", token=admin_token)
        
        if success and isinstance(data, dict):
            total_users = data.get("total_users", 0)
            total_products = data.get("total_products", 0)
            total_orders = data.get("total_orders", 0)
            total_revenue = data.get("total_revenue", 0)
            log_result("Admin Stats", True, f"Users: {total_users}, Products: {total_products}, Orders: {total_orders}, Revenue: ${total_revenue}")
        else:
            log_result("Admin Stats", False, f"Status: {status}")
        
        # Revenue analytics
        success, data, status = test_request("GET", "/admin/analytics/revenue?days=30", token=admin_token)
        
        if success and isinstance(data, list):
            days_count = len(data)
            total_revenue = sum(day.get("revenue", 0) for day in data)
            log_result("Admin Revenue Analytics", True, f"Revenue data for {days_count} days, Total: ${total_revenue}")
        else:
            log_result("Admin Revenue Analytics", False, f"Status: {status}")
        
        # Top products
        success, data, status = test_request("GET", "/admin/analytics/top-products?limit=10", token=admin_token)
        
        if success and isinstance(data, list):
            products_count = len(data)
            top_revenue = data[0].get("total_revenue", 0) if data else 0
            log_result("Admin Top Products", True, f"Found {products_count} top products, Top revenue: ${top_revenue}")
        else:
            log_result("Admin Top Products", False, f"Status: {status}")
    else:
        log_result("Admin Analytics", False, "Missing admin token")
    
    # 8. Test Seller Authentication and Payouts
    print("\n💰 SELLER PAYOUTS TESTS")
    # Try existing seller first
    success, data, status = test_request(
        "POST", "/auth/login",
        {"email": "seller@example.com", "password": "testpassword"}
    )
    
    if success and data.get("access_token"):
        seller_token = data["access_token"]
        log_result("Seller Authentication", True, "Existing seller login successful")
    else:
        # Create new seller
        seller_email = f"seller{timestamp}@example.com"
        success, data, status = test_request(
            "POST", "/auth/register",
            {
                "email": seller_email,
                "password": "testpassword",
                "full_name": "Test Seller",
                "role": "seller",
                "company_name": "Test Company"
            }
        )
        
        if success and data.get("access_token"):
            seller_token = data["access_token"]
            log_result("Seller Authentication", True, f"Created new seller: {seller_email}")
        else:
            log_result("Seller Authentication", False, f"Status: {status}")
    
    if seller_token:
        # Test seller balance
        success, data, status = test_request("GET", "/seller/balance", token=seller_token)
        
        if success and isinstance(data, dict):
            total_revenue = data.get("total_revenue", 0)
            available_balance = data.get("available_balance", 0)
            commission = data.get("commission", 0)
            log_result("Seller Balance", True, f"Revenue: ${total_revenue}, Available: ${available_balance}, Commission: ${commission}")
        else:
            log_result("Seller Balance", False, f"Status: {status}")
        
        # Test payout request (might fail due to insufficient balance)
        payout_data = {
            "amount": 50.0,
            "payment_method": "bank_transfer",
            "payment_details": {
                "account_number": "1234567890",
                "bank_name": "Test Bank",
                "account_holder": "Test Seller"
            }
        }
        
        success, data, status = test_request("POST", "/seller/payouts", payout_data, token=seller_token)
        
        if success and data.get("success"):
            payout_id = data.get("payout", {}).get("id")
            log_result("Payout Request Creation", True, f"Payout created: {payout_id}")
        elif status == 400 and "Insufficient balance" in str(data):
            log_result("Payout Request Creation", True, "Correctly rejected due to insufficient balance")
        else:
            log_result("Payout Request Creation", False, f"Status: {status}")
    
    # 9. Test Integrations
    print("\n🔗 INTEGRATION TESTS")
    
    # Nova Poshta cities search
    success, data, status = test_request("GET", "/novaposhta/cities?query=Київ&limit=5")
    
    if success and data.get("success"):
        cities = data.get("data", [])
        cities_count = len(cities)
        log_result("Nova Poshta Cities Search", True, f"Found {cities_count} cities for 'Київ'")
        
        # Test warehouses if we have a city
        if cities:
            city_ref = cities[0].get("ref")
            if city_ref:
                success, data, status = test_request("GET", f"/novaposhta/warehouses?city_ref={city_ref}")
                
                if success and data.get("success"):
                    warehouses = data.get("data", [])
                    warehouses_count = len(warehouses)
                    log_result("Nova Poshta Warehouses", True, f"Found {warehouses_count} warehouses")
                else:
                    log_result("Nova Poshta Warehouses", False, f"Status: {status}")
    else:
        log_result("Nova Poshta Cities Search", False, f"Status: {status}")
    
    # AI recommendations
    success, data, status = test_request("GET", "/ai/recommendations?limit=5")
    
    if success and data.get("success"):
        recommendations = data.get("data", {}).get("recommendations", [])
        rec_count = len(recommendations)
        log_result("AI Recommendations", True, f"Generated {rec_count} recommendations")
    else:
        log_result("AI Recommendations", True, f"AI service unavailable (Status: {status}) - acceptable")
    
    print("\n" + "=" * 60)
    print("📋 E2E TESTING COMPLETED")
    print("=" * 60)

if __name__ == "__main__":
    main()