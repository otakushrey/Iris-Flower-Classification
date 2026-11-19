const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.resolve(__dirname, 'report_academic.html');
const pdfPath = path.resolve(__dirname, '..', 'Project_Report.pdf');

async function generatePDF() {
  console.log('Launching Chrome to generate Publication-Grade Academic Project Report PDF...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--allow-file-access-from-files'
    ]
  });

  const page = await browser.newPage();
  
  // Emulate print media
  await page.emulateMediaType('print');
  
  console.log(`Navigating to file://${htmlPath}...`);
  await page.goto(`file://${htmlPath}`, {
    waitUntil: ['load', 'networkidle0'],
    timeout: 60000
  });

  // Ensure all images are loaded
  await page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll('img'));
    await Promise.all(selectors.map(img => {
      if (img.complete) return;
      return new Promise((resolve, reject) => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', reject);
      });
    }));
  });

  console.log('Generating A4 PDF with running headers and footers...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8pt; font-family: 'Times New Roman', serif; width: 100%; padding: 0 20mm; display: flex; justify-content: space-between; color: #555; border-bottom: 0.5px solid #bbb;">
        <span style="text-transform: uppercase; letter-spacing: 0.5px;">Chandigarh University &bull; B.E. Computer Science &amp; Engineering</span>
        <span>Iris Flower Classification</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8.5pt; font-family: 'Times New Roman', serif; width: 100%; padding: 0 20mm; display: flex; justify-content: space-between; color: #555; border-top: 0.5px solid #bbb;">
        <span>Department of Computer Science &amp; Engineering</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '22mm',
      bottom: '22mm',
      left: '20mm',
      right: '20mm'
    }
  });

  await browser.close();
  const stats = fs.statSync(pdfPath);
  console.log(`✓ Successfully generated ${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
}

generatePDF().catch(err => {
  console.error('Fatal error during PDF generation:', err);
  process.exit(1);
});
