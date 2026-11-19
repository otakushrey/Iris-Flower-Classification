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

async function renderHighRes() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    defaultViewport: { width: 3600, height: 2800, deviceScaleFactor: 2 },
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
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 40px;
            background: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          #render-box {
            display: inline-block;
            background: #ffffff;
            padding: 24px;
            border-radius: 8px;
          }
          svg {
            max-width: none !important;
            height: auto !important;
          }
        </style>
        <script>
          mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            themeVariables: {
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontSize: '15px',
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
            sequence: { actorFontSize: 15, messageFontSize: 13, wrap: true }
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
      const rawSvg = await page.evaluate(async (id, code) => {
        const { svg } = await window.mermaid.render('diagram-' + id, code);
        const box = document.getElementById('render-box');
        box.innerHTML = svg;
        return svg;
      }, i, mmdCode);

      // Clean unclosed tags to make strict XML
      let cleanSvg = rawSvg.replace(/<br(?!\s*\/)>/gi, '<br/>')
                           .replace(/<hr(?!\s*\/)>/gi, '<hr/>')
                           .replace(/<img([^>\/]*)(?<!\/)>/gi, '<img$1/>');

      fs.writeFileSync(svgPath, cleanSvg, 'utf8');

      // Screenshot the element
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
  console.log('Done!');
}

renderHighRes().catch(console.error);
