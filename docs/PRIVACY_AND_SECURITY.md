# Privacidade e segurança

## Dados pessoais

Nome, empresa, e-mail, status de entrega e histórico são dados operacionais. O acesso deve seguir necessidade de uso, retenção definida e trilha de auditoria. A lista de supressão deve ser preservada mesmo quando um contato deixa a base ativa, para impedir novo envio indevido.

## Controles implementados

- validação e normalização de e-mail;
- deduplicação por chave de destinatário;
- lista de supressão separada;
- credenciais no credential store do n8n;
- workflow de erro e eventos auditáveis;
- backups com retenção limitada;
- export público sanitizado e inativo.

## Controles necessários ao expor o painel

- HTTPS obrigatório fora de localhost;
- autenticação antes dos webhooks de operação;
- firewall/reverse proxy com origem permitida;
- rate limit e limite de tamanho do payload;
- logs sem conteúdo integral da mensagem ou anexos;
- rotação de credenciais e teste de restauração de backup.

## Uso responsável

O sistema é destinado a contatos legítimos e comunicações autorizadas. A operação precisa tratar consentimento, finalidade, descadastro, retenção e direitos do titular conforme a legislação aplicável.
