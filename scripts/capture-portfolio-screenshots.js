const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const root = path.resolve(__dirname, '..');
const screenshotDir = path.join(root, 'docs', 'assets', 'screenshots');
const workflowDir = path.join(root, 'docs', 'assets', 'workflow');
const coverDir = path.join(root, 'docs', 'assets', 'cover');
const panelUrl = process.env.PANEL_URL || 'http://localhost:5678/webhook/mala-direta';
const chromeCandidates = [
  process.env.CHROME_PATH,
  process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].filter(Boolean);
const executablePath = chromeCandidates.find((candidate) => fs.existsSync(candidate));

for (const directory of [screenshotDir, workflowDir, coverDir]) fs.mkdirSync(directory, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sanitizeVisibleData(page) {
  await page.evaluate(() => {
    let counter = 1;
    const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
    const fakeEmail = () => `contato${String(counter++).padStart(2, '0')}@empresa-exemplo.com.br`;

    const scrubObject = (value, seen = new WeakSet()) => {
      if (!value || typeof value !== 'object' || seen.has(value)) return;
      seen.add(value);
      for (const [key, item] of Object.entries(value)) {
        if (typeof item === 'string') {
          if (/email|mail|remetente|destinatario/i.test(key) || emailPattern.test(item)) value[key] = item.replace(emailPattern, fakeEmail);
          else if (/empresa|company/i.test(key)) value[key] = `Empresa Exemplo ${counter++}`;
          emailPattern.lastIndex = 0;
        } else scrubObject(item, seen);
      }
    };

    for (const key of ['__MDV_DATA__', '__MALA_DIRETA_DATA__']) {
      if (window[key]) scrubObject(window[key]);
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      node.nodeValue = (node.nodeValue || '')
        .replace(emailPattern, fakeEmail)
        .replace(/Vesper/gi, 'Portfolio')
        .replace(/SkyMail/gi, 'provedor SMTP')
        .replace(/AGRADECIMENTOS FPSO EXPO 2026\s*->\s*NAVALSHORE 2026/gi, 'Comunicado de demonstracao');
    }

    document.querySelectorAll('input, textarea').forEach((element) => {
      if (element.value) element.value = element.value.replace(emailPattern, fakeEmail);
      if (element.placeholder) element.placeholder = element.placeholder.replace(emailPattern, 'contato@empresa-exemplo.com.br');
    });

    document.querySelectorAll('table tbody tr').forEach((row, index) => {
      const cells = [...row.querySelectorAll('td')];
      const emailCell = cells.find((cell) => /@/.test(cell.textContent || ''));
      if (emailCell) {
        emailCell.textContent = `contato${String(index + 1).padStart(2, '0')}@empresa-exemplo.com.br`;
        const emailIndex = cells.indexOf(emailCell);
        if (emailIndex > 0) cells[emailIndex - 1].textContent = `Empresa Exemplo ${index + 1}`;
      } else if (cells.length && /campanha|histórico|fila antiga|mensagem migrada/i.test(cells[0].textContent || '')) {
        cells[0].textContent = `Campanha de demonstracao ${index + 1}`;
      }
    });
  });
}

async function clickButton(page, label) {
  const clicked = await page.evaluate((text) => {
    const button = [...document.querySelectorAll('button')].find((item) => (item.textContent || '').trim() === text);
    if (!button) return false;
    button.click();
    return true;
  }, label);
  if (!clicked) throw new Error(`Botao nao encontrado: ${label}`);
  await sleep(850);
}

async function capture(page, action, fileName) {
  try {
    await page.goto(panelUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (error) {
    if (!String(error.message).includes('ERR_ABORTED')) throw error;
    await sleep(500);
    await page.goto(panelUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  }
  if (action) await action(page);
  await sanitizeVisibleData(page);
  await sleep(450);
  await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: false });
  console.log(`OK ${fileName}`);
}

async function generateCover(browser) {
  const dashboard = fs.readFileSync(path.join(screenshotDir, '01-dashboard.png')).toString('base64');
  const workflowPath = path.join(workflowDir, '01-workflow-completo.png');
  const workflow = fs.existsSync(workflowPath) ? fs.readFileSync(workflowPath).toString('base64') : '';
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 700 });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#07111f;font-family:Inter,Segoe UI,Arial;color:#fff"><main style="height:700px;display:grid;grid-template-columns:1.08fr .92fr"><section style="position:relative;overflow:hidden"><img src="data:image/png;base64,${dashboard}" style="width:100%;height:100%;object-fit:cover;object-position:top"><div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,17,31,.08),rgba(7,17,31,.82))"></div></section><section style="padding:58px 58px 48px 30px;display:flex;flex-direction:column;justify-content:center"><div style="font-size:14px;letter-spacing:.16em;color:#60a5fa;text-transform:uppercase">Case real · automação n8n</div><h1 style="font-size:58px;line-height:1;margin:14px 0">Mala Direta</h1><p style="font-size:22px;line-height:1.45;color:#cbd5e1;margin:0 0 28px">Campanhas de e-mail com painel web, fila persistente, deduplicação e rastreabilidade.</p>${workflow ? `<img src="data:image/png;base64,${workflow}" style="width:100%;height:225px;object-fit:cover;object-position:center;border:1px solid #334155;border-radius:16px">` : ''}</section></main></body></html>`);
  await page.screenshot({ path: path.join(coverDir, 'cover.png') });
  await page.close();
  console.log('OK cover.png');
}

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  try {
    await capture(page, null, '01-dashboard.png');
    await capture(page, async (current) => clickButton(current, '+ Nova campanha'), '02-mensagem-e-previa.png');
    await capture(page, async (current) => {
      await clickButton(current, '+ Nova campanha');
      await current.type('input[placeholder="Ex.: Evento de junho"]', 'Comunicado de demonstracao');
      await current.type('input[placeholder="Assunto que o destinatário verá"]', 'Novidades para nossos parceiros');
      await clickButton(current, 'Continuar');
    }, '03-selecao-destinatarios.png');
    await capture(page, async (current) => clickButton(current, 'Contatos'), '04-gerenciamento-contatos.png');
    await capture(page, async (current) => clickButton(current, 'Configurações'), '05-configuracao-e-protecao.png');
    await capture(page, async (current) => clickButton(current, 'Campanhas'), '06-campanhas-e-fila.png');
    await generateCover(browser);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
