const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = path.join(__dirname, 'report.html');
const outputPath = path.join(__dirname, '..', 'Project_Report.pdf');

async function generatePDF() {
  console.log('Generating Project_Report.pdf from report.html...');
  console.log('Source HTML:', htmlPath);
  console.log('Output PDF:', outputPath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--enable-local-file-accesses'
    ]
  });

  const page = await browser.newPage();

  // Navigate to local report HTML file
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log('Loading URL:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 60000 });

  // Ensure all images are fully loaded and rendered
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

  console.log('All images verified loaded. Printing to PDF...');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: false
  });

  await browser.close();

  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`✓ Project_Report.pdf successfully created! Size: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } else {
    throw new Error('Project_Report.pdf was not generated.');
  }
}

generatePDF().catch(err => {
  console.error('Fatal error generating PDF:', err);
  process.exit(1);
});
