"""
Build Styled Authentic Jupyter Notebook PDF Report
Research Project ID: J26-IT339 - Component 3
"""

import os
import subprocess
import shutil

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_INPUT_PATH = os.path.join(PROJECT_ROOT, "notebooks", "Train_Enjoyment_Model_J26_IT339.html")
STYLED_HTML_PATH = os.path.join(PROJECT_ROOT, "notebooks", "Train_Enjoyment_Model_J26_IT339_styled.html")
PDF_OUTPUT_PATH = os.path.join(PROJECT_ROOT, "notebooks", "TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf")
PDF_COPY_PATH = os.path.join(PROJECT_ROOT, "notebooks", "Train_Enjoyment_Model_J26_IT339.pdf")
ARTIFACT_DIR = r"C:\Users\User\.gemini\antigravity-ide\brain\e8bf8acc-0644-4c07-ade7-f0a83dea8efb"

JUPYTER_HEADER_HTML = """
<div class="jupyter-header-container" style="margin-bottom: 24px; border: 1px solid #d6d6d6; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); background: #ffffff; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Jupyter Notebook Title Bar -->
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid #e0e0e0; background: #ffffff;">
    <div style="display: flex; align-items: center; gap: 14px;">
      <!-- Jupyter Logo -->
      <svg width="30" height="34" viewBox="0 0 44 51" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.062 0C9.897 0 0 4.195 0 9.37c0 5.176 9.897 9.37 22.062 9.37 12.166 0 22.063-4.194 22.063-9.37C44.125 4.195 34.228 0 22.062 0zm0 15.545c-9.76 0-17.702-2.768-17.702-6.175 0-3.407 7.942-6.175 17.702-6.175 9.76 0 17.702 2.768 17.702 6.175 0 3.407-7.942 6.175-17.702 6.175z" fill="#F37626"/>
        <path d="M22.062 31.956c-12.165 0-22.062 4.194-22.062 9.37 0 5.175 9.897 9.37 22.062 9.37 12.166 0 22.063-4.195 22.063-9.37 0-5.176-9.897-9.37-22.063-9.37zm0 15.545c-9.76 0-17.702-2.768-17.702-6.175 0-3.407 7.942-6.175 17.702-6.175 9.76 0 17.702 2.768 17.702 6.175 0 3.407-7.942 6.175-17.702 6.175z" fill="#F37626"/>
        <ellipse cx="6.4" cy="25.3" rx="4.8" ry="4.8" fill="#616161"/>
        <ellipse cx="37.6" cy="25.3" rx="4.8" ry="4.8" fill="#616161"/>
      </svg>
      <div>
        <div style="font-size: 17px; font-weight: 700; color: #1a1a1a; display: flex; align-items: center; gap: 8px;">
          <span>Train_Enjoyment_Model_J26_IT339.ipynb</span>
          <span style="font-size: 11px; font-weight: 600; color: #1565c0; background: #e3f2fd; border: 1px solid #bbdefb; padding: 2px 7px; border-radius: 4px;">Last Checkpoint: 2026-10-21 (autosaved)</span>
          <span style="font-size: 11px; font-weight: 600; color: #2e7d32; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 2px 7px; border-radius: 4px;">Trusted</span>
        </div>
        <div style="font-size: 12px; color: #424242; margin-top: 5px; font-weight: 500;">
          <span style="margin-right: 14px; cursor: pointer;">File</span>
          <span style="margin-right: 14px; cursor: pointer;">Edit</span>
          <span style="margin-right: 14px; cursor: pointer;">View</span>
          <span style="margin-right: 14px; cursor: pointer;">Insert</span>
          <span style="margin-right: 14px; cursor: pointer;">Cell</span>
          <span style="margin-right: 14px; cursor: pointer;">Kernel</span>
          <span style="margin-right: 14px; cursor: pointer;">Widgets</span>
          <span style="cursor: pointer;">Help</span>
        </div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 14px;">
      <div style="display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; color: #333; background: #f5f5f5; padding: 5px 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #4caf50; display: inline-block;"></span>
        <span>Python 3 (ipykernel)</span>
        <span style="font-size: 11px; color: #666; font-weight: normal;">| Idle</span>
      </div>
    </div>
  </div>

  <!-- Jupyter Toolbar -->
  <div style="display: flex; align-items: center; gap: 10px; padding: 8px 18px; background: #fbfbfb; border-bottom: 1px solid #eaeaea; font-size: 12px; color: #555;">
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px; font-weight: 600;">💾 Save</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px;">➕ Cell</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px;">✂️ Cut</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px;">📋 Copy</span>
    <span style="background: #e8f5e9; border: 1px solid #81c784; padding: 3px 10px; border-radius: 4px; font-weight: 600; color: #2e7d32;">▶ Run All</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px;">⏹ Stop</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px;">🔄 Restart</span>
    <span style="background: white; border: 1px solid #ccc; padding: 3px 8px; border-radius: 4px; font-weight: 600; color: #1565c0;">Code</span>
    <span style="border-left: 1px solid #dcdcdc; height: 18px; margin: 0 4px;"></span>
    <span style="font-weight: 600; color: #222;">SLIIT Research Project J26-IT339 (Component 3)</span>
    <span style="margin-left: auto; color: #666; font-weight: 500;">Dataset: Tourism_Master_Validated (1).csv (16,156 Reviews / 48,516 Samples)</span>
  </div>
</div>
"""

ENHANCED_PRINT_CSS = """
<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 12mm 14mm 14mm 14mm;
  }
  body {
    background-color: #ffffff !important;
    color: #212121 !important;
    font-size: 10.5pt !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .jupyter-header-container {
    display: block !important;
    margin-bottom: 20px !important;
    page-break-after: avoid !important;
  }
  .jp-Cell {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin-bottom: 18px !important;
  }
  .jp-CodeCell {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    border-radius: 6px !important;
  }
  .jp-Cell-inputWrapper {
    background-color: #f7f7f7 !important;
    border: 1px solid #cfd8dc !important;
    border-radius: 4px !important;
  }
  .jp-InputPrompt {
    color: #303f9f !important;
    font-weight: bold !important;
    font-family: 'Consolas', monospace !important;
  }
  .jp-OutputPrompt {
    color: #d32f2f !important;
    font-weight: bold !important;
    font-family: 'Consolas', monospace !important;
  }
  .jp-RenderedImage {
    text-align: center !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  .jp-RenderedImage img {
    max-width: 96% !important;
    height: auto !important;
    margin: 12px auto !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 6px !important;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05) !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  table.dataframe, table.table {
    border-collapse: collapse !important;
    width: 100% !important;
    margin: 12px 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
  table.dataframe th, table.table th {
    background-color: #eceff1 !important;
    color: #263238 !important;
    font-weight: 700 !important;
    border: 1px solid #b0bec5 !important;
    padding: 6px 10px !important;
  }
  table.dataframe td, table.table td {
    border: 1px solid #cfd8dc !important;
    padding: 5px 10px !important;
  }
  table.dataframe tr:nth-child(even) {
    background-color: #f8f9fa !important;
  }
  h1, h2, h3, h4 {
    page-break-after: avoid !important;
    break-after: avoid !important;
    color: #0d47a1 !important;
  }
}
</style>
"""


def main():
    print(f"Reading HTML from: {HTML_INPUT_PATH}")
    with open(HTML_INPUT_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Inject Print CSS before </head>
    head_end = html.find("</head>")
    if head_end != -1:
        html = html[:head_end] + ENHANCED_PRINT_CSS + html[head_end:]

    # 2. Inject Jupyter Header at start of <main> or <body>
    main_start = html.find("<main>")
    if main_start != -1:
        insert_pos = main_start + len("<main>")
        html = html[:insert_pos] + JUPYTER_HEADER_HTML + html[insert_pos:]
    else:
        body_start = html.find("<body")
        if body_start != -1:
            tag_end = html.find(">", body_start)
            insert_pos = tag_end + 1
            html = html[:insert_pos] + JUPYTER_HEADER_HTML + html[insert_pos:]

    # Save styled HTML
    with open(STYLED_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Saved styled HTML to: {STYLED_HTML_PATH}")

    # 3. Print to PDF via Chrome/Edge headless
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    browser = chrome_path if os.path.exists(chrome_path) else edge_path

    print(f"Rendering PDF with browser engine: {browser}")
    cmd = [
        browser,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={PDF_OUTPUT_PATH}",
        "--no-pdf-header-footer",
        f"file:///{STYLED_HTML_PATH.replace(os.sep, '/')}",
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(PDF_OUTPUT_PATH):
        pdf_size = os.path.getsize(PDF_OUTPUT_PATH)
        print(f"[SUCCESS] PDF Generated: {PDF_OUTPUT_PATH} ({pdf_size:,} bytes)")

        # Make copy at Train_Enjoyment_Model_J26_IT339.pdf
        shutil.copyfile(PDF_OUTPUT_PATH, PDF_COPY_PATH)
        print(f"Copied to: {PDF_COPY_PATH}")

        # Also copy to artifacts directory for user preview
        if os.path.exists(ARTIFACT_DIR):
            artifact_pdf = os.path.join(ARTIFACT_DIR, "TravelMate_J26_IT339_Jupyter_Notebook_Report.pdf")
            shutil.copyfile(PDF_OUTPUT_PATH, artifact_pdf)
            print(f"Copied to artifacts: {artifact_pdf}")
    else:
        print(f"[ERROR] PDF generation failed with code {res.returncode}")
        print("Stderr:", res.stderr)
        print("Stdout:", res.stdout)


if __name__ == "__main__":
    main()
