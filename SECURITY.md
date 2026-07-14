# Segurança

Este é um recorte público e sanitizado de um sistema real. Nenhuma credencial, contato, log de produção, IP privado ou arquivo de backup pertence ao repositório.

## Modelo de publicação

- workflows exportados sempre inativos;
- referências de credencial removidas;
- IDs de Data Tables substituídos por placeholders;
- dados das capturas substituídos por exemplos;
- `.env`, backups e dados operacionais bloqueados no `.gitignore`;
- validação estrutural e varredura de segredos executadas no GitHub Actions.

Execute antes de qualquer publicação:

```powershell
npm test
```

## Operação segura

Em um ambiente real, o painel deve ficar atrás de HTTPS, autenticação e restrição de rede. Credenciais SMTP devem existir somente no credential store criptografado do n8n. O operador também precisa configurar SPF, DKIM e DMARC, manter lista de supressão, respeitar descadastro e observar a LGPD.

Não abra uma issue pública contendo um segredo ou dado pessoal. Entre em contato por [mayconxz00dev@gmail.com](mailto:mayconxz00dev@gmail.com).
