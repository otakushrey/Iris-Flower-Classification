const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const mermaidJs = fs.readFileSync(path.join(__dirname, 'mermaid.min.js'), 'utf8');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script>${mermaidJs}</script>
        <script>
          mermaid.initialize({ startOnLoad: false, theme: 'default' });
        </script>
      </head>
      <body>
        <div id="container"></div>
      </body>
    </html>
  `);

  const diagram = `graph TD; A[Input Data]-->B[StandardScaler]; B-->C[PyTorch IrisNet]; C-->D[Predictions];`;

  const svg = await page.evaluate(async (code) => {
    const { svg } = await window.mermaid.render('mermaid-svg-test', code);
    return svg;
  }, diagram);

  console.log('Successfully rendered Mermaid SVG! Length:', svg.length);
  fs.writeFileSync(path.join(__dirname, 'diagrams', 'test.svg'), svg);

  await browser.close();
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
