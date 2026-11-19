import xml.etree.ElementTree as ET

for svg_name in [
    'figure1_architecture.svg',
    'figure2_execution_flow.svg',
    'figure3_sequence_diagram.svg',
    'figure4_class_diagram.svg',
    'figure5_validation_pipeline.svg'
]:
    path = f'report_build/diagrams/{svg_name}'
    try:
        tree = ET.parse(path)
        root = tree.getroot()
        print(f"{svg_name}: Valid XML. tag={root.tag}, attrib={root.attrib.get('viewBox')}")
    except Exception as e:
        print(f"{svg_name}: XML ERROR: {e}")
