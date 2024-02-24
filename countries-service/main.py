# main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import json
import sys

app = FastAPI()

origins = [
    '*'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Specify the path to the countries JSON file
countries_file_path = "./app/countries.json"

# Check if the file path exists
if not os.path.exists(countries_file_path):
    print(f"Error: The file '{countries_file_path}' does not exist.")
    sys.exit(1)

# Load countries from JSON file at startup
with open(countries_file_path, "r") as file:
    countries = json.load(file)

def get_country_by_code(country_code: str):
    country = next((c for c in countries if c["code"].upper() == country_code.upper()), None)
    if country is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return country

def get_country_by_name(country_name: str):
    country = next((c for c in countries if c["name"].lower() == country_name.lower()), None)
    if country is None:
        raise HTTPException(status_code=404, detail="Country not found")
    return country

@app.get("/countries", response_model=List[dict])
def get_countries():
    return countries

@app.get("/countries/code/{country_code}", response_model=dict)
def get_country_code(country_code: str):
    return get_country_by_code(country_code)

@app.get("/countries/name/{country_name}", response_model=dict)
def get_country_name(country_name: str):
    return get_country_by_name(country_name)
