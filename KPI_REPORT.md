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