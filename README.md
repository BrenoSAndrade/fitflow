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

A entrada continua sendo uma demonstração, sem autenticação por senha. O perfil escolhido é recuperado ao abrir novamente o aplicativo. Use Sair para apagar essa sessão. As reservas e os treinos do modo demonstração pertencem ao mesmo aluno neste aparelho.

No início, o aluno pode iniciar o treino e marcar os exercícios. O progresso é recuperado ao reabrir o aplicativo. Finalizar salva o histórico e mostra a duração; descartar apaga somente o progresso atual. É necessário marcar pelo menos um exercício para finalizar. A tela de estatísticas ainda será conectada aos dados.

## Persistência

No Android e no iOS, o SQLite guarda aulas, reservas e treinos. A sessão usa SecureStore e as preferências usam AsyncStorage.

As funções de cadastro, consulta, reserva e registro de treinos estão na pasta banco. Cada reserva pertence a um aluno, não pode ser repetida e depende de vaga disponível. Excluir uma aula também remove suas reservas. O histórico guarda os exercícios e a duração de cada treino.

As funções de treino também guardam o início e o checklist em andamento. Iniciar novamente recupera o treino existente. Ao finalizar, o histórico é salvo e o progresso é removido juntos. Descartar o progresso não altera o histórico.

As consultas de estatísticas retornam o total de treinos e os sete dias da semana, de segunda a domingo, com minutos e frequência. Apenas treinos concluídos entram nesses números. A duração é o tempo entre início e fim, inclusive fora do aplicativo, e é atribuída ao dia da conclusão.

O progresso já está conectado ao checklist do início. As consultas das estatísticas ainda serão conectadas à tela correspondente.

O cadastro e a grade do funcionário usam o banco, preparado ao iniciar o aplicativo. O formulário recebe datas no formato DD/MM/AAAA e horários no formato HH:MM. Somente aulas futuras podem ser cadastradas pelo formulário.

O navegador permite conferir a interface e guarda somente o perfil de demonstração no AsyncStorage. O banco desta versão é usado no Android e no iOS. Os dados são locais e não são sincronizados entre celulares.

## Branches

As funcionalidades são feitas em feature e integradas na develop por pull request. A main recebe as versões estáveis.
