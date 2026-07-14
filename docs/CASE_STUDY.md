# Case técnico

## Contexto

O processo original dependia de planilha, cliente de e-mail e conferência manual. Isso criava quatro problemas recorrentes: seleção errada de destinatários, reenvio duplicado, pouca visibilidade do que já havia sido enviado e dependência de uma pessoa técnica para corrigir a operação.

Minha meta não era apenas “mandar e-mail pelo n8n”. Era entregar uma ferramenta que outra pessoa conseguisse usar com segurança pelo navegador.

## Decisões de produto

- o operador vê linguagem de negócio, não nomes de nodes;
- envio de teste fica separado do envio da campanha;
- iniciar campanha exige uma ação explícita;
- rascunho, pausa e arquivamento evitam exclusões destrutivas;
- bloqueio de contato é permanente até uma ação consciente de desbloqueio;
- histórico e exportação ficam no mesmo painel da operação.

## Evolução técnica

A primeira versão persistia fila e histórico em arquivos no volume Docker. Funcionou para validar o fluxo, mas dificultava consultas, migração e consistência entre entidades. A segunda versão passou para Data Tables apoiadas por PostgreSQL e ganhou um modelo explícito de contatos, campanhas, destinatários, supressões e eventos.

Também incluí um ramo de migração idempotente. Esse detalhe foi importante: eu pude executar a carga várias vezes durante a validação sem duplicar os 997 contatos ou os 1.522 eventos históricos.

## Incidente de implantação resolvido

Durante a publicação na versão 2.27 do n8n, os webhooks funcionavam logo após clicar em Publicar, mas desapareciam depois do reinício do container. O workflow estava ativo, porém faltava a referência persistente da versão publicada. Corrigi os `webhookId` das três entradas, reparei o vínculo da versão publicada e repeti o teste com restart real. O painel voltou a responder HTTP 200 após o boot.

## Como validei

- execução da migração e repetição para provar idempotência;
- comparação de contagens e estados antes/depois;
- confirmação de zero campanhas em execução durante a manutenção;
- reinício completo do container e health check;
- acesso ao painel pelo endereço de rede;
- inspeção visual das telas principais;
- backup PostgreSQL executado pelo Agendador do Windows com retorno 0;
- varredura do repositório público para impedir vazamento de dados.

## O que eu faria em uma próxima fase

- reverse proxy com TLS e autenticação do painel;
- métricas de entrega, bounce e reputação do domínio;
- política de retry com backoff e dead-letter state;
- testes de contrato para cada ação do webhook;
- observabilidade centralizada para tempo de fila e taxa de erro.
