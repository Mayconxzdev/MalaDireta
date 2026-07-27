# Case técnico

## Contexto

O processo original dependia de planilha, cliente de e-mail e conferência manual. Isso criava seleção errada de destinatários, reenvio duplicado, pouca visibilidade do que já havia sido enviado e dependência de uma pessoa técnica para corrigir a operação.

Minha meta não era apenas enviar e-mail pelo n8n. Era entregar uma ferramenta que outra pessoa pudesse usar com segurança pelo navegador, sem entrar no canvas da automação.

## Decisões de produto

- linguagem de negócio para o operador, sem expor nomes de nodes;
- envio de teste separado do envio de campanha;
- rascunho, pausa, cancelamento e arquivamento em vez de exclusão destrutiva;
- revisão de destinatários, estimativa de lote e anexos antes do envio;
- contatos bloqueados fora da fila até desbloqueio consciente;
- histórico e exportação no mesmo painel da operação.

## Evolução técnica

A primeira versão persistia fila e histórico em arquivos do volume Docker. Ela validou o fluxo, mas dificultava consulta, migração e consistência entre entidades. A versão atual usa Data Tables sobre PostgreSQL e separa contatos, campanhas, destinatários, supressões, configurações e eventos.

Também incluí uma migração idempotente: a operação pode ser repetida durante manutenção sem criar novos registros para a mesma chave de domínio.

## Evolução de operação: assinatura e cancelamento

O uso real expôs duas necessidades que não eram visíveis no primeiro protótipo. A primeira era não ter que editar HTML de assinatura a cada comunicação. A resposta foi uma biblioteca versionada, com padrão restaurável, escolha por campanha e snapshot para manter o contexto histórico.

A segunda era a confiança no cancelamento. A fila agora reconsulta o estado da campanha e a elegibilidade do destinatário imediatamente antes de cada envio. Assim, uma decisão de pausa ou cancelamento bloqueia os próximos itens ainda pendentes. O limite é explícito: e-mails já entregues ao SMTP não podem ser recolhidos pela automação.

Também substituí a leitura paginada de uma tabela que mudava durante o processamento por agregações estáveis no dashboard. O painel deixa de depender de uma contagem que pode mudar entre páginas.

## Incidente de implantação resolvido

Durante a publicação em uma versão atual do n8n, os webhooks funcionavam logo após publicar, mas deixavam de responder depois do reinício do container. O workflow estava ativo, porém faltava a referência persistente da versão publicada. Corrigi os `webhookId` das três entradas, reparei o vínculo da versão publicada e repeti o teste com restart real. O painel voltou a responder após o boot.

## Como validei

- execução repetida de migração para provar idempotência;
- comparação de estados antes e depois de atualizações da fila;
- confirmação de que campanhas canceladas não liberam próximos itens pendentes;
- reinício completo do runtime e health check;
- acesso ao painel pelo endereço de rede;
- inspeção visual das telas principais;
- captura das telas com dados demonstrativos;
- validação estrutural dos exports e varredura de privacidade antes do GitHub.

## Próximas etapas responsáveis

- reverse proxy com TLS e autenticação quando o painel sair da rede confiável;
- métricas de entrega, bounce, reputação e descadastro;
- retry com backoff e estado de dead letter para erros persistentes;
- testes de contrato para cada ação pública;
- rate limit e política de concorrência para múltiplos workers.
