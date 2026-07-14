# Estratégia de testes

## Testes automatizados do repositório

```powershell
npm ci
npm test
```

`validate-public-workflows.js` verifica:

- JSON válido e workflow desativado;
- mínimo de 140 nós no principal e 4 no workflow de erros;
- três Webhook nodes e rotas esperadas;
- dois Email Send nodes, dois Schedule Triggers e mais de 60 Data Table nodes;
- ausência de credenciais incorporadas e referências internas.

`security-scan.ps1` procura IPs privados, caminhos locais, domínios corporativos, e-mails não fictícios e padrões de segredo.

## Checklist funcional seguro

| Cenário | Resultado esperado |
|---|---|
| abrir painel | HTTP 200 e layout completo |
| salvar rascunho | campanha atualizada sem iniciar fila |
| importar contato duplicado | upsert sem duplicação |
| bloquear contato | destinatário fica inelegível |
| repetir migração | mesmas contagens |
| reiniciar n8n | webhooks continuam registrados |
| envio de teste | apenas endereço autorizado recebe |
| falha SMTP controlada | erro registrado e campanha não perde estado |
| backup agendado | arquivo criado e retorno 0 |

## Regra de segurança

Testes de interface não devem clicar em “iniciar campanha” contra dados reais. A validação do painel pode abrir modais, pesquisar, filtrar e salvar rascunho em ambiente isolado; um envio SMTP exige destinatário explicitamente autorizado.
