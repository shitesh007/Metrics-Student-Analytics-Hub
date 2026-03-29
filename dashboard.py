"""
dashboard.py
============
Streamlit KPI Dashboard — Student Productivity & Digital Distraction
Connects to a MySQL database (student_analytics.student_metrics) via SQLAlchemy.
Credentials are loaded from a .env file in the same directory.

Run:
    streamlit run dashboard.py
"""

import os
import streamlit as st
import pandas as pd
import plotly.express as px
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# ── 0. Load environment variables ─────────────────────────────────────────────
load_dotenv()  # reads .env from the current working directory

DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_USER     = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME     = os.getenv("DB_NAME", "student_analytics")
DB_PORT     = os.getenv("DB_PORT", "3306")

# ── 1. Page Config ─────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Student KPI Dashboard",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── 2. Custom CSS (premium dark feel) ─────────────────────────────────────────
st.markdown("""
<style>
    /* Dark background for the whole app */
    .stApp { background-color: #0f1117; color: #e2e8f0; }
    /* Metric cards */
    [data-testid="stMetric"] {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 18px 20px 14px;
    }
    [data-testid="stMetric"] label { color: #94a3b8 !important; font-size:0.78rem !important; }
    [data-testid="stMetricValue"] { color: #c084fc !important; font-size:2rem !important; }
    /* Sidebar */
    [data-testid="stSidebar"] { background: #1e2130; border-right: 1px solid #2d3450; }
    /* Section headers */
    h1, h2, h3 { color: #e2e8f0 !important; }
    /* Divider */
    hr { border-color: #2d3450; }
</style>
""", unsafe_allow_html=True)

# ── 3. Database connection & data loading ──────────────────────────────────────
@st.cache_resource(show_spinner=False)
def get_engine():
    """Create and cache a SQLAlchemy engine for MySQL."""
    url = (
        f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    return create_engine(url, pool_pre_ping=True)


@st.cache_data(show_spinner="⏳ Loading student data from MySQL…", ttl=300)
def load_data() -> pd.DataFrame:
    """Pull the entire student_metrics table into a DataFrame. Cached for 5 min."""
    try:
        engine = get_engine()
        with engine.connect() as conn:
            df = pd.read_sql(text("SELECT * FROM student_metrics"), conn)
        return df
    except Exception as exc:
        st.error(
            f"❌ **Database connection failed.**\n\n"
            f"```\n{exc}\n```\n\n"
            "Check your `.env` credentials and make sure MySQL is running."
        )
        st.stop()


# ── 4. Load data ───────────────────────────────────────────────────────────────
with st.spinner("Connecting to MySQL…"):
    df_raw = load_data()

# ── 5. Sidebar Filters ─────────────────────────────────────────────────────────
st.sidebar.title("🎛️ Filters")
st.sidebar.markdown("---")

# Gender filter
all_genders = ["All"] + sorted(df_raw["gender"].dropna().unique().tolist())
selected_gender = st.sidebar.selectbox("👤 Gender", all_genders)

# Sleep hours slider
min_sleep = float(df_raw["sleep_hours"].min())
max_sleep = float(df_raw["sleep_hours"].max())
sleep_range = st.sidebar.slider(
    "😴 Sleep Hours",
    min_value=round(min_sleep, 1),
    max_value=round(max_sleep, 1),
    value=(round(min_sleep, 1), round(max_sleep, 1)),
    step=0.5,
)

st.sidebar.markdown("---")
st.sidebar.caption("Data source: MySQL · student_analytics.student_metrics")

# Apply filters
df = df_raw.copy()
if selected_gender != "All":
    df = df[df["gender"] == selected_gender]
df = df[
    (df["sleep_hours"] >= sleep_range[0]) &
    (df["sleep_hours"] <= sleep_range[1])
]

# ── 6. Header ──────────────────────────────────────────────────────────────────
st.title("🎓 NexMetrics: Student Analytics Hub")
st.caption(
    f"Showing **{len(df):,}** of **{len(df_raw):,}** students "
    f"| Gender: `{selected_gender}` | Sleep: `{sleep_range[0]}–{sleep_range[1]} hrs`"
)
st.markdown("---")

# ── 7. KPI Metric Cards (Top Row) ─────────────────────────────────────────────
col1, col2, col3, col4 = st.columns(4)

avg_grade       = df["final_grade"].mean()
avg_productivity = df["productivity_score"].mean()
avg_screen_time  = df["Total_Screen_Time_Hours"].mean()
avg_sleep        = df["sleep_hours"].mean()

# Deltas vs full dataset (helpful context when filters are active)
delta_grade       = avg_grade       - df_raw["final_grade"].mean()
delta_productivity = avg_productivity - df_raw["productivity_score"].mean()
delta_screen       = avg_screen_time  - df_raw["Total_Screen_Time_Hours"].mean()
delta_sleep        = avg_sleep        - df_raw["sleep_hours"].mean()

with col1:
    st.metric(
        "📊 Average Final Grade",
        f"{avg_grade:.1f}",
        delta=f"{delta_grade:+.1f} vs all" if selected_gender != "All" else None,
    )
with col2:
    st.metric(
        "🎯 Avg Productivity Score",
        f"{avg_productivity:.1f}",
        delta=f"{delta_productivity:+.1f} vs all" if selected_gender != "All" else None,
    )
with col3:
    st.metric(
        "📱 Avg Daily Screen Time",
        f"{avg_screen_time:.2f} hrs",
        delta=f"{delta_screen:+.2f} vs all" if selected_gender != "All" else None,
        delta_color="inverse",   # more screen time → negative
    )
with col4:
    st.metric(
        "😴 Avg Sleep Hours",
        f"{avg_sleep:.2f} hrs",
        delta=f"{delta_sleep:+.2f} vs all" if selected_gender != "All" else None,
    )

st.markdown("---")

# ── 8. Visualizations ─────────────────────────────────────────────────────────
# Row 1: 2 charts side by side
left, right = st.columns(2)

# Chart 1 — Screen Time vs Productivity (Scatter)
with left:
    st.subheader("📱 Impact of Screen Time on Productivity")
    fig1 = px.scatter(
        df,
        x="Total_Screen_Time_Hours",
        y="productivity_score",
        color="gender",
        opacity=0.65,
        trendline="ols",
        color_discrete_map={"Male": "#38bdf8", "Female": "#f472b6", "Other": "#a3e635"},
        labels={
            "Total_Screen_Time_Hours": "Total Screen Time (hrs/day)",
            "productivity_score": "Productivity Score",
        },
        title="Screen Time vs Productivity Score",
        template="plotly_dark",
        hover_data=["age", "sleep_hours", "study_hours_per_day"],
    )
    fig1.update_layout(
        plot_bgcolor="#0f1117",
        paper_bgcolor="#0f1117",
        font_color="#e2e8f0",
        legend_title_text="Gender",
        title_font_size=14,
    )
    st.plotly_chart(fig1, use_container_width=True)

# Chart 2 — Sleep Hours vs Stress Level (Bar)
with right:
    st.subheader("😴 Sleep Hours vs Stress Level")
    sleep_stress = (
        df.assign(sleep_rounded=df["sleep_hours"].round())
        .groupby("sleep_rounded", as_index=False)["stress_level"]
        .mean()
        .rename(columns={"sleep_rounded": "Sleep Hours (rounded)", "stress_level": "Avg Stress Level"})
    )
    fig2 = px.bar(
        sleep_stress,
        x="Sleep Hours (rounded)",
        y="Avg Stress Level",
        color="Avg Stress Level",
        color_continuous_scale="Viridis_r",
        text_auto=".1f",
        title="Sleep Hours vs Avg Stress Level",
        template="plotly_dark",
    )
    fig2.update_layout(
        plot_bgcolor="#0f1117",
        paper_bgcolor="#0f1117",
        font_color="#e2e8f0",
        title_font_size=14,
        coloraxis_showscale=False,
    )
    fig2.update_traces(textfont_size=11, textposition="outside")
    st.plotly_chart(fig2, use_container_width=True)

# Row 2: Wide chart — Final Grade Distribution (Histogram)
st.subheader("🏆 Final Grade Distribution")
fig3 = px.histogram(
    df,
    x="final_grade",
    color="gender",
    nbins=30,
    barmode="overlay",
    opacity=0.75,
    color_discrete_map={"Male": "#38bdf8", "Female": "#f472b6", "Other": "#a3e635"},
    labels={"final_grade": "Final Grade", "count": "Number of Students"},
    title="Distribution of Final Grades by Gender",
    template="plotly_dark",
)
fig3.update_layout(
    plot_bgcolor="#0f1117",
    paper_bgcolor="#0f1117",
    font_color="#e2e8f0",
    title_font_size=14,
    bargap=0.05,
)
st.plotly_chart(fig3, use_container_width=True)

st.markdown("---")

# ── 9. Raw Data Table (optional expandable) ────────────────────────────────────
with st.expander("📋 View Raw Student Data", expanded=False):
    st.dataframe(
        df.sort_values("productivity_score", ascending=False).reset_index(drop=True),
        use_container_width=True,
        height=380,
    )
    st.caption(f"{len(df):,} rows × {len(df.columns)} columns")

# ── 10. Footer ────────────────────────────────────────────────────────────────
st.markdown(
    "<p style='text-align:center; color:#475569; font-size:.8rem; margin-top:2rem;'>"
    "KPI Dashboard · student_analytics.student_metrics · Built with Streamlit + Plotly"
    "</p>",
    unsafe_allow_html=True,
)
