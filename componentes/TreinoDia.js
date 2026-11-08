import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarTreinoEmAndamento, descartarTreino, finalizarTreino, iniciarTreino, marcarExercicio } from '../banco/treinos';
import { usarSessao } from '../contextos/Sessao';
import { formatarTempoTreino, treinoDoDia } from '../servicos/treinoDia';
import Botao from './Botao';
import { cores } from './tema';

export default function TreinoDia() {
  const { aluno } = usarSessao();
  const [treino, definirTreino] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState('');
  const [mensagem, definirMensagem] = useState('');
  const telaAtiva = useRef(false);
  const consultaAtual = useRef(0);
  const operacaoEmAndamento = useRef(false);
  const somenteLeitura = Platform.OS === 'web';

  const carregarTreino = useCallback(async (mostrarCarregamento = true) => {
    const consulta = ++consultaAtual.current;
    if (mostrarCarregamento) definirCarregando(true);
    definirErro('');
    try {
      const progresso = await buscarTreinoEmAndamento(aluno);
      if (telaAtiva.current && consulta === consultaAtual.current) definirTreino(progresso);
    } catch {
      if (telaAtiva.current && consulta === consultaAtual.current) definirErro('Não foi possível carregar o treino. Tente novamente.');
    } finally {
      if (telaAtiva.current && consulta === consultaAtual.current) definirCarregando(false);
    }
  }, [aluno]);

  useFocusEffect(useCallback(() => {
    telaAtiva.current = true;
    if (somenteLeitura) definirCarregando(false);
    else carregarTreino();
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && !somenteLeitura && !operacaoEmAndamento.current) carregarTreino();
    });
    return () => {
      telaAtiva.current = false;
      consultaAtual.current += 1;
      inscricao.remove();
    };
  }, [carregarTreino, somenteLeitura]));

  async function executarOperacao(operacao) {
    if (operacaoEmAndamento.current || somenteLeitura) return;
    operacaoEmAndamento.current = true;
    consultaAtual.current += 1;
    definirSalvando(true);
    definirMensagem('');
    try {
      const retorno = await operacao();
      if (telaAtiva.current) {
        await carregarTreino(false);
        if (telaAtiva.current) definirMensagem(retorno || '');
      }
    } catch {
      if (telaAtiva.current) definirErro('Não foi possível salvar a alteração. Tente carregar o treino novamente.');
    } finally {
      operacaoEmAndamento.current = false;
      definirSalvando(false);
    }
  }

  function comecar() {
    executarOperacao(async () => {
      await iniciarTreino(aluno, treinoDoDia.exercicios);
      return 'Treino iniciado.';
    });
  }

  function marcar(posicao, concluido) {
    executarOperacao(() => marcarExercicio(aluno, posicao, concluido));
  }

  function confirmarFinalizacao() {
    const concluidos = treino.exercicios.filter((exercicio) => exercicio.concluido).length;
    Alert.alert('Finalizar treino', `Salvar o treino com ${concluidos} de ${treino.exercicios.length} exercícios concluídos?`, [
      { text: 'Continuar treino', style: 'cancel' },
      { text: 'Finalizar', onPress: () => executarOperacao(async () => {
        const fim = new Date();
        const tempo = formatarTempoTreino(treino.inicio, fim);
        await finalizarTreino(aluno, fim);
        return `Treino salvo. Tempo: ${tempo}.`;
      }) },
    ]);
  }

  function confirmarDescarte() {
    Alert.alert('Descartar treino', 'Apagar o progresso atual sem registrar um treino concluído?', [
      { text: 'Continuar treino', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => executarOperacao(async () => {
        await descartarTreino(aluno);
        return 'Progresso descartado.';
      }) },
    ]);
  }

  const exercicios = treino ? treino.exercicios : treinoDoDia.exercicios;
  const concluidos = exercicios.filter((exercicio) => exercicio.concluido).length;

  return (
    <View style={estilos.cartao}>
      <Text style={estilos.titulo}>Treino do dia</Text>
      <Text style={estilos.texto}>{treinoDoDia.nome}</Text>
      {carregando ? <ActivityIndicator color={cores.verde} accessibilityLabel="Carregando treino" /> : erro ? (
        <>
          <Text accessibilityRole="alert" style={estilos.texto}>{erro}</Text>
          <Botao titulo="Carregar novamente" secundario desabilitado={salvando} aoPressionar={() => carregarTreino()} />
        </>
      ) : (
        <>
          {treino ? <Text style={estilos.texto}>Iniciado em {new Date(treino.inicio).toLocaleString('pt-BR')}</Text> : null}
          {exercicios.map((exercicio, posicao) => (
            <Pressable key={posicao} accessibilityRole="checkbox"
              accessibilityLabel={`${exercicio.nome}, ${exercicio.series} séries de ${exercicio.repeticoes} repetições`}
              accessibilityState={{ checked: exercicio.concluido === true, disabled: !treino || salvando || somenteLeitura }}
              disabled={!treino || salvando || somenteLeitura}
              onPress={() => marcar(posicao, !exercicio.concluido)} style={estilos.exercicio}>
              <View style={[estilos.caixa, exercicio.concluido && estilos.marcada]} />
              <Text style={estilos.nome}>{exercicio.nome} {exercicio.series}x{exercicio.repeticoes}</Text>
            </Pressable>
          ))}
          {mensagem ? <Text accessibilityLiveRegion="polite" style={estilos.texto}>{mensagem}</Text> : null}
          {somenteLeitura ? <Text style={estilos.texto}>Para registrar seu treino, use o aplicativo no celular.</Text> : treino ? (
            <>
              <Text style={estilos.texto}>{concluidos} de {exercicios.length} exercícios concluídos.</Text>
              <Text style={estilos.texto}>O tempo continua contando com o aplicativo fechado.</Text>
              <Botao titulo={salvando ? 'Salvando...' : 'Finalizar treino'} desabilitado={salvando || concluidos === 0} aoPressionar={confirmarFinalizacao} />
              <Botao titulo="Descartar treino" secundario desabilitado={salvando} aoPressionar={confirmarDescarte} />
            </>
          ) : <Botao titulo={salvando ? 'Iniciando...' : 'Iniciar treino'} desabilitado={salvando} aoPressionar={comecar} />}
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 14 },
  titulo: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
  exercicio: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, borderBottomWidth: 1, borderBottomColor: cores.borda, paddingVertical: 10 },
  caixa: { width: 20, height: 20, borderWidth: 1, borderColor: cores.secundario, borderRadius: 4 },
  marcada: { backgroundColor: cores.verde, borderColor: cores.verde },
  nome: { flex: 1, color: cores.texto, fontSize: 14, lineHeight: 21 },
});
