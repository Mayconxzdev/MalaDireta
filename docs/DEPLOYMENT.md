# Deploy local de referência

Esta documentação permite estudar e importar a topologia pública. Ela não contém segredos nem uma configuração SMTP pronta.

## Pré-requisitos

- Docker Desktop ou Docker Engine com Compose;
- Node.js 20+ apenas para validação do repositório;
- credencial SMTP própria;
- domínio de envio com SPF, DKIM e DMARC configurados.

## Subir a infraestrutura

```powershell
Copy-Item .env.example .env
# Edite .env e substitua todos os CHANGE_ME.
docker compose up -d
```

Abra `http://localhost:5678`, conclua a criação do usuário proprietário e importe:

1. `workflow/mala-direta-erros.portfolio.json`;
2. `workflow/mala-direta-principal.portfolio.json`.

## Data Tables

Crie as tabelas abaixo e substitua os placeholders dos Data Table nodes:

| Placeholder | Tabela |
|---|---|
| `TABLE_MDV_CONTACTS` | `mdv_contacts` |
| `TABLE_MDV_GROUPS` | `mdv_groups` |
| `TABLE_MDV_MEMBERSHIPS` | `mdv_memberships` |
| `TABLE_MDV_CAMPAIGNS` | `mdv_campaigns` |
| `TABLE_MDV_RECIPIENTS` | `mdv_recipients` |
| `TABLE_MDV_SETTINGS` | `mdv_settings` |
| `TABLE_MDV_SUPPRESSIONS` | `mdv_suppressions` |
| `TABLE_MDV_ERRORS` | `mdv_errors` |
| `TABLE_MDV_EVENTS` | `mdv_events` |

O workflow contém o ramo visual de preparação/migração, mas os IDs do ambiente real foram removidos. O rebind é uma barreira deliberada contra execução acidental do export público.

## Credencial SMTP

Cadastre a credencial na interface do n8n e associe-a aos dois nodes `emailSend`. Não coloque host, usuário ou senha no JSON, `.env.example`, documentação ou screenshot.

## Ordem de ativação

1. associe o workflow de erro em `Settings > Error workflow`;
2. publique o tratamento de erros;
3. publique o principal;
4. reinicie o n8n;
5. confirme `/healthz` e as três rotas;
6. use um único destinatário autorizado no primeiro teste.

Nunca inicie uma campanha real durante o teste de infraestrutura.
