# Estratégia de testes

## Validação automatizada do repositório

```powershell
npm ci
npm test
```

`validate-public-workflows.js` verifica:

- JSON válido e workflows públicos desativados;
- no mínimo 150 nós no principal e 4 no workflow de erros;
- três rotas públicas esperadas;
- dois Email Send nodes, dois Schedule Triggers, `Split In Batches` e pelo menos 70 Data Table nodes;
- presença do loop de envio seguro e dos ramos de assinatura;
- ausência de credenciais incorporadas;
- sintaxe de cada Code node com `AsyncFunction`.

`security-scan.ps1` procura IPs privados, caminhos locais, domínios corporativos, e-mails não demonstrativos e padrões comuns de segredo. A preparação do export substitui IDs de Data Tables por placeholders e remove metadados de publicação.

## Checklist funcional seguro

| Cenário | Resultado esperado |
|---|---|
| abrir painel | HTTP 200 e layout completo |
| salvar rascunho | campanha atualizada sem iniciar fila |
| reabrir rascunho com anexo | mensagem, escolha de assinatura e metadados permanecem disponíveis |
| trocar assinatura padrão | nova versão disponível sem reescrever campanha já salva |
| restaurar padrão | versão-base volta a ser a seleção padrão |
| escolher assinatura sem imagem | a campanha usa o HTML sem imagens, sem apagar a versão completa da biblioteca |
| importar contato duplicado | upsert sem duplicação |
| bloquear contato | destinatário fica inelegível |
| cancelar campanha com lote pendente | próximos itens são bloqueados na revalidação antes do SMTP |
| atualizar dashboard enquanto fila roda | indicadores continuam disponíveis sem paginação concorrente |
| reiniciar n8n | webhooks continuam registrados |
| falha SMTP controlada | erro registrado e campanha não perde estado |

## Regra de segurança

Testes de interface não devem clicar em “iniciar campanha” contra dados reais. A validação do painel pode abrir modais, pesquisar, filtrar e salvar rascunho em ambiente isolado; um envio SMTP exige destinatário explicitamente autorizado.

Um cancelamento também deve ser testado com uma campanha de laboratório e destinatários autorizados. A automação impede os próximos itens pendentes, mas não pode revogar uma mensagem que já tenha sido aceita pelo SMTP.
