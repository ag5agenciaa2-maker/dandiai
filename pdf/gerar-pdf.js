const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FILE = 'file:///' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');
const OUT  = path.resolve(__dirname, 'dandi-manual.pdf');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2']
  });

  const page = await browser.newPage();

  // Viewport desktop largo — evita breakpoints mobile
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  console.log('Abrindo página...');
  await page.goto(FILE, { waitUntil: 'networkidle0', timeout: 60000 });

  // Aguarda fontes e imagens carregarem
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 2000));

  // Coleta todos os IDs de section
  const sections = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]')).map(s => s.id)
  );
  console.log(`${sections.length} seções encontradas.`);

  const pdfPages = [];
  const tmpDir = path.join(__dirname, '_tmp_pages');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  for (let i = 0; i < sections.length; i++) {
    const id = sections[i];
    process.stdout.write(`  Capturando ${i + 1}/${sections.length}: #${id} ...`);

    // Rola até a seção e captura
    const rect = await page.evaluate((sId) => {
      const el = document.getElementById(sId);
      if (!el) return null;
      el.scrollIntoView();
      const r = el.getBoundingClientRect();
      return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height };
    }, id);

    if (!rect || rect.h < 10) { console.log(' ignorado (sem altura)'); continue; }

    const imgPath = path.join(tmpDir, `page-${String(i).padStart(3,'0')}-${id}.png`);
    await page.screenshot({
      path: imgPath,
      clip: { x: 0, y: rect.y, width: 1920, height: rect.h },
      fullPage: false
    });
    pdfPages.push({ id, imgPath, height: rect.h });
    console.log(' ok');
  }

  await browser.close();

  // Monta PDF com puppeteer a partir das imagens
  console.log('\nMontando PDF...');
  const browser2 = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const pdfPage  = await browser2.newPage();

  // Cria HTML com cada imagem em uma página A4 landscape
  const imgs = pdfPages.map(p => {
    const data = fs.readFileSync(p.imgPath).toString('base64');
    return `<div class="pg"><img src="data:image/png;base64,${data}"></div>`;
  }).join('\n');

  const html = `<!DOCTYPE html><html><head><style>
    @page { size: A4 landscape; margin: 0; }
    * { margin:0; padding:0; box-sizing:border-box; }
    .pg { width:297mm; height:210mm; overflow:hidden; page-break-after:always; display:flex; align-items:center; justify-content:center; background:#0D0D0D; }
    .pg img { width:297mm; height:210mm; object-fit:contain; }
  </style></head><body>${imgs}</body></html>`;

  await pdfPage.setContent(html, { waitUntil: 'networkidle0' });
  await pdfPage.pdf({
    path: OUT,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  await browser2.close();

  // Limpa temporários
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log(`\nPDF gerado: ${OUT}`);
})();
