#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceMain = process.argv[2] || process.env.MDV_SOURCE_MAIN;
const sourceErrors = process.argv[3] || process.env.MDV_SOURCE_ERRORS;

if (!sourceMain || !sourceErrors) {
  console.error('Uso: node scripts/prepare-public-workflows.js <principal.json> <erros.json>');
  process.exit(1);
}

const tableIds = {
  data_table_user_6DdzvBoZxzDq8aa8: 'TABLE_MDV_CONTACTS',
  data_table_user_fB2Vy9boKSaGDe8w: 'TABLE_MDV_GROUPS',
  data_table_user_c7uVkoYdGftriXS3: 'TABLE_MDV_MEMBERSHIPS',
  data_table_user_Cy2qOvi8rA7cg9fi: 'TABLE_MDV_CAMPAIGNS',
  data_table_user_F06PLv1Tkku1tWOF: 'TABLE_MDV_RECIPIENTS',
  data_table_user_g3sfyKfufFgtZsfN: 'TABLE_MDV_SETTINGS',
  data_table_user_PD4QfoItjw0pZP1M: 'TABLE_MDV_SUPPRESSIONS',
  data_table_user_QFQa1jMRlhDAEMtj: 'TABLE_MDV_ERRORS',
  data_table_user_A2B2wD0YZ0v2MvVP: 'TABLE_MDV_EVENTS',
};

function sanitizeString(value) {
  let result = value;
  for (const [id, placeholder] of Object.entries(tableIds)) result = result.replaceAll(id, placeholder);
  return result
    .replace(/192\.168\.\d{1,3}\.\d{1,3}/g, 'localhost')
    .replace(/smtp\.[a-z0-9.-]+/gi, 'smtp.example.com')
    .replace(/[a-z0-9._%+-]+@(?!example\.com\b)[a-z0-9.-]+\.[a-z]{2,}/gi, 'remetente@example.com')
    .replace(/vesper\.ind\.br/gi, 'example.com')
    .replace(/Mala Direta Vesper/gi, 'Mala Direta')
    .replace(/Vesper Equipamentos/gi, 'Empresa Exemplo');
}

function sanitize(value) {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitize);
  if (!value || typeof value !== 'object') return value;

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (['credentials', 'shared', 'id', 'activeVersionId', 'triggerCount'].includes(key)) continue;
    if (key === 'versionId' && value.nodes) continue;
    output[key] = sanitize(item);
  }
  return output;
}

function prepare(source, target, publicName) {
  const raw = JSON.parse(fs.readFileSync(source, 'utf8'));
  const workflow = sanitize(raw);
  workflow.name = publicName;
  workflow.active = false;
  workflow.pinData = {};
  workflow.tags = [];
  delete workflow.meta;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(workflow, null, 2) + '\n');
  console.log(`OK ${path.relative(root, target)} (${workflow.nodes.length} nos)`);
}

prepare(sourceMain, path.join(root, 'workflow', 'mala-direta-principal.portfolio.json'), 'Mala Direta - Principal (portfolio)');
prepare(sourceErrors, path.join(root, 'workflow', 'mala-direta-erros.portfolio.json'), 'Mala Direta - Tratamento de Erros (portfolio)');
