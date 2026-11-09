import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { buscarExerciciosEscolhidos, salvarExerciciosEscolhidos } from '../banco/exerciciosEscolhidos';
import { buscarTreinoEmAndamento } from '../banco/treinos';
import Botao from '../componentes/Botao';
import Campo from '../componentes/Campo';
import Tela from '../componentes/Tela';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';
import { buscarCatalogo, prepararSelecao } from '../servicos/catalogoExercicios';

export default function EscolherExercicios({ navigation: navegacao }) {
  const { aluno } = usarSessao();
  const [catalogo, definirCatalogo] = useState([]);
  const [selecionados, definirSelecionados] = useState([]);
  const [proximoInicio, definirProximoInicio] = useState(0);
  const [carregando, definirCarregando] = useState(true);
  const [buscando, definirBuscando] = useState(false);
  const [salvando, definirSalvando] = useState(false);
  const [bloqueado, definirBloqueado] = useState(false);
  const [erroLocal, definirErroLocal] = useState('');
  const [erroCatalogo, definirErroCatalogo] = useState('');
  const [erroSelecao, definirErroSelecao] = useState('');
  const telaAtiva = useRef(false);
  const consultaEmAndamento = useRef(false);
  const envioEmAndamento = useRef(false);

  async function carregarCatalogo(inicio = 0) {
    if (consultaEmAndamento.current) return;
    consultaEmAndamento.current = true;
    definirBuscando(true);
    definirErroCatalogo('');
    try {
      const pagina = await buscarCatalogo(inicio);
      if (telaAtiva.current) {
        definirCatalogo((anteriores) => {
          const lista = inicio === 0 ? [] : anteriores;
          const ids = new Set(lista.map((item) => item.idExterno));
          return [...lista, ...pagina.exercicios.filter((item) => !ids.has(item.idExterno))];
        });
        definirProximoInicio(pagina.proximoInicio);
      }
    } catch {
      if (telaAtiva.current) definirErroCatalogo('Não foi possível buscar os exercícios. Confira sua conexão e tente novamente.');
    } finally {
      consultaEmAndamento.current = false;
      if (telaAtiva.current) definirBuscando(false);
    }
  }

  async function carregarSelecao() {
    definirCarregando(true);
    definirErroLocal('');
    try {
      const [escolhidos, progresso] = await Promise.all([buscarExerciciosEscolhidos(aluno), buscarTreinoEmAndamento(aluno)]);
      if (telaAtiva.current) {
        definirSelecionados(escolhidos.map((item) => ({ ...item, series: String(item.series) })));
        definirBloqueado(Boolean(progresso));
        if (!progresso) carregarCatalogo();
      }
    } catch {
      if (telaAtiva.current) definirErroLocal('Não foi possível recuperar sua seleção.');
    } finally {
      if (telaAtiva.current) definirCarregando(false);
    }
  }

  useEffect(() => {
    telaAtiva.current = true;
    if (Platform.OS !== 'web') carregarSelecao();
    return () => { telaAtiva.current = false; };
  }, [aluno]);

  function alternarExercicio(exercicio) {
    definirErroSelecao('');
    definirSelecionados((lista) => lista.some((item) => item.idExterno === exercicio.idExterno)
      ? lista.filter((item) => item.idExterno !== exercicio.idExterno)
      : [...lista, { idExterno: exercicio.idExterno, nome: exercicio.nome, descricao: exercicio.descricao, series: '' }]);
  }

  function alterarSeries(id, series) {
    definirSelecionados((lista) => lista.map((item) => item.idExterno === id ? { ...item, series } : item));
  }

  async function salvar() {
    if (envioEmAndamento.current) return;
    definirErroSelecao('');
    let escolha;
    try {
      escolha = prepararSelecao(selecionados);
    } catch (falha) {
      definirErroSelecao(falha.message);
      return;
    }
    envioEmAndamento.current = true;
    definirSalvando(true);
    try {
      await salvarExerciciosEscolhidos(aluno, escolha);
      if (navegacao.isFocused()) navegacao.goBack();
    } catch {
      if (telaAtiva.current) definirErroSelecao('Não foi possível salvar a seleção. Tente novamente.');
    } finally {
      envioEmAndamento.current = false;
      if (telaAtiva.current) definirSalvando(false);
    }
  }

  if (Platform.OS === 'web') return <Tela titulo="Escolher exercícios" descricao="Para escolher os exercícios do seu treino, use o aplicativo no celular." />;

  return (
    <Tela titulo="Escolher exercícios" descricao="Escolha os exercícios e informe quantas séries fará em cada um.">
      {carregando ? <ActivityIndicator color={cores.verde} accessibilityLabel="Carregando seleção" /> : erroLocal ? (
        <>
          <Text accessibilityRole="alert" style={estilos.texto}>{erroLocal}</Text>
          <Botao titulo="Tentar novamente" secundario aoPressionar={carregarSelecao} />
        </>
      ) : bloqueado ? <Text style={estilos.texto}>Finalize ou descarte o treino em andamento antes de escolher outro.</Text> : (
        <>
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>Sua seleção ({selecionados.length})</Text>
            {!selecionados.length ? <Text style={estilos.texto}>Selecione exercícios no catálogo abaixo.</Text> : null}
            {selecionados.map((item) => (
              <View key={item.idExterno} style={estilos.selecionado}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Campo rotulo={`Séries de ${item.nome}`} valor={item.series} aoAlterar={(valor) => alterarSeries(item.idExterno, valor)} exemplo="Quantidade de séries" teclado="number-pad" limite={3} editavel={!salvando} />
                <Botao titulo="Remover da seleção" secundario desabilitado={salvando} aoPressionar={() => alternarExercicio(item)} />
              </View>
            ))}
            {erroSelecao ? <Text accessibilityRole="alert" style={estilos.texto}>{erroSelecao}</Text> : null}
            <Botao titulo={salvando ? 'Salvando...' : 'Salvar seleção'} desabilitado={salvando} aoPressionar={salvar} />
          </View>
          <Text style={estilos.titulo}>Catálogo de exercícios</Text>
          {catalogo.map((item) => {
            const escolhido = selecionados.some((exercicio) => exercicio.idExterno === item.idExterno);
            return (
              <View key={item.idExterno} style={estilos.cartao}>
                <Text style={estilos.nome}>{item.nome}</Text>
                <Text style={estilos.texto}>{item.descricao || 'Descrição não disponível.'}</Text>
                <Text style={estilos.fonte}>Fonte: wger. Autor: {item.autor}</Text>
                <Botao titulo={escolhido ? 'Remover da seleção' : 'Selecionar exercício'} secundario={escolhido} desabilitado={salvando} aoPressionar={() => alternarExercicio(item)} />
              </View>
            );
          })}
          {buscando ? <ActivityIndicator color={cores.verde} accessibilityLabel="Buscando exercícios" /> : null}
          {erroCatalogo ? (
            <>
              <Text accessibilityRole="alert" style={estilos.texto}>{erroCatalogo}</Text>
              <Botao titulo="Tentar buscar novamente" secundario desabilitado={buscando || salvando} aoPressionar={() => carregarCatalogo(proximoInicio || 0)} />
            </>
          ) : proximoInicio !== null ? <Botao titulo="Carregar mais exercícios" secundario desabilitado={buscando || salvando} aoPressionar={() => carregarCatalogo(proximoInicio)} /> : null}
          {!buscando && !erroCatalogo && catalogo.length === 0 ? <Text style={estilos.texto}>Nenhum exercício encontrado.</Text> : null}
          <Botao titulo="Abrir fonte dos exercícios" secundario aoPressionar={() => Linking.openURL('https://wger.de').catch(() => Alert.alert('Fonte dos exercícios', 'Não foi possível abrir o site.'))} />
        </>
      )}
      <Botao titulo="Voltar" secundario desabilitado={salvando} aoPressionar={() => navegacao.goBack()} />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  cartao: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 14 },
  selecionado: { gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.borda },
  titulo: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  nome: { color: cores.texto, fontSize: 16, fontWeight: '600' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 22 },
  fonte: { color: cores.secundario, fontSize: 12, lineHeight: 18 },
});
