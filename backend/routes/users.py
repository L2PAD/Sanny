"""
User routes
"""
from fastapi import APIRouter, HTTPException, Depends

from database import db
from models.user import User
from dependencies import verify_password, get_password_hash, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.put("/me", response_model=User)
async def update_my_profile(
    update_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    # Remove fields that shouldn't be updated this way
    update_data.pop("password", None)
    update_data.pop("password_hash", None)
    update_data.pop("role", None)
    update_data.pop("id", None)
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id}, {"_id": 0})
    updated_user.pop("password_hash", None)
    
    return User(**updated_user)


@router.post("/change-password")
async def change_password(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """Change user password"""
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Требуются текущий и новый пароль")
    
    # Verify current password
    user_doc = await db.users.find_one({"id": current_user.id})
    if not verify_password(current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверный текущий пароль")
    
    # Hash and save new password
    new_password_hash = get_password_hash(new_password)
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": "Пароль успешно изменен"}


@router.post("/change-email")
async def change_email(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """Change user email"""
    new_email = data.get("new_email")
    current_password = data.get("current_password")
    
    if not new_email or not current_password:
        raise HTTPException(status_code=400, detail="Требуются новый email и текущий пароль")
    
    # Verify current password
    user_doc = await db.users.find_one({"id": current_user.id})
    if not verify_password(current_password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверный пароль")
    
    # Check if email already exists
    existing = await db.users.find_one({"email": new_email})
    if existing:
        raise HTTPException(status_code=400, detail="Email уже используется")
    
    # Update email
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"email": new_email}}
    )
    
    return {"message": "Email успешно изменен"}
