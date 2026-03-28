from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from database import initialize_database, get_students, save_students

router = APIRouter()

class SignupData(BaseModel):
    name: str
    branch: str
    year: str
    password: str

class LoginData(BaseModel):
    name: str
    password: str

@router.post("/signup")
def signup(data: SignupData):
    # Call initialize_database()
    initialize_database()
    
    # Read students.xlsx
    df = get_students()
    
    # Ensure fields are non-empty
    if not data.name or not data.branch or not data.year or not data.password:
        return {"status": "error", "message": "All fields are required"}

    # Check if a student with the same name already exists
    if not df.empty and data.name in df["name"].values:
        return {
            "status": "error",
            "message": "User already registered"
        }
    
    # Otherwise append new student row
    new_user = {
        "name": data.name,
        "branch": data.branch,
        "year": data.year,
        "password": data.password
    }
    
    df = pd.concat([df, pd.DataFrame([new_user])], ignore_index=True)
    
    # Save updated dataframe
    save_students(df)
    
    return {
        "status": "success",
        "message": "Signup successful"
    }

@router.post("/login")
def login(data: LoginData):

    import pandas as pd

    df = pd.read_excel("database/students.xlsx", engine="openpyxl")

    # Convert to string to avoid Excel numeric issues
    df["name"] = df["name"].astype(str).str.strip()
    df["password"] = df["password"].astype(str).str.strip()

    name = str(data.name).strip()
    password = str(data.password).strip()

    user = df[(df["name"] == name) & (df["password"] == password)]

    if user.empty:
        return {"status": "error", "message": "Invalid credentials"}

    student = user.iloc[0]

    return {
        "status": "success",
        "name": student["name"],
        "branch": student["branch"],
        "year": student["year"]
    }