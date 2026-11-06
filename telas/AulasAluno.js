import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { cancelarReserva, reservarAula } from '../banco/aulas';
import Botao from '../componentes/Botao';
import Tela from '../componentes/Tela';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';
import { buscarAulasFuturas } from '../servicos/aulasAluno';
import { exibirDataAula } from '../servicos/formularioAula';

export default function AulasAluno() {
  const { aluno } = usarSessao();
  const [aulas, definirAulas] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [alterando, definirAlterando] = useState(null);
  const [erro, definirErro] = useState('');
  const [mensagem, definirMensagem] = useState('');
  const telaAtiva = useRef(false);
  const consultaAtual = useRef(0);
  const alteracaoEmAndamento = useRef(false);

  const carregarAulas = useCallback(async () => {
    const consulta = ++consultaAtual.current;
    definirCarregando(true);
    definirErro('');
    try {
      const resultado = await buscarAulasFuturas(aluno);
      if (telaAtiva.current && consulta === consultaAtual.current) definirAulas(resultado);
    } catch {
      if (telaAtiva.current && consulta === consultaAtual.current) definirErro('Não foi possível carregar as aulas.');
    } finally {
      if (telaAtiva.current && consulta === consultaAtual.current) definirCarregando(false);
    }
  }, [aluno]);

  useFocusEffect(useCallback(() => {
    telaAtiva.current = true;
    definirMensagem('');
    if (Platform.OS !== 'web') carregarAulas();
    return () => {
      telaAtiva.current = false;
      consultaAtual.current += 1;
    };
  }, [carregarAulas]));

  async function alterarReserva(aula) {
    if (alteracaoEmAndamento.current) return;
    alteracaoEmAndamento.current = true;
    definirAlterando(aula.id);
    definirMensagem('');
    let retorno;
    try {
      if (aula.reservada) {
        const cancelada = await cancelarReserva(aula.id, aluno);
        retorno = cancelada ? 'Reserva cancelada.' : 'Essa reserva já havia sido cancelada.';
      } else {
        await reservarAula(aula.id, aluno);
        retorno = 'Reserva confirmada.';
      }
    } catch {
      retorno = aula.reservada
        ? 'Não foi possível cancelar a reserva. Tente novamente.'
        : 'Não foi possível reservar. Confira se a aula ainda tem vagas e não está reservada.';
    } finally {
      if (telaAtiva.current) {
        await carregarAulas();
        if (telaAtiva.current) definirMensagem(retorno);
      }
      alteracaoEmAndamento.current = false;
      definirAlterando(null);
    }
  }

  function confirmarCancelamento(aula) {
    Alert.alert('Cancelar reserva', `Cancelar sua reserva em ${aula.nome}?`, [
      { text: 'Manter reserva', style: 'cancel' },
      { text: 'Cancelar reserva', style: 'destructive', onPress: () => alterarReserva(aula) },
    ]);
  }

  if (Platform.OS === 'web') {
    return <Tela titulo="Aulas" descricao="Para reservar ou cancelar aulas, use o aplicativo no celular." />;
  }

  return (
    <Tela titulo="Aulas" descricao="Escolha uma aula e reserve sua vaga.">
      {mensagem ? <Text accessibilityLiveRegion="polite" style={estilos.mensagem}>{mensagem}</Text> : null}
      {carregando ? <ActivityIndicator color={cores.verde} size="large" accessibilityLabel="Carregando aulas" /> : null}
      {erro ? (
        <>
          <Text accessibilityRole="alert" style={estilos.texto}>{erro}</Text>
          <Botao titulo="Tentar novamente" secundario desabilitado={carregando || alterando !== null} aoPressionar={carregarAulas} />
        </>
      ) : null}
      {!carregando && !erro && aulas.length === 0 ? <Text style={estilos.texto}>Nenhuma aula disponível no momento.</Text> : null}
      {!carregando && !erro ? aulas.map((aula) => (
        <View key={aula.id} style={estilos.aula}>
          <Text style={estilos.nome}>{aula.nome}</Text>
          <Text style={estilos.texto}>{exibirDataAula(aula.data)} às {aula.horario}</Text>
          <Text style={estilos.texto}>Instrutor: {aula.instrutor}</Text>
          <Text style={estilos.texto}>{aula.vagas} de {aula.capacidade} vagas disponíveis</Text>
          {aula.reservada ? <Text style={estilos.mensagem}>Sua vaga está reservada.</Text> : null}
          <Botao
            titulo={alterando === aula.id ? 'Aguarde...' : aula.reservada ? 'Cancelar reserva' : aula.vagas > 0 ? 'Reservar' : 'Sem vagas'}
            secundario={aula.reservada || aula.vagas === 0}
            desabilitado={alterando !== null || (!aula.reservada && aula.vagas <= 0)}
            aoPressionar={() => aula.reservada ? confirmarCancelamento(aula) : alterarReserva(aula)}
          />
        </View>
      )) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  aula: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 12 },
  nome: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
  mensagem: { color: cores.texto, fontSize: 14, lineHeight: 21 },
});
