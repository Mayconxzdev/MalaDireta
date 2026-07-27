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
        .replace(/Vesper Equipamentos(?: EX LTDA)?/gi, 'Empresa Exemplo LTDA')
        .replace(/Equipamentos EX LTDA/gi, 'Empresa Exemplo LTDA')
        .replace(/Vesper/gi, 'Empresa Exemplo')
        .replace(/vesper\.ind\.br/gi, 'empresa-exemplo.com.br')
        .replace(/www\.Empresa Exemplo\.ind\.br/gi, 'www.empresa-exemplo.com.br')
        .replace(/SkyMail/gi, 'provedor SMTP')
        .replace(/(?:AGRADECIMENTOS\s+)?FPSO EXPO 2026\s*(?:->|—|-)\s*NAVALSHORE 2026/gi, 'Comunicado de demonstracao')
        .replace(/Navalshore[_\s-]*2026/gi, 'evento-demonstrativo')
        .replace(/FPSO EXPO 2026/gi, 'Evento demonstrativo')
        .replace(/(?:Cel\.?\s*:\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}-\d{4}(?:\s*\|\s*(?:\(?\d{2}\)?\s*)?\d{4,5}-\d{4})*/g, 'Telefone demonstrativo');
    }

    document.title = 'Mala Direta — demonstração';
    const brand = document.querySelector('.brand h1');
    if (brand) brand.textContent = 'Mala Direta — demonstração';

    document.querySelectorAll('#signatureEditor img, [data-signature-preview] img').forEach((image) => {
      const placeholder = document.createElement('div');
      placeholder.textContent = 'Imagem institucional — demonstração';
      placeholder.style.cssText = 'display:inline-block;margin:6px 0;padding:10px 12px;border:1px dashed #9db5d8;border-radius:8px;background:#f8fafc;color:#52627a;font:700 12px Inter,Segoe UI,Arial,sans-serif';
      image.replaceWith(placeholder);
    });

    document.querySelectorAll('input, textarea').forEach((element) => {
      if (element.value) {
        element.value = element.value
          .replace(emailPattern, fakeEmail)
          .replace(/Vesper/gi, 'Empresa Exemplo')
          .replace(/Navalshore 2026/gi, 'Evento demonstrativo')
          .replace(/FPSO EXPO 2026/gi, 'Evento demonstrativo');
      }
      if (element.placeholder) element.placeholder = element.placeholder.replace(emailPattern, 'contato@empresa-exemplo.com.br');
    });

    document.querySelectorAll('table').forEach((table) => {
      const headers = [...table.querySelectorAll('thead th')].map((cell) => cell.textContent || '');
      const campaignTable = headers.some((text) => /^campanha$/i.test(text.trim()));
      [...table.querySelectorAll('tbody tr')].forEach((row, index) => {
        const cells = [...row.querySelectorAll('td')];
        if (campaignTable && cells.length) {
          cells[0].textContent = `Campanha demonstrativa ${index + 1}`;
          if (cells[2]) cells[2].textContent = `${(index + 1) * 12} de ${(index + 1) * 12}`;
          return;
        }
        const emailCell = cells.find((cell) => /@/.test(cell.textContent || ''));
        if (emailCell) {
          emailCell.textContent = `contato${String(index + 1).padStart(2, '0')}@empresa-exemplo.com.br`;
          const emailIndex = cells.indexOf(emailCell);
          if (emailIndex > 0) cells[emailIndex - 1].textContent = `Empresa Exemplo ${index + 1}`;
        }
      });
    });

    const demoStats = { sContacts: '248', sRunning: '1', sSent: '1.036', sErrors: '0' };
    for (const [id, value] of Object.entries(demoStats)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    }

    const campaignModal = document.getElementById('campaignModal');
    if (campaignModal && campaignModal.classList.contains('open')) {
      const modalTitle = campaignModal.querySelector('.modalhead h2');
      if (modalTitle) modalTitle.textContent = 'Nova campanha demonstrativa';
      const form = document.getElementById('campaignForm');
      if (form) {
        const name = form.querySelector('input[name="name"]');
        const subject = form.querySelector('input[name="subject"]');
        if (name) name.value = 'Comunicado demonstrativo';
        if (subject) subject.value = 'Atualização para parceiros';
      }
      const editor = document.getElementById('messageEditor');
      if (editor) editor.innerHTML = '<p>Olá,</p><p>Esta é uma mensagem demonstrativa para apresentar o fluxo de revisão, destinatários, assinatura e envio seguro.</p>';
      document.querySelectorAll('#attachmentList .file span, #inlineList .file span').forEach((element, index) => {
        element.textContent = `arquivo-demonstrativo-${index + 1}.pdf · 128 KB`;
      });
    }

    const signatureEditor = document.getElementById('signatureEditor');
    if (signatureEditor) {
      signatureEditor.innerHTML = '<p>Atenciosamente,</p><strong style="color:#dc2626">Empresa Exemplo LTDA</strong><br><span>Contato institucional — demonstração</span><br><a href="mailto:contato@empresa-exemplo.com.br">contato@empresa-exemplo.com.br</a><div style="margin-top:10px;padding:10px 12px;border:1px dashed #9db5d8;border-radius:8px;background:#f8fafc;color:#52627a;font:700 12px Inter,Segoe UI,Arial,sans-serif">Imagem institucional — demonstração</div>';
    }
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
    await capture(page, async (current) => {
      await clickButton(current, '+ Nova campanha');
      const hasChoice = await current.evaluate(() => !![...document.querySelectorAll('button')].find((item) => (item.textContent || '').trim() === 'Começar do zero'));
      if (hasChoice) await clickButton(current, 'Começar do zero');
    }, '02-mensagem-e-previa.png');
    await capture(page, async (current) => {
      await clickButton(current, '+ Nova campanha');
      const hasChoice = await current.evaluate(() => !![...document.querySelectorAll('button')].find((item) => (item.textContent || '').trim() === 'Começar do zero'));
      if (hasChoice) await clickButton(current, 'Começar do zero');
      await current.type('input[placeholder="Ex.: Evento de junho"]', 'Comunicado de demonstracao');
      await current.type('input[placeholder="Assunto que o destinatário verá"]', 'Novidades para nossos parceiros');
      await clickButton(current, 'Continuar');
    }, '03-selecao-destinatarios.png');
    await capture(page, async (current) => clickButton(current, 'Contatos'), '04-gerenciamento-contatos.png');
    await capture(page, async (current) => {
      await clickButton(current, 'Configurações');
      await current.evaluate(() => {
        const editor = document.getElementById('signatureEditor');
        if (editor) editor.style.minHeight = '300px';
      });
    }, '05-configuracao-e-protecao.png');
    await capture(page, async (current) => clickButton(current, 'Campanhas'), '06-campanhas-e-fila.png');
    await generateCover(browser);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
