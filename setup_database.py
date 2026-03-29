"""
setup_database.py
=================
Creates the MySQL database 'student_analytics', creates the
'student_metrics' table, and imports the CSV dataset into it.

Run ONCE before launching the Streamlit dashboard:
    python setup_database.py
"""

import os
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "3306")
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME     = os.getenv("DB_NAME", "student_analytics")

CSV_PATH = r"./Dataset/student_productivity_distraction_dataset_20000.csv"
TABLE    = "student_metrics"

# ── Step 1: Connect WITHOUT specifying a database to create it ─────────────
print("🔌 Connecting to MySQL as root...")
base_url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/"

try:
    engine_base = create_engine(base_url)
    with engine_base.connect() as conn:
        print(f"✅ Connected to MySQL server!")

        # Create DB if it doesn't exist
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`"))
        conn.execute(text("COMMIT"))
        print(f"✅ Database '{DB_NAME}' — ready!")

except Exception as e:
    print(f"❌ Could not connect to MySQL: {e}")
    exit(1)

# ── Step 2: Connect TO the new database ───────────────────────────────────
print(f"\n📂 Loading CSV from:\n   {os.path.abspath(CSV_PATH)}")
try:
    df = pd.read_csv(CSV_PATH)
    print(f"✅ CSV loaded: {len(df):,} rows × {len(df.columns)} columns")
except FileNotFoundError:
    print(f"❌ CSV file not found at: {os.path.abspath(CSV_PATH)}")
    exit(1)

# Add Total_Screen_Time_Hours column if it doesn't exist in CSV
if "Total_Screen_Time_Hours" not in df.columns:
    df["Total_Screen_Time_Hours"] = (
        df["social_media_hours"] + df["youtube_hours"] + df["gaming_hours"]
    )
    print("ℹ️  'Total_Screen_Time_Hours' computed from social_media + youtube + gaming hours.")

# ── Step 3: Write DataFrame to MySQL ──────────────────────────────────────
print(f"\n📤 Importing data into '{DB_NAME}.{TABLE}'...")
try:
    db_url = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine  = create_engine(db_url)

    df.to_sql(
        name       = TABLE,
        con        = engine,
        if_exists  = "replace",   # drops & recreates table if already exists
        index      = False,
        chunksize  = 500,
        method     = "multi",
    )
    print(f"✅ {len(df):,} rows imported into '{TABLE}' successfully!")

    # Verify
    with engine.connect() as conn:
        count = conn.execute(text(f"SELECT COUNT(*) FROM {TABLE}")).fetchone()[0]
        print(f"✅ Verification — rows in MySQL table: {count:,}")

    print("\n🎉 Database setup complete!")
    print("👉 You can now run:  streamlit run dashboard.py")

except Exception as e:
    print(f"❌ Import failed: {e}")
    exit(1)
