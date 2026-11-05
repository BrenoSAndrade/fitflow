import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { excluirAula, listarGrade } from '../banco/aulas';
import Tela from '../componentes/Tela';
import Botao from '../componentes/Botao';
import { cores } from '../componentes/tema';
import { exibirDataAula } from '../servicos/formularioAula';

export default function GradeAulas({ navigation: navegacao }) {
  const [aulas, definirAulas] = useState([]);
  const [carregando, definirCarregando] = useState(true);
  const [excluindo, definirExcluindo] = useState(null);
  const [erro, definirErro] = useState('');
  const telaAtiva = useRef(false);
  const consultaAtual = useRef(0);
  const exclusaoEmAndamento = useRef(false);

  const carregarAulas = useCallback(async () => {
    const consulta = ++consultaAtual.current;
    definirCarregando(true);
    definirErro('');
    try {
      const resultado = await listarGrade();
      if (telaAtiva.current && consulta === consultaAtual.current) definirAulas(resultado);
    } catch {
      if (telaAtiva.current && consulta === consultaAtual.current) definirErro('Não foi possível carregar as aulas.');
    } finally {
      if (telaAtiva.current && consulta === consultaAtual.current) definirCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    telaAtiva.current = true;
    if (Platform.OS !== 'web') carregarAulas();
    return () => {
      telaAtiva.current = false;
      consultaAtual.current += 1;
    };
  }, [carregarAulas]));

  async function removerAula(aula) {
    if (exclusaoEmAndamento.current) return;
    exclusaoEmAndamento.current = true;
    definirExcluindo(aula.id);
    definirErro('');
    try {
      await excluirAula(aula.id);
      if (telaAtiva.current) await carregarAulas();
    } catch {
      if (telaAtiva.current) definirErro('Não foi possível excluir a aula. Tente novamente.');
    } finally {
      exclusaoEmAndamento.current = false;
      definirExcluindo(null);
    }
  }

  function confirmarExclusao(aula) {
    Alert.alert('Excluir aula', `Excluir ${aula.nome}? As reservas dessa aula também serão removidas.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removerAula(aula) },
    ]);
  }

  if (Platform.OS === 'web') {
    return (
      <Tela titulo="Grade de aulas" descricao="Para cadastrar e consultar suas aulas, use o aplicativo no celular.">
        <Botao titulo="Ver formulário de aula" aoPressionar={() => navegacao.navigate('Criar aula')} />
      </Tela>
    );
  }

  return (
    <Tela titulo="Grade de aulas" descricao="Gerencie as aulas da academia.">
      <Botao titulo="Nova aula" desabilitado={excluindo !== null} aoPressionar={() => navegacao.navigate('Criar aula')} />
      {carregando ? <ActivityIndicator color={cores.verde} size="large" accessibilityLabel="Carregando aulas" /> : null}
      {erro ? (
        <>
          <Text accessibilityRole="alert" style={estilos.texto}>{erro}</Text>
          <Botao titulo="Tentar novamente" secundario desabilitado={carregando || excluindo !== null} aoPressionar={carregarAulas} />
        </>
      ) : null}
      {!carregando && !erro && aulas.length === 0 ? <Text style={estilos.texto}>Nenhuma aula cadastrada.</Text> : null}
      {!carregando && !erro ? aulas.map((aula) => (
        <View key={aula.id} style={estilos.aula}>
          <Text style={estilos.nome}>{aula.nome}</Text>
          <Text style={estilos.texto}>{exibirDataAula(aula.data)} às {aula.horario}</Text>
          <Text style={estilos.texto}>Instrutor: {aula.instrutor}</Text>
          <Text style={estilos.texto}>{aula.vagas} de {aula.capacidade} vagas disponíveis</Text>
          <Botao titulo={excluindo === aula.id ? 'Excluindo...' : 'Excluir'} secundario desabilitado={excluindo !== null} aoPressionar={() => confirmarExclusao(aula)} />
        </View>
      )) : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  aula: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 12 },
  nome: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
});
