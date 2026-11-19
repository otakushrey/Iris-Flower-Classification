# Generator script for Chandigarh University Format Academic Project Report
import os
import base64
import re
import xml.etree.ElementTree as ET

def build_academic_report():
    print("Building Publication-Grade Academic Project Report...")
    
    # 1. Load Chart Base64 URIs
    charts_dir = 'report_build/charts'
    charts_b64 = {}
    for fname in os.listdir(charts_dir):
        if fname.endswith('.png'):
            with open(os.path.join(charts_dir, fname), 'rb') as f:
                charts_b64[fname] = "data:image/png;base64," + base64.b64encode(f.read()).decode('utf-8')
    
    # 2. Load and Clean SVGs
    diagrams_dir = 'report_build/diagrams'
    diagrams_svg = {}
    diagrams_b64 = {}
    
    diagram_keys = [
        'figure1_architecture',
        'figure2_execution_flow',
        'figure3_sequence_diagram',
        'figure4_class_diagram',
        'figure5_validation_pipeline'
    ]
    
    for d in diagram_keys:
        svg_path = os.path.join(diagrams_dir, f"{d}.svg")
        png_path = os.path.join(diagrams_dir, f"{d}.png")
        
        with open(svg_path, 'r', encoding='utf-8') as f:
            svg_content = f.read()
        
        # Clean unclosed tags
        clean_svg = re.sub(r'<br(?!\s*\/)>', '<br/>', svg_content)
        clean_svg = re.sub(r'<hr(?!\s*\/)>', '<hr/>', clean_svg)
        clean_svg = re.sub(r'<img([^>\/]*)(?<!\/)>', r'<img\1/>', clean_svg)
        
        # Clean potential SVG root styling to ensure it is responsive
        clean_svg = re.sub(r'style="max-width:\s*[^;"]+;"', 'style="max-width: 100%; height: auto;"', clean_svg)
        diagrams_svg[d] = clean_svg
        
        if os.path.exists(png_path):
            with open(png_path, 'rb') as f:
                diagrams_b64[d] = "data:image/png;base64," + base64.b64encode(f.read()).decode('utf-8')

    print(f"Loaded {len(charts_b64)} charts and {len(diagrams_svg)} diagrams.")
    return charts_b64, diagrams_svg, diagrams_b64

if __name__ == '__main__':
    charts_b64, diagrams_svg, diagrams_b64 = build_academic_report()
