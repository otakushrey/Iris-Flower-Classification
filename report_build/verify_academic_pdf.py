import pymupdf
import os

doc = pymupdf.open('Project_Report.pdf')
print(f"Total Pages in Project_Report.pdf: {len(doc)}")
print(f"File Size: {os.path.getsize('Project_Report.pdf')} bytes")

# Check for raw mermaid syntax or syntax errors
syntax_errors = []
for i, page in enumerate(doc):
    txt = page.get_text('text')
    if "Syntax error in text" in txt or "graph TD" in txt or "flowchart TD" in txt or "sequenceDiagram" in txt:
        syntax_errors.append((i+1, txt[:200]))

if syntax_errors:
    print(f"WARNING: Raw mermaid syntax found on pages: {syntax_errors}")
else:
    print("✓ ZERO raw Mermaid syntax or error boxes found across all pages!")

# Render pages to PNG previews for visual verification
preview_dir = 'report_build/pdf_academic_previews'
os.makedirs(preview_dir, exist_ok=True)

pages_to_render = [1, 2, 3, 4, 8, 9, 10, 15, 17, 18, 20, 22, 24]
for p in pages_to_render:
    if p <= len(doc):
        page = doc[p-1]
        pix = page.get_pixmap(dpi=150)
        pix_path = os.path.join(preview_dir, f"page_{p}.png")
        pix.save(pix_path)
        print(f"  Saved visual preview: {pix_path} ({pix.width}x{pix.height})")

print("\n--- Page Structure Overview ---")
for i in range(len(doc)):
    txt = doc[i].get_text('text').strip()
    first_line = txt.split('\n')[0] if txt else 'EMPTY'
    print(f"Page {i+1}: {first_line[:70]}")
