# KPI Report – Student Productivity & Digital Distraction

This repository contains an interactive KPI report examining how screen time, sleep habits, study behavior, and other factors relate to academic performance for 20 000 students. Two dashboard versions are included:

1. **Static web dashboard** built with vanilla JavaScript and Chart.js using a CSV dataset.
2. **Streamlit dashboard** (`dashboard.py`) that pulls data from a MySQL database and uses Plotly/Folly for visualizations.

---

## 📁 Repository Structure

```
app.js                      # Front-end logic for static HTML dashboard
index.html                  # Main dashboard page (static)
styles.css                  # CSS for the static dashboard
Dataset/                    # Contains the CSV dataset (20 000 records)
  student_productivity_distraction_dataset_20000.csv

requirements.txt            # Python dependencies for Streamlit app
dashboard.py                # Streamlit application source code
.env                        # Example environment variables for database connection (not tracked)
README.md                   # This file
```

---

## 🔍 Static Dashboard (Web)

The HTML/JS version is fully client‑side and requires nothing more than a browser:

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. The page loads the CSV file from `Dataset/` and renders 8 KPI cards along with 8 interactive Chart.js plots.
3. Filters for gender, age group, and stress allow narrowing the dataset. A search bar and sortable table display the raw records.

> ⚠️ The browser must be able to fetch the CSV file (i.e. serve the directory with a simple HTTP server if opening from `file://` causes CORS issues). You can spin up a quick server with Python:
>
> ```bash
> cd "d:/KPI report of Student Productivity & Digital Distraction"
> python -m http.server 5500
> ```
> then browse to `http://localhost:5500`.

---

## 🧠 Streamlit Dashboard

This version connects to a MySQL database and offers richer interactive filtering via the Streamlit UI.

### Requirements

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

Copy the `.env` file and fill in your database credentials:

```
DB_HOST=localhost
DB_USER=youruser
DB_PASSWORD=secret
DB_NAME=student_analytics
DB_PORT=3306
```

Ensure a MySQL instance is running and contains a `student_metrics` table with the same columns as the CSV.

### Run

```bash
streamlit run dashboard.py
```

The app will open in your browser (usually `http://localhost:8501`) with KPI cards and Plotly charts.

---

## 🛠️ Features

- 18 KPIs derived from study habits, sleep, phone usage, grades, etc.
- Interactive filters: gender, age groups, stress level
- Eight analytical charts including scatter plots, histograms, and grouped bar charts
- Responsive design and dark theme for static dashboard
- Streamlit version caches results and supports live database updates

---

## 📦 Dataset

The dataset `student_productivity_distraction_dataset_20000.csv` contains 20 000 anonymized student records with the following columns:

`student_id, age, gender, study_hours_per_day, sleep_hours, phone_usage_hours, social_media_hours, youtube_hours, gaming_hours, breaks_per_day, coffee_intake_mg, exercise_minutes, assignments_completed, attendance_percentage, stress_level, focus_score, final_grade, productivity_score`

Feel free to open the CSV in Excel or a text editor for exploration.

---

## 📝 License & Attribution

This project is intended as a demo for building KPI dashboards. Adapt, extend, or reuse the code under the MIT license.

---

## 🙋‍♀️ Questions

Reach out via the GitHub repository issues if you need help running either dashboard or understanding the metrics.

Enjoy exploring student productivity! 🎓📊


# KPI Report Summary

This document provides a concise overview of the Key Performance Indicators (KPIs) featured in the **Student Productivity & Digital Distraction** dashboard. The metrics help stakeholders understand student behaviors, academic performance, and the impact of digital distractions.

## 📊 Primary KPIs

1. **Average Productivity Score**
   - Scale: 0–100
   - Reflects overall study efficiency combining self-reported habits and outcomes.

2. **Average Final Grade**
   - Scale: 0–100
   - Represents academic achievement based on coursework and exams.

3. **Average Study Hours per Day**
   - Total hours devoted to studying each day.

4. **Average Phone Usage (hrs/day)**
   - Total daily time spent on phone, a major source of digital distraction.

5. **Average Sleep Hours (hrs/day)**
   - Daily sleep duration, linked to cognitive performance and productivity.

6. **Average Focus Score**
   - Scale: 0–100
   - Measures self-assessed concentration ability during study sessions.

7. **Average Attendance (%)**
   - Percentage of classes attended by students, indicating engagement.

8. **Average Assignments Completed**
   - Out of a maximum of 19, indicates homework/task completion rate.

## 🔍 Analytical Insights (Charts)

The dashboards incorporate eight visualizations analyzing relationships between metrics:

- **Productivity Score Distribution** (histogram) – segmented into deciles.
- **Study Hours vs Final Grade** – scatter plot colored by gender.
- **Phone Usage vs Productivity** – examines screen time’s effect on performance.
- **Avg KPIs by Gender** – compares productivity, grade, focus, attendance.
- **Stress Level vs Focus & Productivity** – correlation of stress with outcomes.
- **Digital Distraction by Age Group** – stacked bars for social media, YouTube, gaming.
- **Sleep Hours vs Productivity** – evaluates the sleep-performance link.
- **Attendance vs Final Grade** – relationship between class attendance and grades.

## 🧩 Dataset Metrics

Data originates from 20 000 anonymized student records containing the following fields:

- `student_id`, `age`, `gender`, `study_hours_per_day`, `sleep_hours`
- `phone_usage_hours`, `social_media_hours`, `youtube_hours`, `gaming_hours`
- `breaks_per_day`, `coffee_intake_mg`, `exercise_minutes`, `assignments_completed`
- `attendance_percentage`, `stress_level`, `focus_score`, `final_grade`, `productivity_score`

## ✅ Purpose of the Report

This summary serves as a quick-reference KPI report for educators, administrators, and analysts to:

- Monitor student well-being and academic performance
- Identify patterns of digital distraction
- Support data-driven decisions on interventions and resource allocation

For full interactive exploration, consult the static web dashboard (`index.html`) or the Streamlit application (`dashboard.py`).
