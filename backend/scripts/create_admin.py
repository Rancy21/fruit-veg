"""
create_admin.py
───────────────
Create an admin user for testing the admin dashboard.

Usage:
  cd backend
  python scripts/create_admin.py
"""

import sys
from pathlib import Path

# Make imports work when the script is run directly
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal
from app.services.user_crud import create_user, get_user_by_username, get_role_by_name, create_role
from app.schemas import UserCreate


def create_admin():
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = get_user_by_username(db, "admin")
        if existing_admin:
            print("✓ Admin user already exists")
            print(f"  Username: admin")
            print(f"  Email: {existing_admin.email}")
            return
        
        # Create admin user
        admin_data = UserCreate(
            username="admin",
            email="admin@fruitveg.com",
            full_name="Admin User",
            password="admin123",  # Change this in production!
            phone_number="+1234567890",
            location="New York, NY",
        )
        
        admin_user = create_user(db, admin_data)
        
        # Add admin role
        admin_role = get_role_by_name(db, "admin")
        if not admin_role:
            admin_role = create_role(db, "admin", "Administrator")
        
        admin_user.roles.append(admin_role)
        db.commit()
        
        print("✓ Admin user created successfully!")
        print("\nCredentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\n⚠️  Please change the password after first login!")
        
    except Exception as e:
        print(f"✗ Failed to create admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
