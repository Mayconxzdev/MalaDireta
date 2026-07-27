# Changelog

## 2.1.0 — 2026-07-27

- workflow principal atualizado para 158 nós, com 72 Data Table nodes e loop seguro de envio por lote;
- biblioteca de assinatura versionada, padrão restaurável, escolha por campanha e snapshot de contexto;
- opção por campanha para incluir ou ocultar imagens sem perder a assinatura completa da biblioteca;
- revalidação de status e elegibilidade antes de cada destinatário pendente, reduzindo risco após pausa ou cancelamento;
- dashboard ajustado para agregações estáveis, evitando paginação concorrente durante o processamento;
- export público refeito a partir da versão atual, sanitizado, inativo e validado por sintaxe de Code nodes;
- documentação, screenshots demonstrativas e evidências de arquitetura atualizadas para o portfólio.

## 2.0.0 — 2026-07-14

- migração da persistência legada para nove n8n Data Tables sobre PostgreSQL;
- workflow principal ampliado para 147 nós;
- campanhas e destinatários com ciclo de vida e auditoria separados;
- lista de supressão, importação, exportação e bloqueio operacional;
- workflow dedicado de tratamento de erros;
- migração idempotente de contatos, grupos, configurações, histórico e fila;
- publicação persistente dos webhooks validada após reinício do n8n;
- backup diário do banco com retenção dos 30 arquivos mais recentes;
- repositório de portfólio refeito com capturas sanitizadas e CI de segurança.

## 1.0.0 — 2026-06-16

- painel inicial para mensagem, teste, contatos, grupos e envio parcelado;
- persistência em arquivos no volume Docker;
- deduplicação inicial e histórico de envios.
