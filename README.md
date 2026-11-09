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

O funcionário pode cadastrar aulas com nome, instrutor, data, horário e vagas. A grade é atualizada ao retornar e permite excluir uma aula após confirmação.

O aluno pode consultar aulas futuras, reservar uma vaga e cancelar uma reserva após confirmação. A próxima aula reservada aparece no início. As vagas são atualizadas depois de cada alteração.

A entrada pede perfil, e-mail e senha das contas locais de demonstração. O perfil deve corresponder à conta. A conta conectada é recuperada ao abrir novamente o aplicativo. Use Sair para apagar a sessão. As reservas e os treinos pertencem à identificação do aluno e são mantidos ao sair.

No início, o aluno pode iniciar o treino e marcar os exercícios. O progresso é recuperado ao reabrir o aplicativo. Finalizar salva o histórico e mostra a duração; descartar apaga somente o progresso atual. É necessário marcar pelo menos um exercício para finalizar.

As estatísticas mostram minutos por dia, dias frequentados na semana e total de treinos concluídos. A tela atualiza ao retornar, ao reabrir o aplicativo ou pelo botão Atualizar. Treinos com menos de um minuto aparecem como <1 no gráfico.

## Persistência

No Android e no iOS, o SQLite guarda aulas, reservas e treinos. A sessão usa SecureStore e as preferências usam AsyncStorage.

As funções de cadastro, consulta, reserva e registro de treinos estão na pasta banco. Cada reserva pertence a um aluno, não pode ser repetida e depende de vaga disponível. Excluir uma aula também remove suas reservas. O histórico guarda os exercícios e a duração de cada treino.

As funções de treino também guardam o início e o checklist em andamento. Iniciar novamente recupera o treino existente. Ao finalizar, o histórico é salvo e o progresso é removido juntos. Descartar o progresso não altera o histórico.

As consultas de estatísticas retornam o total de treinos e os sete dias da semana, de segunda a domingo, com minutos e frequência. Apenas treinos concluídos entram nesses números. A duração é o tempo entre início e fim, inclusive fora do aplicativo, e é atribuída ao dia da conclusão.

O progresso está conectado ao checklist do início e as consultas alimentam a tela de estatísticas. A frequência semanal conta dias distintos, mesmo quando há mais de um treino no mesmo dia.

O cadastro e a grade do funcionário usam o banco, preparado ao iniciar o aplicativo. O formulário recebe datas no formato DD/MM/AAAA e horários no formato HH:MM. Somente aulas futuras podem ser cadastradas pelo formulário.

O navegador permite conferir o formulário de entrada. O login e o banco desta versão são usados no Android e no iOS. Os dados são locais e não são sincronizados entre celulares.

## Exercícios escolhidos

A camada de dados permite salvar uma seleção por aluno com identificação do exercício, nome, descrição e séries. A seleção é recuperada ao reabrir o aplicativo e mantém a ordem escolhida. Séries devem ser números inteiros maiores que zero; exercícios repetidos não são aceitos.

Um treino iniciado mantém sua própria cópia dos exercícios e das séries. Alterar ou apagar a seleção não muda esse treino nem seu histórico. A escolha é mantida depois da finalização para poder ser usada novamente.

Os treinos antigos continuam guardando suas repetições. A nova seleção não exige configurar repetições. As funções estão em banco/exerciciosEscolhidos.js e ainda serão conectadas ao catálogo e à tela de escolha.

## Contas locais

Há duas contas de demonstração para usar no formulário de entrada, sem cadastro de novos usuários:

| Perfil | E-mail | Senha de demonstração |
| --- | --- | --- |
| Aluno | aluno@fitflow.com | fitflow123 |
| Funcionário | funcionario@fitflow.com | fitflow123 |

A tabela usuarios guarda identificação, nome, e-mail e perfil. As senhas ficam no SecureStore. O perfil escolhido deve corresponder à conta. A sessão da conta guarda somente sua identificação e recupera os dados pelo banco.

O aluno local mantém a identificação das reservas e dos treinos de demonstração já existentes. As contas são locais ao aparelho, sem autenticação em servidor.

Na primeira abertura desta versão, a sessão antiga que guardava somente o perfil é ignorada. Entre com uma das contas acima. Depois disso, a sessão da conta é recuperada normalmente.

## Branches

As funcionalidades são feitas em feature e integradas na develop por pull request. A main recebe as versões estáveis.
