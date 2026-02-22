/**
 * KPI Report – Student Productivity & Digital Distraction
 * app.js  |  Pure Vanilla JS — no dependencies except Chart.js (CDN)
 */

/* ── Constants ─────────────────────────────────────────────── */
const CSV_PATH = './Dataset/student_productivity_distraction_dataset_20000.csv';
const PAGE_SIZE = 15;

const COLS = [
  'student_id','age','gender','study_hours_per_day','sleep_hours',
  'phone_usage_hours','social_media_hours','youtube_hours','gaming_hours',
  'breaks_per_day','coffee_intake_mg','exercise_minutes','assignments_completed',
  'attendance_percentage','stress_level','focus_score','final_grade','productivity_score'
];

/* Colour palette */
const C = {
  purple  : 'hsl(258,80%,65%)',
  blue    : 'hsl(195,90%,55%)',
  pink    : 'hsl(330,80%,62%)',
  green   : 'hsl(145,70%,52%)',
  yellow  : 'hsl(42,95%,62%)',
  orange  : 'hsl(28,90%,62%)',
  teal    : 'hsl(175,80%,50%)',
  red     : 'hsl(0,78%,62%)',
  muted   : 'rgba(255,255,255,.12)',
  gridLine: 'rgba(255,255,255,.06)',
  text    : 'rgba(220,230,255,.75)',
};

const chartDefaults = () => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: C.text, font: { family: 'Inter', size: 12 }, boxWidth: 12 } },
    tooltip: {
      backgroundColor: 'rgba(15,15,30,.92)',
      titleColor: '#fff',
      bodyColor: C.text,
      borderColor: 'rgba(255,255,255,.12)',
      borderWidth: 1,
      padding: 10,
    }
  },
  scales: {
    x: {
      ticks: { color: C.text, font: { family: 'Inter', size: 11 } },
      grid: { color: C.gridLine },
    },
    y: {
      ticks: { color: C.text, font: { family: 'Inter', size: 11 } },
      grid: { color: C.gridLine },
    }
  }
});

/* ── State ─────────────────────────────────────────────────── */
let allData = [];
let filtered = [];
let charts = {};
let currentPage = 1;
let sortCol = 'productivity_score';
let sortDir = -1;   // -1 = desc
let searchQuery = '';

const filters = { gender: 'All', ageGroup: 'All', stress: 'All' };

/* ── CSV Parser ────────────────────────────────────────────── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const row = {};
    headers.forEach((h, i) => {
      const v = vals[i];
      row[h.trim()] = isNaN(v) ? v?.trim() : parseFloat(v);
    });
    return row;
  }).filter(r => r.student_id);
}

function ageGroup(age) {
  if (age <= 18) return '≤18';
  if (age <= 21) return '19-21';
  if (age <= 25) return '22-25';
  return '26+';
}

/* ── Filtering ─────────────────────────────────────────────── */
function applyFilters() {
  filtered = allData.filter(r => {
    if (filters.gender !== 'All' && r.gender !== filters.gender) return false;
    if (filters.ageGroup !== 'All' && ageGroup(r.age) !== filters.ageGroup) return false;
    if (filters.stress !== 'All' && r.stress_level !== +filters.stress) return false;
    return true;
  });
  document.querySelector('.filter-status strong').textContent =
    filtered.length.toLocaleString();
  renderAll();
}

/* ── KPI ───────────────────────────────────────────────────── */
function avg(data, key) {
  if (!data.length) return 0;
  return data.reduce((s, r) => s + r[key], 0) / data.length;
}

function renderKPIs() {
  const d = filtered;
  if (!d.length) return;
  set('kpi-productivity', avg(d,'productivity_score').toFixed(1));
  set('kpi-grade',        avg(d,'final_grade').toFixed(1));
  set('kpi-study',        avg(d,'study_hours_per_day').toFixed(2));
  set('kpi-phone',        avg(d,'phone_usage_hours').toFixed(2));
  set('kpi-sleep',        avg(d,'sleep_hours').toFixed(2));
  set('kpi-focus',        avg(d,'focus_score').toFixed(1));
  set('kpi-attendance',   avg(d,'attendance_percentage').toFixed(1) + '%');
  set('kpi-assignments',  avg(d,'assignments_completed').toFixed(1));
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ── Chart helpers ─────────────────────────────────────────── */
function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}
function ctx(id) { return document.getElementById(id).getContext('2d'); }

/* ── Chart 1: Productivity Distribution (histogram) ──────── */
function renderProductivityDist() {
  destroyChart('c1');
  const bins = Array.from({length:10}, (_,i) => ({ label: `${i*10}–${i*10+10}`, count: 0 }));
  filtered.forEach(r => {
    const b = Math.min(9, Math.floor(r.productivity_score / 10));
    bins[b].count++;
  });
  const palette = [C.purple,C.blue,C.pink,C.green,C.yellow,C.orange,C.teal,C.red,C.purple,C.blue];
  charts.c1 = new Chart(ctx('c1'), {
    type: 'bar',
    data: {
      labels: bins.map(b=>b.label),
      datasets: [{ label:'Students', data: bins.map(b=>b.count),
        backgroundColor: palette.map(c => c.replace('hsl','hsla').replace(')',', .75)')),
        borderColor: palette, borderWidth: 1.5, borderRadius: 6 }]
    },
    options: { ...chartDefaults(), plugins: { ...chartDefaults().plugins, legend: { display: false } } }
  });
}

/* ── Chart 2: Study Hours vs Final Grade (scatter) ─────────── */
function renderStudyVsGrade() {
  destroyChart('c2');
  const sample = sampleData(filtered, 800);
  const bySex = groupBy(sample, r => r.gender);
  const colorMap = { Male: C.blue, Female: C.pink, Other: C.green };
  const datasets = Object.keys(colorMap).filter(g => bySex[g]).map(g => ({
    label: g,
    data: bySex[g].map(r => ({ x: r.study_hours_per_day, y: r.final_grade })),
    backgroundColor: colorMap[g].replace('hsl','hsla').replace(')',', .5)'),
    pointRadius: 4,
  }));
  charts.c2 = new Chart(ctx('c2'), {
    type: 'scatter',
    data: { datasets },
    options: {
      ...chartDefaults(),
      plugins: { ...chartDefaults().plugins, tooltip: { ...chartDefaults().plugins.tooltip,
        callbacks: { label: t => `${t.dataset.label}: Study ${t.parsed.x}h → Grade ${t.parsed.y}` }
      }},
      scales: {
        x: { ...chartDefaults().scales.x, title: { display:true, text:'Study Hours/Day', color: C.text } },
        y: { ...chartDefaults().scales.y, title: { display:true, text:'Final Grade', color: C.text } }
      }
    }
  });
}

/* ── Chart 3: Phone Usage vs Productivity (scatter) ─────────── */
function renderPhoneVsProductivity() {
  destroyChart('c3');
  const sample = sampleData(filtered, 800);
  charts.c3 = new Chart(ctx('c3'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Students',
        data: sample.map(r => ({ x: r.phone_usage_hours, y: r.productivity_score })),
        backgroundColor: C.orange.replace('hsl','hsla').replace(')',', .55)'),
        pointRadius: 4,
      }]
    },
    options: {
      ...chartDefaults(),
      plugins: { ...chartDefaults().plugins, legend: { display: false } },
      scales: {
        x: { ...chartDefaults().scales.x, title: { display:true, text:'Phone Usage (hrs/day)', color: C.text } },
        y: { ...chartDefaults().scales.y, title: { display:true, text:'Productivity Score', color: C.text } }
      }
    }
  });
}

/* ── Chart 4: Avg KPIs by Gender (grouped bar) ─────────── */
function renderKPIByGender() {
  destroyChart('c4');
  const genders = ['Male','Female','Other'];
  const keys = ['productivity_score','final_grade','focus_score','attendance_percentage'];
  const labels = ['Productivity','Grade','Focus','Attendance %'];
  const gColors = [C.blue, C.pink, C.green];
  const datasets = genders.map((g,i) => {
    const subset = filtered.filter(r => r.gender === g);
    return {
      label: g,
      data: keys.map(k => +avg(subset,k).toFixed(1)),
      backgroundColor: gColors[i].replace('hsl','hsla').replace(')',', .7)'),
      borderColor: gColors[i],
      borderWidth: 1.5,
      borderRadius: 5,
    };
  });
  charts.c4 = new Chart(ctx('c4'), {
    type: 'bar',
    data: { labels, datasets },
    options: { ...chartDefaults(), scales: { x: chartDefaults().scales.x, y: { ...chartDefaults().scales.y, beginAtZero: true } } }
  });
}

/* ── Chart 5: Stress Level vs Avg Focus Score ─────────── */
function renderStressVsFocus() {
  destroyChart('c5');
  const levels = [1,2,3,4,5,6,7,8,9,10];
  const avgFocus = levels.map(l => {
    const sub = filtered.filter(r => r.stress_level === l);
    return sub.length ? +avg(sub,'focus_score').toFixed(1) : 0;
  });
  const avgProd = levels.map(l => {
    const sub = filtered.filter(r => r.stress_level === l);
    return sub.length ? +avg(sub,'productivity_score').toFixed(1) : 0;
  });
  charts.c5 = new Chart(ctx('c5'), {
    type: 'bar',
    data: {
      labels: levels.map(l => 'Level ' + l),
      datasets: [
        { label: 'Avg Focus Score', data: avgFocus, backgroundColor: C.teal.replace('hsl','hsla').replace(')',', .75)'), borderColor: C.teal, borderWidth:1.5, borderRadius: 5 },
        { label: 'Avg Productivity', data: avgProd, backgroundColor: C.purple.replace('hsl','hsla').replace(')',', .6)'), borderColor: C.purple, borderWidth:1.5, borderRadius: 5 }
      ]
    },
    options: { ...chartDefaults(), scales: { x: chartDefaults().scales.x, y: { ...chartDefaults().scales.y, beginAtZero: true } } }
  });
}

/* ── Chart 6: Digital Distraction by Age Group (stacked bar) ── */
function renderDistractionByAge() {
  destroyChart('c6');
  const groups = ['≤18','19-21','22-25','26+'];
  const channels = [
    { key: 'social_media_hours', label: 'Social Media', color: C.pink },
    { key: 'youtube_hours',      label: 'YouTube',      color: C.red },
    { key: 'gaming_hours',       label: 'Gaming',       color: C.purple },
  ];
  const datasets = channels.map(ch => ({
    label: ch.label,
    data: groups.map(g => {
      const sub = filtered.filter(r => ageGroup(r.age) === g);
      return sub.length ? +avg(sub, ch.key).toFixed(2) : 0;
    }),
    backgroundColor: ch.color.replace('hsl','hsla').replace(')',', .75)'),
    borderColor: ch.color,
    borderWidth: 1.5,
    borderRadius: { topLeft:4, topRight:4 },
    borderSkipped: false,
  }));
  charts.c6 = new Chart(ctx('c6'), {
    type: 'bar',
    data: { labels: groups, datasets },
    options: {
      ...chartDefaults(),
      scales: {
        x: { ...chartDefaults().scales.x, stacked: true },
        y: { ...chartDefaults().scales.y, stacked: true, title:{ display:true, text:'Hours/Day', color: C.text } }
      }
    }
  });
}

/* ── Chart 7: Sleep vs Productivity (scatter) ─────────── */
function renderSleepVsProductivity() {
  destroyChart('c7');
  const sample = sampleData(filtered, 800);
  charts.c7 = new Chart(ctx('c7'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Students',
        data: sample.map(r => ({ x: r.sleep_hours, y: r.productivity_score })),
        backgroundColor: C.green.replace('hsl','hsla').replace(')',', .55)'),
        pointRadius: 4,
      }]
    },
    options: {
      ...chartDefaults(),
      plugins: { ...chartDefaults().plugins, legend: { display: false } },
      scales: {
        x: { ...chartDefaults().scales.x, title: { display:true, text:'Sleep Hours/Day', color: C.text } },
        y: { ...chartDefaults().scales.y, title: { display:true, text:'Productivity Score', color: C.text } }
      }
    }
  });
}

/* ── Chart 8: Attendance vs Final Grade (scatter) ─────────── */
function renderAttendanceVsGrade() {
  destroyChart('c8');
  const sample = sampleData(filtered, 800);
  charts.c8 = new Chart(ctx('c8'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Students',
        data: sample.map(r => ({ x: r.attendance_percentage, y: r.final_grade })),
        backgroundColor: C.yellow.replace('hsl','hsla').replace(')',', .55)'),
        pointRadius: 4,
      }]
    },
    options: {
      ...chartDefaults(),
      plugins: { ...chartDefaults().plugins, legend: { display: false } },
      scales: {
        x: { ...chartDefaults().scales.x, title: { display:true, text:'Attendance %', color: C.text } },
        y: { ...chartDefaults().scales.y, title: { display:true, text:'Final Grade', color: C.text } }
      }
    }
  });
}

/* ── Data Table ────────────────────────────────────────────── */
function renderTable() {
  const tableCols = [
    { key:'student_id',          label:'ID' },
    { key:'age',                 label:'Age' },
    { key:'gender',              label:'Gender' },
    { key:'study_hours_per_day', label:'Study Hrs' },
    { key:'sleep_hours',         label:'Sleep Hrs' },
    { key:'phone_usage_hours',   label:'Phone Hrs' },
    { key:'productivity_score',  label:'Productivity' },
    { key:'final_grade',         label:'Grade' },
    { key:'focus_score',         label:'Focus' },
    { key:'attendance_percentage', label:'Attendance %' },
    { key:'stress_level',        label:'Stress' },
  ];

  // Apply search
  let data = filtered;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(r =>
      String(r.student_id).includes(q) ||
      r.gender.toLowerCase().includes(q) ||
      String(r.age).includes(q)
    );
  }

  // Sort
  const sorted = [...data].sort((a,b) => {
    const va = a[sortCol], vb = b[sortCol];
    return typeof va === 'string' ? va.localeCompare(vb)*sortDir : (va - vb)*sortDir;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = 1;
  const page = sorted.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  // Table info
  document.getElementById('table-info').textContent =
    `Showing ${Math.min(sorted.length, PAGE_SIZE*(currentPage-1)+1)}–${Math.min(sorted.length, PAGE_SIZE*currentPage)} of ${sorted.length.toLocaleString()} records`;

  // Thead
  const thead = document.getElementById('thead-row');
  thead.innerHTML = tableCols.map(c => {
    const isSorted = sortCol === c.key;
    const icon = isSorted ? (sortDir === 1 ? ' ↑' : ' ↓') : ' ⇅';
    return `<th class="${isSorted ? 'sorted':''}" data-col="${c.key}">${c.label}<span class="sort-icon">${icon}</span></th>`;
  }).join('');

  // Attach sort listeners
  thead.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
      if (sortCol === th.dataset.col) sortDir *= -1;
      else { sortCol = th.dataset.col; sortDir = -1; }
      currentPage = 1;
      renderTable();
    });
  });

  // Tbody
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = page.map(r => {
    const gClass = r.gender === 'Male' ? 'male' : r.gender === 'Female' ? 'female' : 'other';
    const gradePct = ((r.final_grade / 100) * 100).toFixed(0);
    return `<tr>
      <td class="num">${r.student_id}</td>
      <td class="num">${r.age}</td>
      <td><span class="pill pill-${gClass}">${r.gender}</span></td>
      <td class="num">${r.study_hours_per_day.toFixed(2)}</td>
      <td class="num">${r.sleep_hours.toFixed(2)}</td>
      <td class="num">${r.phone_usage_hours.toFixed(2)}</td>
      <td class="num"><strong>${r.productivity_score.toFixed(1)}</strong></td>
      <td>
        <div class="grade-bar">
          <span>${r.final_grade.toFixed(1)}</span>
          <div class="grade-bar-bg"><div class="grade-bar-fill" style="width:${gradePct}%"></div></div>
        </div>
      </td>
      <td class="num">${r.focus_score}</td>
      <td class="num">${r.attendance_percentage.toFixed(1)}%</td>
      <td class="num">${r.stress_level}</td>
    </tr>`;
  }).join('');

  // Pagination
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  const maxPages = Math.min(totalPages, 10);
  for (let i = 1; i <= maxPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i === currentPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderTable(); });
    pag.appendChild(btn);
  }
  if (totalPages > 10) {
    const span = document.createElement('span');
    span.style.cssText = 'color:var(--text-muted);font-size:.82rem;padding:6px 4px;';
    span.textContent = `… ${totalPages} total pages`;
    pag.appendChild(span);
  }
}

/* ── Utility: random sample without replacement ────────── */
function sampleData(data, n) {
  if (data.length <= n) return data;
  const copy = [...data];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function groupBy(arr, fn) {
  return arr.reduce((acc, v) => { const k = fn(v); (acc[k] = acc[k] || []).push(v); return acc; }, {});
}

/* ── Render All ─────────────────────────────────────────── */
function renderAll() {
  renderKPIs();
  renderProductivityDist();
  renderStudyVsGrade();
  renderPhoneVsProductivity();
  renderKPIByGender();
  renderStressVsFocus();
  renderDistractionByAge();
  renderSleepVsProductivity();
  renderAttendanceVsGrade();
  renderTable();
}

/* ── Filter Wiring ──────────────────────────────────────── */
function wireFilters() {
  document.getElementById('filter-gender').addEventListener('change', e => {
    filters.gender = e.target.value; currentPage = 1; applyFilters();
  });
  document.getElementById('filter-age').addEventListener('change', e => {
    filters.ageGroup = e.target.value; currentPage = 1; applyFilters();
  });
  document.getElementById('filter-stress').addEventListener('change', e => {
    filters.stress = e.target.value; currentPage = 1; applyFilters();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('filter-gender').value = 'All';
    document.getElementById('filter-age').value    = 'All';
    document.getElementById('filter-stress').value = 'All';
    filters.gender = filters.ageGroup = filters.stress = 'All';
    searchQuery = ''; document.getElementById('table-search').value = '';
    currentPage = 1; applyFilters();
  });
  document.getElementById('table-search').addEventListener('input', e => {
    searchQuery = e.target.value; currentPage = 1; renderTable();
  });
}

/* ── Bootstrap ──────────────────────────────────────────── */
async function init() {
  try {
    const res = await fetch(CSV_PATH);
    if (!res.ok) throw new Error('Could not load CSV: ' + res.status);
    const text = await res.text();
    allData = parseCSV(text);
    filtered = allData;

    // Update total badge
    document.getElementById('total-badge').textContent = allData.length.toLocaleString();
    document.querySelector('.filter-status strong').textContent = allData.length.toLocaleString();

    wireFilters();
    renderAll();

    // Hide loader
    document.getElementById('loader').style.display = 'none';
  } catch (err) {
    document.getElementById('loader').innerHTML = `
      <div style="color:#f87171;text-align:center;max-width:500px;padding:20px">
        <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
        <strong>Could not load dataset</strong><br>
        <p style="margin-top:8px;font-size:.85rem;color:var(--text-muted)">
          Make sure you open this page via a local server or a browser that allows file access.<br><br>
          <strong>Quick fix:</strong> In VS Code, right-click <code>index.html</code> and choose
          <em>"Open with Live Server"</em>, or use:<br>
          <code style="display:block;margin-top:8px;padding:8px;background:rgba(255,255,255,.08);border-radius:6px">
            npx serve "d:/KPI report of Student Productivity & Digital Distraction"
          </code>
          <span style="opacity:.7">Error: ${err.message}</span>
        </p>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
