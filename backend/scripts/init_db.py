"""Database initialization script - can be run standalone"""
import asyncio
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import init_db, close_db


async def main():
    print("Initializing database...")
    await init_db()
    print("Database tables created successfully!")
    await close_db()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
