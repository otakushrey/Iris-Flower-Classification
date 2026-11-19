const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const diagramsDir = path.join(__dirname, 'diagrams');

const diagramFiles = [
  'figure1_architecture.mmd',
  'figure2_execution_flow.mmd',
  'figure3_sequence_diagram.mmd',
  'figure4_class_diagram.mmd',
  'figure5_validation_pipeline.mmd'
];

async function renderAll() {
  console.log('Launching headless Chrome for Mermaid rendering...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 2400, height: 1600, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const mermaidJs = fs.readFileSync(path.join(__dirname, 'mermaid.min.js'), 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <script>${mermaidJs}</script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          #render-box {
            display: inline-block;
            background: #ffffff;
            padding: 15px;
          }
        </style>
        <script>
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '14px',
              primaryColor: '#e0e7ff',
              primaryTextColor: '#1e1b4b',
              primaryBorderColor: '#6366f1',
              lineColor: '#4f46e5',
              secondaryColor: '#fce7f3',
              tertiaryColor: '#d1fae5',
              noteBkgColor: '#f8fafc',
              noteTextColor: '#0f172a',
              noteBorderColor: '#94a3b8'
            },
            flowchart: { curve: 'basis', htmlLabels: true },
            sequence: { actorFontSize: 14, messageFontSize: 13, wrap: true }
          });
        </script>
      </head>
      <body>
        <div id="render-box"></div>
      </body>
    </html>
  `);

  for (let i = 0; i < diagramFiles.length; i++) {
    const filename = diagramFiles[i];
    const mmdPath = path.join(diagramsDir, filename);
    const svgName = filename.replace('.mmd', '.svg');
    const pngName = filename.replace('.mmd', '.png');
    const svgPath = path.join(diagramsDir, svgName);
    const pngPath = path.join(diagramsDir, pngName);

    console.log(`Rendering [${i + 1}/${diagramFiles.length}]: ${filename}`);
    const mmdCode = fs.readFileSync(mmdPath, 'utf8');

    try {
      // Render SVG in page
      const rawSvg = await page.evaluate(async (id, code) => {
        const { svg } = await window.mermaid.render('diagram-' + id, code);
        const box = document.getElementById('render-box');
        box.innerHTML = svg;
        return svg;
      }, i, mmdCode);

      // Clean unclosed tags to make 100% strict XML
      let cleanSvg = rawSvg.replace(/<br(?!\s*\/)>/gi, '<br/>')
                           .replace(/<hr(?!\s*\/)>/gi, '<hr/>')
                           .replace(/<img([^>\/]*)(?<!\/)>/gi, '<img$1/>');

      fs.writeFileSync(svgPath, cleanSvg, 'utf8');
      console.log(`  ✓ Saved clean SVG: ${svgName}`);

      // Capture high-DPI screenshot of the rendered SVG element
      const element = await page.$('#render-box');
      if (element) {
        await element.screenshot({ path: pngPath, type: 'png' });
        console.log(`  ✓ Saved high-DPI PNG: ${pngName}`);
      }
    } catch (err) {
      console.error(`  ✗ Error rendering ${filename}:`, err);
    }
  }

  await browser.close();
  console.log('All diagrams successfully rendered and exported to both clean SVG and high-DPI PNG!');
}

renderAll().catch(err => {
  console.error('Fatal error during diagram rendering:', err);
  process.exit(1);
});
