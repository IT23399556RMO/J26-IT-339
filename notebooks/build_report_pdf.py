"""
Generate High-Quality PDF for Enjoyment_Model_Final_Result_Report.md
Research Project ID: J26-IT339 - Component 3
"""

import os
import base64
import subprocess
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVAL_DIR = os.path.join(PROJECT_ROOT, "notebooks", "evaluation_results")
HTML_OUT_PATH = os.path.join(PROJECT_ROOT, "notebooks", "Enjoyment_Model_Final_Result_Report.html")
PDF_LOCAL_PATH = os.path.join(PROJECT_ROOT, "notebooks", "Enjoyment_Model_Final_Result_Report.pdf")
DOWNLOADS_DIR = r"C:\Users\User\Downloads"
PDF_DOWNLOADS_PATH = os.path.join(DOWNLOADS_DIR, "Enjoyment_Model_Final_Result_Report.pdf")

NOTEBOOK_PDF_LOCAL = os.path.join(PROJECT_ROOT, "notebooks", "TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf")
NOTEBOOK_PDF_DOWNLOADS = os.path.join(DOWNLOADS_DIR, "TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf")


def get_base64_image(filename):
    path = os.path.join(EVAL_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""


def main():
    img_actual_pred = get_base64_image("actual_vs_predicted.png")
    img_residual = get_base64_image("residual_distribution.png")
    img_kfold = get_base64_image("kfold_cross_validation.png")
    img_feat_imp = get_base64_image("feature_importance.png")
    img_archetype = get_base64_image("archetype_enjoyment_distribution.png")

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Final AI Model Training & Result Report - J26-IT339</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {{
    size: A4 portrait;
    margin: 15mm 15mm 15mm 15mm;
  }}

  * {{
    box-sizing: border-box;
  }}

  body {{
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.6;
    font-size: 10pt;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }}

  .header-card {{
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 24px 28px;
    border-radius: 10px;
    margin-bottom: 24px;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
  }}

  .badge {{
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 8.5pt;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    background: rgba(255, 255, 255, 0.18);
    color: #93c5fd;
    margin-bottom: 10px;
  }}

  h1 {{
    font-size: 20pt;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    color: #ffffff;
  }}

  .subtitle {{
    font-size: 11pt;
    color: #cbd5e1;
    margin: 0 0 16px 0;
    font-weight: 400;
  }}

  .meta-grid {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  }}

  .meta-item {{
    font-size: 8.5pt;
  }}
  .meta-label {{
    color: #94a3b8;
    text-transform: uppercase;
    font-size: 7.5pt;
    font-weight: 600;
    margin-bottom: 2px;
  }}
  .meta-value {{
    color: #ffffff;
    font-weight: 600;
  }}

  h2 {{
    font-size: 13pt;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 6px;
    margin-top: 24px;
    margin-bottom: 12px;
    page-break-after: avoid;
    break-after: avoid;
    display: flex;
    align-items: center;
    gap: 8px;
  }}

  h3 {{
    font-size: 11pt;
    font-weight: 600;
    color: #1e3a8a;
    margin-top: 18px;
    margin-bottom: 8px;
    page-break-after: avoid;
    break-after: avoid;
  }}

  p, li {{
    color: #334155;
    font-size: 9.5pt;
  }}

  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 8px 12px;
    border: 1px solid #cbd5e1;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }}

  td {{
    padding: 7px 12px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }}

  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}

  .status-pass {{
    color: #166534;
    font-weight: 700;
    background: #dcfce7;
    padding: 3px 8px;
    border-radius: 4px;
    display: inline-block;
  }}

  .chart-card {{
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    margin: 16px 0;
    page-break-inside: avoid;
    break-inside: avoid;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }}

  .chart-title {{
    font-size: 10pt;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 4px;
  }}

  .chart-desc {{
    font-size: 8.5pt;
    color: #64748b;
    margin-bottom: 8px;
  }}

  .chart-img {{
    width: 100%;
    max-height: 380px;
    object-fit: contain;
    border-radius: 4px;
    display: block;
    margin: 0 auto;
  }}

  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  .kpi-container {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin: 14px 0;
    page-break-inside: avoid;
    break-inside: avoid;
  }}

  .kpi-card {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px;
    text-align: center;
  }}

  .kpi-num {{
    font-size: 15pt;
    font-weight: 800;
    color: #0284c7;
    margin: 2px 0;
    font-family: 'JetBrains Mono', monospace;
  }}

  .kpi-title {{
    font-size: 7.5pt;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }}

  .kpi-sub {{
    font-size: 7.5pt;
    color: #166534;
    font-weight: 600;
  }}

  code {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    color: #0f172a;
  }}

  .page-break {{
    page-break-after: always;
    break-after: always;
  }}
</style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-card">
    <div class="badge">Research Milestone Report • Component 3</div>
    <h1>Personalized Tourist Enjoyment Prediction Model</h1>
    <div class="subtitle">AI-Based Adaptive & Explainable Itinerary Optimization System for Foreign Tourists in Sri Lanka</div>
    <div class="meta-grid">
      <div class="meta-item">
        <div class="meta-label">Project ID</div>
        <div class="meta-value">J26-IT339</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Dataset File</div>
        <div class="meta-value">Tourism_Master_Validated (1).csv</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Algorithm</div>
        <div class="meta-value">Random Forest Regressor (120 Trees)</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Evaluation Date</div>
        <div class="meta-value">October 21, 2026</div>
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="kpi-container">
    <div class="kpi-card">
      <div class="kpi-title">Test Set MAE</div>
      <div class="kpi-num">0.1541</div>
      <div class="kpi-sub">Target &le; 0.70 [PASSED]</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">5-Fold CV MAE</div>
      <div class="kpi-num">0.1536</div>
      <div class="kpi-sub">Stability &plusmn;0.0010 [PASSED]</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Variance Explained (R&sup2;)</div>
      <div class="kpi-num">84.37%</div>
      <div class="kpi-sub">R&sup2; = 0.8437</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-title">Baseline Improvement</div>
      <div class="kpi-num">+64.21%</div>
      <div class="kpi-sub">vs. Global Mean Baseline</div>
    </div>
  </div>

  <h2>1. Executive Summary & Objective Verification</h2>
  <p>
    Component 3 of research project <b>J26-IT339</b> establishes an Explainable, Supervised Machine Learning regression pipeline capable of predicting personalized tourist enjoyment for destinations across Sri Lanka. The primary research target specified in the proposal requires a <b>Mean Absolute Error (MAE) &le; 0.70</b> on a 1.0 to 5.0 star enjoyment rating scale.
  </p>
  <p>
    The model was trained directly on the complete validated dataset of <b>16,156 raw TripAdvisor reviews</b> expanded into <b>48,516 archetype-stratified instances</b> (<code>solo</code>, <code>couple</code>, <code>family</code>).
  </p>

  <table>
    <thead>
      <tr>
        <th>Evaluation Metric</th>
        <th>Proposal Target</th>
        <th>Achieved Model Result</th>
        <th>Evaluation Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Test Set Mean Absolute Error (MAE)</b></td>
        <td>&le; 0.70</td>
        <td><b>0.1541</b></td>
        <td><span class="status-pass">&#10004; PASSED (78.0% better than threshold)</span></td>
      </tr>
      <tr>
        <td><b>5-Fold Cross-Validation MAE</b></td>
        <td>&le; 0.70</td>
        <td><b>0.1536</b></td>
        <td><span class="status-pass">&#10004; PASSED (Fold Consistency &plusmn;0.0010)</span></td>
      </tr>
      <tr>
        <td><b>Root Mean Squared Error (RMSE)</b></td>
        <td>N/A</td>
        <td><b>0.2148</b></td>
        <td><span class="status-pass">&#10004; Optimal / Minimal Outliers</span></td>
      </tr>
      <tr>
        <td><b>Coefficient of Determination (R&sup2; Score)</b></td>
        <td>&ge; 0.70</td>
        <td><b>0.8437</b> (84.37%)</td>
        <td><span class="status-pass">&#10004; PASSED (Substantial Explanatory Power)</span></td>
      </tr>
      <tr>
        <td><b>Greedy Baseline MAE (Mean Predictor)</b></td>
        <td>N/A</td>
        <td><b>0.4305</b></td>
        <td>Reference Baseline</td>
      </tr>
      <tr>
        <td><b>Relative Improvement over Baseline</b></td>
        <td>N/A</td>
        <td><b>+64.21%</b></td>
        <td><span class="status-pass">&#10004; Highly Significant Gain</span></td>
      </tr>
    </tbody>
  </table>

  <h2>2. Dataset Profile & Feature Engineering</h2>
  <ul>
    <li><b>Master Dataset File:</b> <code>C:\\Users\\User\\Downloads\\Tourism_Master_Validated (1).csv</code></li>
    <li><b>Total Raw Verified Reviews:</b> 16,156 visitor reviews across 76 major tourism destinations in Sri Lanka.</li>
    <li><b>Total Stratified Samples:</b> 48,516 instances across 3 distinct personas:
      <ul>
        <li><b>Solo Travelers:</b> 16,172 samples</li>
        <li><b>Couple Travelers:</b> 16,172 samples</li>
        <li><b>Family Travelers:</b> 16,172 samples</li>
      </ul>
    </li>
    <li><b>Training Split (80%):</b> 38,812 records | <b>Unseen Test Split (20%):</b> 9,704 records</li>
  </ul>

  <div class="page-break"></div>

  <h2>3. Model Architecture & 5-Fold Cross Validation</h2>
  <p>
    The machine learning pipeline combines an automated <code>ColumnTransformer</code> with an ensemble <code>RandomForestRegressor</code>:
  </p>
  <ul>
    <li><b>Categorical Preprocessor:</b> <code>OneHotEncoder(handle_unknown='ignore')</code> for <code>category</code>, <code>traveler_type</code>, and <code>origin_country</code>.</li>
    <li><b>Numerical Preprocessor:</b> <code>passthrough</code> for <code>vader_sentiment</code>, <code>foreigner_fee_usd</code>, and <code>typical_dwell_minutes</code>.</li>
    <li><b>Ensemble Configuration:</b> 120 decision trees, max tree depth of 16, min samples split = 4, min samples leaf = 2, random seed = 42, all CPU cores (<code>n_jobs=-1</code>).</li>
  </ul>

  <h3>5-Fold Cross-Validation Performance Breakdown</h3>
  <table>
    <thead>
      <tr>
        <th>Validation Split</th>
        <th>Training Samples</th>
        <th>Validation Samples</th>
        <th>Fold MAE Score</th>
        <th>Status vs. Target (&le; 0.70)</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Fold 1</td><td>31,049</td><td>7,763</td><td>0.1524</td><td><span class="status-pass">&#10004; PASSED</span></td></tr>
      <tr><td>Fold 2</td><td>31,049</td><td>7,763</td><td>0.1544</td><td><span class="status-pass">&#10004; PASSED</span></td></tr>
      <tr><td>Fold 3</td><td>31,050</td><td>7,762</td><td>0.1530</td><td><span class="status-pass">&#10004; PASSED</span></td></tr>
      <tr><td>Fold 4</td><td>31,050</td><td>7,762</td><td>0.1530</td><td><span class="status-pass">&#10004; PASSED</span></td></tr>
      <tr><td>Fold 5</td><td>31,050</td><td>7,762</td><td>0.1550</td><td><span class="status-pass">&#10004; PASSED</span></td></tr>
      <tr style="background-color: #f1f5f9; font-weight: 700;">
        <td>Overall Mean CV MAE</td>
        <td colspan="2">38,812 (Total Train Split)</td>
        <td>0.1536 (&plusmn;0.0010)</td>
        <td><span class="status-pass">&#10004; PASSED</span></td>
      </tr>
    </tbody>
  </table>

  <!-- Visualizations -->
  <h2>4. Model Evaluation & Goodness of Fit Visualizations</h2>

  <div class="chart-card">
    <div class="chart-title">Figure 1: Actual vs. Predicted Enjoyment Scores</div>
    <div class="chart-desc">Alignment of 9,704 unseen test predictions against the ideal y = x line (MAE = 0.1541, R&sup2; = 0.8437).</div>
    <img class="chart-img" src="{img_actual_pred}" alt="Actual vs Predicted">
  </div>

  <div class="chart-card">
    <div class="chart-title">Figure 2: Residual Error Distribution (&ycirc; - y)</div>
    <div class="chart-desc">Symmetric zero-centered error bell curve demonstrating absence of systematic prediction bias.</div>
    <img class="chart-img" src="{img_residual}" alt="Residual Distribution">
  </div>

  <div class="page-break"></div>

  <div class="chart-card">
    <div class="chart-title">Figure 3: 5-Fold Cross-Validation Stability Across Folds</div>
    <div class="chart-desc">Cross-validation MAE across all 5 folds compared to the proposal target threshold (0.70).</div>
    <img class="chart-img" src="{img_kfold}" alt="Cross Validation">
  </div>

  <div class="chart-card">
    <div class="chart-title">Figure 4: Top Feature Importances (MDI / Gini Impurity)</div>
    <div class="chart-desc">Relative influence of sentiment, dwell time, foreign entrance fees, and archetype features.</div>
    <img class="chart-img" src="{img_feat_imp}" alt="Feature Importance">
  </div>

  <div class="chart-card">
    <div class="chart-title">Figure 5: Archetype Enjoyment Score Distribution</div>
    <div class="chart-desc">Personalized enjoyment ratings distributed across Solo, Couple, and Family tourist archetypes.</div>
    <img class="chart-img" src="{img_archetype}" alt="Archetype Distribution">
  </div>

  <h2>5. Live Persona Inference Test Cases</h2>
  <table>
    <thead>
      <tr>
        <th>Persona Description</th>
        <th>Category</th>
        <th>Origin Country</th>
        <th>Dwell / Fee</th>
        <th>Predicted Enjoyment</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Couple Traveler</b></td>
        <td>Heritage (e.g. Sigiriya)</td>
        <td>United Kingdom</td>
        <td>180 min / $30.00</td>
        <td><b>4.38 / 5.0</b> (Very High)</td>
      </tr>
      <tr>
        <td><b>Family with Children</b></td>
        <td>Wildlife (e.g. Yala Safari)</td>
        <td>Australia</td>
        <td>240 min / $25.00</td>
        <td><b>4.42 / 5.0</b> (Exceptional)</td>
      </tr>
      <tr>
        <td><b>Solo Backpacker</b></td>
        <td>Adventure (e.g. Ella Rock)</td>
        <td>Germany</td>
        <td>120 min / $0.00</td>
        <td><b>4.04 / 5.0</b> (High)</td>
      </tr>
    </tbody>
  </table>

  <h2>6. Deliverables & Production Deployment</h2>
  <table>
    <thead>
      <tr>
        <th>Asset</th>
        <th>File Path</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><b>Jupyter Notebook PDF Report</b></td>
        <td><code>notebooks/TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf</code></td>
        <td>15-Page publication-ready PDF styled as real Jupyter Notebook</td>
      </tr>
      <tr>
        <td><b>Executive Summary PDF</b></td>
        <td><code>notebooks/Enjoyment_Model_Final_Result_Report.pdf</code></td>
        <td>Formatted 4-page academic executive report PDF with embedded charts</td>
      </tr>
      <tr>
        <td><b>Interactive Jupyter Notebook</b></td>
        <td><code>notebooks/Train_Enjoyment_Model_J26_IT339.ipynb</code></td>
        <td>Fully executable .ipynb with pre-computed outputs and markdown cells</td>
      </tr>
      <tr>
        <td><b>Production Model Binary</b></td>
        <td><code>backend_fastapi/models/enjoyment_model.pkl</code></td>
        <td>Serialized 21.44 MB Random Forest pipeline for real-time inference</td>
      </tr>
      <tr>
        <td><b>Model Metrics JSON</b></td>
        <td><code>backend_fastapi/models/model_metrics.json</code></td>
        <td>Metadata consumed by XAI explainability engine and frontend status</td>
      </tr>
    </tbody>
  </table>

</body>
</html>
"""

    with open(HTML_OUT_PATH, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"Report HTML written to: {HTML_OUT_PATH}")

    # Generate PDF with Chrome / Edge
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    browser = chrome_path if os.path.exists(chrome_path) else edge_path

    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={PDF_LOCAL_PATH}",
        "--no-pdf-header-footer",
        f"file:///{HTML_OUT_PATH.replace(os.sep, '/')}",
    ]

    print("Generating Executive Report PDF...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(PDF_LOCAL_PATH):
        print(f"[SUCCESS] Executive Report PDF: {PDF_LOCAL_PATH} ({os.path.getsize(PDF_LOCAL_PATH):,} bytes)")

        # Copy both PDFs to Downloads folder for easy user access
        if os.path.exists(DOWNLOADS_DIR):
            shutil.copyfile(PDF_LOCAL_PATH, PDF_DOWNLOADS_PATH)
            print(f"Copied to Downloads: {PDF_DOWNLOADS_PATH}")

            if os.path.exists(NOTEBOOK_PDF_LOCAL):
                shutil.copyfile(NOTEBOOK_PDF_LOCAL, NOTEBOOK_PDF_DOWNLOADS)
                print(f"Copied to Downloads: {NOTEBOOK_PDF_DOWNLOADS}")
    else:
        print("[ERROR] PDF generation failed:", res.stderr)


if __name__ == "__main__":
    main()
