# FitFlow

Aplicativo de academia em React Native com Expo.

## Estrutura

- telas: telas do aplicativo.
- componentes: elementos usados nas telas.
- navegacao: navegação entre as telas.
- contextos: dados compartilhados entre as telas.
- banco: tabelas e consultas locais.
- servicos: requisições e notificações.

## Executar

Instale uma versão LTS do Node compatível com o Expo, como Node 22.13 ou superior da linha 22. Na pasta do projeto, instale as dependências:

```powershell
npm.cmd install
```

No Windows, execute:

```powershell
.\iniciar.cmd celular
```

Aguarde o túnel ficar pronto e leia o QR code pelo Expo Go. Mantenha o terminal aberto durante o teste.

Se o Expo Go solicitar a mesma conta do computador:

```powershell
.\iniciar.cmd login
.\iniciar.cmd conta
```

O login é feito pelo terminal, sem abrir o navegador. Informe a senha somente quando for solicitada. Depois execute novamente `.\iniciar.cmd celular`.

## Outros modos de teste

- `.\iniciar.cmd rede`: celular na mesma rede do computador.
- `.\iniciar.cmd web`: abre no navegador.
- `.\iniciar.cmd android`: abre no emulador Android.

O iniciador usa o runtime local de teste quando disponível ou o Node instalado no computador.

Para o emulador, instale o Android Studio, o Android SDK Platform-Tools e o Android Emulator. Crie e inicie um aparelho no Device Manager antes de executar o comando. Se o SDK não estiver no local padrão, configure ANDROID_HOME.

## Versão atual

Entrada de demonstração com escolha de perfil e saída. O aluno acessa início, aulas e estatísticas. O funcionário acessa a grade e a tela de criação de aulas.

As telas ainda são espaços para as próximas funcionalidades. Não há autenticação por senha, banco de dados, reservas ou registro de treinos nesta versão.

## Branches

As funcionalidades são feitas em feature e integradas na develop por pull request. A main recebe as versões estáveis.
