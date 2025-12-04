#!/usr/bin/env python3
"""
CRM API Endpoints Testing
Tests all CRM functionality: dashboard, customers, notes, tasks, leads, image upload
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configuration
BACKEND_URL = "https://goapp-7.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@bazaar.com"
ADMIN_PASSWORD = "admin123"

class CRMTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.admin_user_id = None
        self.test_results = []
        self.test_customer_id = None
        self.test_note_id = None
        self.test_task_id = None
        self.test_lead_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {json.dumps(response_data, indent=2)[:500]}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, 
                          headers: Dict = None, token: str = None, files: Dict = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = {}
        
        if not files:
            request_headers["Content-Type"] = "application/json"
        
        if headers:
            request_headers.update(headers)
        if token:
            request_headers["Authorization"] = f"Bearer {token}"
        
        try:
            if files:
                # For file uploads
                form_data = aiohttp.FormData()
                for key, value in files.items():
                    form_data.add_field(key, value)
                
                async with self.session.request(
                    method, url,
                    data=form_data,
                    headers=request_headers,
                    timeout=30
                ) as response:
                    try:
                        response_data = await response.json()
                    except:
                        response_data = await response.text()
                    
                    return response.status < 400, response_data, response.status
            else:
                # For JSON requests
                async with self.session.request(
                    method, url, 
                    json=data if data else None,
                    headers=request_headers,
                    timeout=30
                ) as response:
                    try:
                        response_data = await response.json()
                    except:
                        response_data = await response.text()
                    
                    return response.status < 400, response_data, response.status
        except Exception as e:
            return False, str(e), 0
    
    # ============= AUTHENTICATION =============
    
    async def test_admin_login(self):
        """Test admin authentication"""
        success, data, status = await self.make_request(
            "POST", "/auth/login",
            {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        
        if success and data.get("access_token"):
            self.admin_token = data["access_token"]
            self.admin_user_id = data.get("user", {}).get("id")
            user_role = data.get("user", {}).get("role")
            self.log_result("Admin Login", True, f"Role: {user_role}, User ID: {self.admin_user_id}")
            return True
        else:
            self.log_result("Admin Login", False, f"Status: {status}", data)
            return False
    
    # ============= CRM DASHBOARD =============
    
    async def test_crm_dashboard(self):
        """Test CRM Dashboard - GET /api/crm/dashboard"""
        if not self.admin_token:
            self.log_result("CRM Dashboard", False, "Missing admin token")
            return False
        
        success, data, status = await self.make_request(
            "GET", "/crm/dashboard",
            token=self.admin_token
        )
        
        if success and isinstance(data, dict):
            # Check for required fields
            required_fields = [
                "sales_funnel", "customer_segments", "customer_activity",
                "pending_tasks", "overdue_tasks", "new_customers_week"
            ]
            
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                self.log_result(
                    "CRM Dashboard", 
                    True, 
                    f"All required fields present: {', '.join(required_fields)}"
                )
                return True
            else:
                self.log_result(
                    "CRM Dashboard", 
                    False, 
                    f"Missing fields: {', '.join(missing_fields)}", 
                    data
                )
                return False
        else:
            self.log_result("CRM Dashboard", False, f"Status: {status}", data)
            return False
    
    # ============= CUSTOMERS =============
    
    async def test_customers_list(self):
        """Test Customers List - GET /api/crm/customers"""
        if not self.admin_token:
            self.log_result("Customers List", False, "Missing admin token")
            return False
        
        success, data, status = await self.make_request(
            "GET", "/crm/customers",
            token=self.admin_token
        )
        
        if success and isinstance(data, list):
            customers_count = len(data)
            
            # Check if customers have required metrics
            if customers_count > 0:
                first_customer = data[0]
                self.test_customer_id = first_customer.get("id")
                
                required_metrics = ["total_orders", "total_spent", "avg_order_value", "segment"]
                has_metrics = all(metric in first_customer for metric in required_metrics)
                
                if has_metrics:
                    self.log_result(
                        "Customers List", 
                        True, 
                        f"Found {customers_count} customers with metrics: {', '.join(required_metrics)}"
                    )
                    return True
                else:
                    missing_metrics = [m for m in required_metrics if m not in first_customer]
                    self.log_result(
                        "Customers List", 
                        False, 
                        f"Missing metrics: {', '.join(missing_metrics)}", 
                        first_customer
                    )
                    return False
            else:
                self.log_result("Customers List", True, "No customers found (empty list is valid)")
                return True
        else:
            self.log_result("Customers List", False, f"Status: {status}", data)
            return False
    
    async def test_customer_profile(self):
        """Test Customer Profile - GET /api/crm/customer/{customer_id}"""
        if not self.admin_token:
            self.log_result("Customer Profile", False, "Missing admin token")
            return False
        
        if not self.test_customer_id:
            self.log_result("Customer Profile", False, "No customer ID available from customers list")
            return False
        
        success, data, status = await self.make_request(
            "GET", f"/crm/customer/{self.test_customer_id}",
            token=self.admin_token
        )
        
        if success and isinstance(data, dict):
            # Check for required profile fields
            required_fields = ["orders", "notes", "tasks"]
            has_fields = all(field in data for field in required_fields)
            
            if has_fields:
                orders_count = len(data.get("orders", []))
                notes_count = len(data.get("notes", []))
                tasks_count = len(data.get("tasks", []))
                
                self.log_result(
                    "Customer Profile", 
                    True, 
                    f"Profile loaded: {orders_count} orders, {notes_count} notes, {tasks_count} tasks"
                )
                return True
            else:
                missing_fields = [f for f in required_fields if f not in data]
                self.log_result(
                    "Customer Profile", 
                    False, 
                    f"Missing fields: {', '.join(missing_fields)}", 
                    data
                )
                return False
        else:
            self.log_result("Customer Profile", False, f"Status: {status}", data)
            return False
    
    # ============= CUSTOMER NOTES =============
    
    async def test_create_customer_note(self):
        """Test Create Customer Note - POST /api/crm/notes"""
        if not self.admin_token:
            self.log_result("Create Customer Note", False, "Missing admin token")
            return False
        
        if not self.test_customer_id:
            self.log_result("Create Customer Note", False, "No customer ID available")
            return False
        
        note_data = {
            "customer_id": self.test_customer_id,
            "note": f"Test note created at {datetime.now().isoformat()}",
            "type": "general"
        }
        
        success, data, status = await self.make_request(
            "POST", "/crm/notes",
            note_data,
            token=self.admin_token
        )
        
        if success and data.get("id"):
            self.test_note_id = data["id"]
            note_text = data.get("note", "")[:50]
            self.log_result(
                "Create Customer Note", 
                True, 
                f"Note created: {note_text}..."
            )
            return True
        else:
            self.log_result("Create Customer Note", False, f"Status: {status}", data)
            return False
    
    async def test_get_customer_notes(self):
        """Test Get Customer Notes - GET /api/crm/notes/{customer_id}"""
        if not self.admin_token:
            self.log_result("Get Customer Notes", False, "Missing admin token")
            return False
        
        if not self.test_customer_id:
            self.log_result("Get Customer Notes", False, "No customer ID available")
            return False
        
        success, data, status = await self.make_request(
            "GET", f"/crm/notes/{self.test_customer_id}",
            token=self.admin_token
        )
        
        if success and isinstance(data, list):
            notes_count = len(data)
            self.log_result(
                "Get Customer Notes", 
                True, 
                f"Found {notes_count} notes for customer"
            )
            return True
        else:
            self.log_result("Get Customer Notes", False, f"Status: {status}", data)
            return False
    
    # ============= TASKS =============
    
    async def test_create_task(self):
        """Test Create Task - POST /api/crm/tasks"""
        if not self.admin_token or not self.admin_user_id:
            self.log_result("Create Task", False, "Missing admin token or user ID")
            return False
        
        task_data = {
            "title": f"Test task created at {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "description": "This is a test task for CRM testing",
            "priority": "medium",
            "type": "follow_up",
            "assigned_to": self.admin_user_id
        }
        
        success, data, status = await self.make_request(
            "POST", "/crm/tasks",
            task_data,
            token=self.admin_token
        )
        
        if success and data.get("id"):
            self.test_task_id = data["id"]
            task_title = data.get("title", "")
            task_priority = data.get("priority", "")
            self.log_result(
                "Create Task", 
                True, 
                f"Task created: {task_title} (Priority: {task_priority})"
            )
            return True
        else:
            self.log_result("Create Task", False, f"Status: {status}", data)
            return False
    
    async def test_get_tasks(self):
        """Test Get Tasks - GET /api/crm/tasks"""
        if not self.admin_token:
            self.log_result("Get Tasks", False, "Missing admin token")
            return False
        
        success, data, status = await self.make_request(
            "GET", "/crm/tasks",
            token=self.admin_token
        )
        
        if success and isinstance(data, list):
            tasks_count = len(data)
            pending_tasks = sum(1 for task in data if task.get("status") == "pending")
            
            self.log_result(
                "Get Tasks", 
                True, 
                f"Found {tasks_count} tasks ({pending_tasks} pending)"
            )
            return True
        else:
            self.log_result("Get Tasks", False, f"Status: {status}", data)
            return False
    
    # ============= LEADS =============
    
    async def test_create_lead(self):
        """Test Create Lead - POST /api/crm/leads"""
        if not self.admin_token:
            self.log_result("Create Lead", False, "Missing admin token")
            return False
        
        timestamp = int(datetime.now().timestamp())
        lead_data = {
            "name": f"Test Lead {timestamp}",
            "email": f"testlead{timestamp}@example.com",
            "source": "website"
        }
        
        success, data, status = await self.make_request(
            "POST", "/crm/leads",
            lead_data,
            token=self.admin_token
        )
        
        if success and data.get("id"):
            self.test_lead_id = data["id"]
            lead_name = data.get("name", "")
            lead_email = data.get("email", "")
            self.log_result(
                "Create Lead", 
                True, 
                f"Lead created: {lead_name} ({lead_email})"
            )
            return True
        else:
            self.log_result("Create Lead", False, f"Status: {status}", data)
            return False
    
    async def test_get_leads(self):
        """Test Get Leads - GET /api/crm/leads"""
        if not self.admin_token:
            self.log_result("Get Leads", False, "Missing admin token")
            return False
        
        success, data, status = await self.make_request(
            "GET", "/crm/leads",
            token=self.admin_token
        )
        
        if success and isinstance(data, list):
            leads_count = len(data)
            new_leads = sum(1 for lead in data if lead.get("status") == "new")
            
            self.log_result(
                "Get Leads", 
                True, 
                f"Found {leads_count} leads ({new_leads} new)"
            )
            return True
        else:
            self.log_result("Get Leads", False, f"Status: {status}", data)
            return False
    
    # ============= IMAGE UPLOAD =============
    
    async def test_image_upload(self):
        """Test Image Upload - POST /api/upload/image"""
        if not self.admin_token:
            self.log_result("Image Upload", False, "Missing admin token")
            return False
        
        # Create a simple test image (1x1 pixel PNG)
        test_image_data = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\x00\x01'
            b'\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        
        try:
            # Create form data with file
            form_data = aiohttp.FormData()
            form_data.add_field('image',
                              test_image_data,
                              filename='test.png',
                              content_type='image/png')
            
            url = f"{BACKEND_URL}/upload/image"
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.post(url, data=form_data, headers=headers, timeout=30) as response:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
                
                success = response.status < 400
                
                if success and (response_data.get("url") or response_data.get("image_url")):
                    image_url = response_data.get("url") or response_data.get("image_url")
                    self.log_result(
                        "Image Upload", 
                        True, 
                        f"Image uploaded successfully: {image_url[:50]}..."
                    )
                    return True
                else:
                    self.log_result("Image Upload", False, f"Status: {response.status}", response_data)
                    return False
        except Exception as e:
            self.log_result("Image Upload", False, f"Exception: {str(e)}")
            return False
    
    # ============= MAIN TEST RUNNER =============
    
    async def run_all_crm_tests(self):
        """Run all CRM tests in sequence"""
        print("🚀 Starting CRM API Endpoints Testing")
        print("=" * 60)
        
        # 1. Authentication
        print("\n📋 AUTHENTICATION")
        if not await self.test_admin_login():
            print("❌ Cannot proceed without admin authentication")
            return
        
        # 2. CRM Dashboard
        print("\n📊 CRM DASHBOARD")
        await self.test_crm_dashboard()
        
        # 3. Customers
        print("\n👥 CUSTOMERS")
        await self.test_customers_list()
        await self.test_customer_profile()
        
        # 4. Customer Notes
        print("\n📝 CUSTOMER NOTES")
        await self.test_create_customer_note()
        await self.test_get_customer_notes()
        
        # 5. Tasks
        print("\n✅ TASKS")
        await self.test_create_task()
        await self.test_get_tasks()
        
        # 6. Leads
        print("\n🎯 LEADS")
        await self.test_create_lead()
        await self.test_get_leads()
        
        # 7. Image Upload
        print("\n🖼️ IMAGE UPLOAD")
        await self.test_image_upload()
        
        # Summary
        print("\n" + "=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        return passed_tests, failed_tests, self.test_results


async def main():
    """Main test runner"""
    async with CRMTester() as tester:
        passed, failed, results = await tester.run_all_crm_tests()
        
        # Exit with error code if tests failed
        if failed > 0:
            print(f"\n⚠️ {failed} test(s) failed")
            sys.exit(1)
        else:
            print("\n🎉 All CRM tests passed!")
            sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
