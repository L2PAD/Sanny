"""
CRM routes - Customer notes, tasks, leads, order status
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from database import db
from models.user import User
from models.crm import (
    CustomerNote, CustomerNoteCreate,
    CRMTask, CRMTaskCreate, CRMTaskUpdate,
    Lead, LeadCreate, LeadUpdate
)
from dependencies import get_current_admin

router = APIRouter(prefix="/crm", tags=["CRM"])


# ============= CUSTOMER NOTES =============

@router.get("/customers/{customer_id}/notes")
async def get_customer_notes(
    customer_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Get all notes for a customer"""
    notes = await db.customer_notes.find(
        {"customer_id": customer_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return notes


@router.post("/notes", response_model=CustomerNote)
async def create_customer_note(
    note: CustomerNoteCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a customer note"""
    note_dict = note.model_dump()
    note_dict["id"] = str(uuid.uuid4())
    note_dict["author_id"] = current_user.id
    note_dict["author_name"] = current_user.full_name
    note_dict["created_at"] = datetime.now(timezone.utc)
    
    await db.customer_notes.insert_one(note_dict)
    return CustomerNote(**note_dict)


# ============= TASKS =============

@router.get("/tasks")
async def get_crm_tasks(current_user: User = Depends(get_current_admin)):
    """Get all CRM tasks"""
    tasks = await db.crm_tasks.find({}, {"_id": 0}).sort("due_date", 1).to_list(1000)
    return tasks


@router.post("/tasks", response_model=CRMTask)
async def create_crm_task(
    task: CRMTaskCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a CRM task"""
    task_dict = task.model_dump()
    task_dict["id"] = str(uuid.uuid4())
    task_dict["status"] = "pending"
    task_dict["created_at"] = datetime.now(timezone.utc)
    task_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.crm_tasks.insert_one(task_dict)
    return CRMTask(**task_dict)


@router.put("/tasks/{task_id}")
async def update_crm_task(
    task_id: str,
    task_update: CRMTaskUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a CRM task"""
    update_data = task_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if update_data.get("status") == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc)
    
    result = await db.crm_tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    updated_task = await db.crm_tasks.find_one({"id": task_id}, {"_id": 0})
    return updated_task


@router.delete("/tasks/{task_id}")
async def delete_crm_task(
    task_id: str,
    current_user: User = Depends(get_current_admin)
):
    """Delete a CRM task"""
    result = await db.crm_tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": "Task deleted successfully"}


# ============= LEADS =============

@router.get("/leads")
async def get_leads(current_user: User = Depends(get_current_admin)):
    """Get all leads"""
    leads = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return leads


@router.post("/leads", response_model=Lead)
async def create_lead(
    lead: LeadCreate,
    current_user: User = Depends(get_current_admin)
):
    """Create a lead"""
    lead_dict = lead.model_dump()
    lead_dict["id"] = str(uuid.uuid4())
    lead_dict["created_at"] = datetime.now(timezone.utc)
    lead_dict["updated_at"] = datetime.now(timezone.utc)
    
    await db.leads.insert_one(lead_dict)
    return Lead(**lead_dict)


@router.put("/leads/{lead_id}")
async def update_lead(
    lead_id: str,
    lead_update: LeadUpdate,
    current_user: User = Depends(get_current_admin)
):
    """Update a lead"""
    update_data = lead_update.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.leads.update_one(
        {"id": lead_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    updated_lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return updated_lead


# ============= ORDER STATUS (for CRM) =============

@router.put("/order/{order_id}/status")
async def update_order_status(
    order_id: str,
    status: str,
    current_user: User = Depends(get_current_admin)
):
    """Update order status for CRM"""
    valid_statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Create note about status change
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if order:
        note_dict = {
            "id": str(uuid.uuid4()),
            "customer_id": order["buyer_id"],
            "author_id": current_user.id,
            "author_name": current_user.full_name,
            "note": f"Статус заказа #{order.get('order_number', order_id[:8])} изменен на: {status}",
            "type": "order_update",
            "created_at": datetime.now(timezone.utc)
        }
        await db.customer_notes.insert_one(note_dict)
    
    return {"success": True, "order_id": order_id, "new_status": status}
