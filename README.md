# Clareza | Gestor financeiro pessoal

Aplicação web local para organizar receitas e despesas. Desenvolvida em C# com ASP.NET Core, Entity Framework Core e SQLite, e uma interface responsiva em HTML, CSS e JavaScript.

## O que faz

- Cadastra, edita e exclui receitas e despesas.
- Mostra receitas, despesas e saldo do mês selecionado.
- Filtra lançamentos por mês, tipo, descrição ou categoria.
- Apresenta a distribuição mensal de despesas por categoria.
- Exporta os lançamentos filtrados em CSV para abrir em planilhas.
- Salva os dados em um arquivo SQLite no próprio computador.

Os cartões e o gráfico refletem **todo o mês escolhido**; tipo e busca filtram a lista e a exportação. Não há integração com bancos nem transações financeiras reais.

## Pré-requisitos

1. Instale o **SDK do .NET 10**: https://dotnet.microsoft.com/download/dotnet/10.0
2. Instale o Git: https://git-scm.com/downloads
3. Abra um terminal (PowerShell, Prompt de Comando ou terminal do VS Code).
4. Confira a instalação com `dotnet --version` e `git --version`.

## Passo a passo para executar

1. Baixe o projeto pelo botão **Code > Download ZIP** do GitHub e descompacte, ou clone com:

   ```bash
   git clone https://github.com/vinischerer08-hub/gestor-financeiro.git
   cd gestor-financeiro
   ```

2. No terminal, entre na pasta que contém `GestorFinanceiro.csproj`.
3. Restaure os pacotes e execute:

   ```bash
   dotnet restore
   dotnet run
   ```

4. Abra **http://localhost:5080** no navegador. Na primeira execução, o banco será criado automaticamente em `App_Data/financas.db`.
5. Clique em **Novo lançamento**, informe os dados e salve. Use os botões da lista para editar ou excluir.
6. Para encerrar, volte ao terminal e pressione `Ctrl+C`.

O arquivo do banco é ignorado pelo Git para evitar publicação acidental de informações pessoais. Para fazer backup, feche a aplicação e copie a pasta `App_Data`; para restaurar, substitua a pasta com a aplicação fechada.

## Publicar alterações no GitHub

No terminal, dentro da pasta do projeto:

```bash
git status
git add .
git commit -m "Descreva a alteração"
git push
```

Se o Git solicitar autenticação, siga as instruções do GitHub no navegador. Não coloque senhas, chaves ou o banco de dados no repositório. GitHub Pages hospeda arquivos estáticos e não executa o servidor C# desta aplicação.

## Organização

- `Program.cs`: endpoints HTTP, validação e inicialização do banco.
- `Models/`: modelo das transações e dados de entrada.
- `Data/`: contexto do Entity Framework Core.
- `wwwroot/`: interface web, estilos e comportamento.
- `App_Data/`: banco local, criado ao executar e não versionado.

## Limites de uso

Projeto de estudo e uso local individual: não possui login, contas separadas, criptografia do banco ou segurança para exposição pública. Mantenha-o em localhost e não o use em rede ou produção com dados sensíveis sem implementar autenticação, autorização, HTTPS, proteção contra ataques e backups adequados. Valores são registrados em reais com até duas casas decimais; o saldo é apenas o resultado dos lançamentos do mês, não o saldo real da conta bancária.

