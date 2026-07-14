# Workflows públicos

- `mala-direta-principal.portfolio.json`: topologia sanitizada do workflow principal.
- `mala-direta-erros.portfolio.json`: captura e persistência de falhas.

Os exports estão desativados, não têm credenciais e usam placeholders para as Data Tables. Consulte [DEPLOYMENT.md](../docs/DEPLOYMENT.md) antes de importar.

Para gerar novamente a partir de exports locais:

```powershell
node scripts/prepare-public-workflows.js caminho\principal.json caminho\erros.json
npm test
```

Nunca execute o script contra arquivos já versionados sem revisar o diff e a varredura de segurança.
