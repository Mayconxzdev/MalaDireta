const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const specs = [
  {
    file: 'workflow/mala-direta-principal.portfolio.json',
    minimumNodes: 140,
    types: {
      'n8n-nodes-base.webhook': 3,
      'n8n-nodes-base.emailSend': 2,
      'n8n-nodes-base.dataTable': 60,
      'n8n-nodes-base.scheduleTrigger': 2,
    },
  },
  {
    file: 'workflow/mala-direta-erros.portfolio.json',
    minimumNodes: 4,
    types: {
      'n8n-nodes-base.errorTrigger': 1,
      'n8n-nodes-base.dataTable': 1,
    },
  },
];

let failed = false;
for (const spec of specs) {
  const full = path.join(root, spec.file);
  const text = fs.readFileSync(full, 'utf8');
  const workflow = JSON.parse(text);
  const counts = workflow.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  const errors = [];
  if (workflow.active !== false) errors.push('o workflow publico deve estar desativado');
  if (workflow.nodes.length < spec.minimumNodes) errors.push(`quantidade de nos menor que ${spec.minimumNodes}`);
  if (workflow.nodes.some((node) => node.credentials && Object.keys(node.credentials).length)) errors.push('credencial incorporada');
  if (/192\.168\.\d{1,3}\.\d{1,3}|smtp\.skymail|vesper\.ind\.br|C:\\\\Users\\\\/i.test(text)) errors.push('referencia interna detectada');
  for (const [type, minimum] of Object.entries(spec.types)) {
    if ((counts[type] || 0) < minimum) errors.push(`${type}: esperado >= ${minimum}, encontrado ${counts[type] || 0}`);
  }

  const webhooks = workflow.nodes.filter((node) => node.type === 'n8n-nodes-base.webhook');
  const paths = new Set(webhooks.map((node) => node.parameters?.path));
  if (spec.file.includes('principal') && !['mala-direta', 'mala-direta-acao', 'mala-direta-exportar'].every((item) => paths.has(item))) {
    errors.push('rotas publicas esperadas nao foram encontradas');
  }

  if (errors.length) {
    failed = true;
    console.error(`FALHA ${spec.file}: ${errors.join('; ')}`);
  } else {
    console.log(`OK ${spec.file}: ${workflow.nodes.length} nos`);
  }
}

if (failed) process.exit(1);
console.log('Todos os workflows publicos passaram na validacao.');
