import fitz  # PyMuPDF
import os

pdf_path = r'D:\Iris Flower Classification\Project_Report.pdf'
previews_dir = r'D:\Iris Flower Classification\report_build\pdf_previews'
os.makedirs(previews_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total Pages: {len(doc)}")

required_sections = [
    "1. Abstract",
    "2. Introduction",
    "3. Literature Review",
    "4. Background Study",
    "5. Design Flow and Architectural Process",
    "6. Result Analysis & Validation",
    "7. Conclusions and Future Work",
    "8. References",
    "9. Appendix"
]

full_text = ""
page_section_map = {}

for i, page in enumerate(doc):
    text = page.get_text()
    full_text += f"\n--- PAGE {i + 1} ---\n" + text
    for sec in required_sections:
        if sec in text and sec not in page_section_map:
            page_section_map[sec] = i + 1

    # Render first 5 pages and key diagram pages as PNG previews
    if i < 6 or i == len(doc) - 1:
        pix = page.get_pixmap(dpi=150)
        preview_file = os.path.join(previews_dir, f'page_{i+1:02d}.png')
        pix.save(preview_file)
        print(f"Rendered preview: page_{i+1:02d}.png")

print("\n--- Section Page Verification ---")
for sec in required_sections:
    if sec in page_section_map:
        print(f"✓ {sec} found on Page {page_section_map[sec]}")
    else:
        print(f"✗ MISSING: {sec}")

# Check figures
figures = [
    "Figure 1: High-Level System Architecture",
    "Figure 2: End-to-End Design and Execution",
    "Figure 3: Core Request and Data Sequence",
    "Figure 4: Component, Class, and Object Dependency",
    "Figure 5: Neural Network Validation",
    "Figure 6: Empirical Training",
    "Figure 7: Exploratory Data Analysis",
    "Figure 8: Dimensionality Reduction"
]

print("\n--- Figures Verification ---")
for fig in figures:
    if fig in full_text:
        print(f"✓ {fig}")
    else:
        print(f"✗ Missing: {fig}")
