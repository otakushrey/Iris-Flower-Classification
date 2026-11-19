import os
import base64
import xml.etree.ElementTree as ET

charts = [
    'eda_heatmap.png',
    'eda_pairplot.png',
    'eda_boxplots.png',
    'eda_distributions.png',
    'pca_2d.png',
    'pca_3d.png',
    'pca_scree.png',
    'pca_loadings.png',
    'model_loss_curve.png',
    'model_accuracy_curve.png',
    'model_confusion_matrix.png'
]

print("=== Checking Chart PNGs ===")
chart_b64 = {}
for c in charts:
    path = os.path.join('report_build/charts', c)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('utf-8')
            chart_b64[c] = f"data:image/png;base64,{b64}"
            print(f"  ✓ {c}: {len(b64)} chars")
    else:
        print(f"  ✗ MISSING: {c}")

print("\n=== Checking Diagram SVGs ===")
svg_contents = {}
for i in range(1, 6):
    names = [
        'figure1_architecture.svg',
        'figure2_execution_flow.svg',
        'figure3_sequence_diagram.svg',
        'figure4_class_diagram.svg',
        'figure5_validation_pipeline.svg'
    ]
    name = names[i-1]
    path = os.path.join('report_build/diagrams', name)
    with open(path, 'r', encoding='utf-8') as f:
        txt = f.read()
        # Verify valid XML
        ET.fromstring(txt)
        svg_contents[name] = txt
        print(f"  ✓ {name}: {len(txt)} chars, valid XML")
