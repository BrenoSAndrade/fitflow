import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { consultarEstatisticas } from '../banco/estatisticas';
import Botao from '../componentes/Botao';
import Tela from '../componentes/Tela';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';
import { formatarMinutos } from '../servicos/apresentacaoEstatisticas';
import { exibirDataAula } from '../servicos/formularioAula';

const diasDaSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function Estatisticas() {
  const { aluno } = usarSessao();
  const [resumo, definirResumo] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState('');
  const telaAtiva = useRef(false);
  const consultaAtual = useRef(0);

  const carregarEstatisticas = useCallback(async () => {
    const consulta = ++consultaAtual.current;
    definirCarregando(true);
    definirErro('');
    try {
      const resultado = await consultarEstatisticas(aluno);
      if (telaAtiva.current && consulta === consultaAtual.current) definirResumo(resultado);
    } catch {
      if (telaAtiva.current && consulta === consultaAtual.current) definirErro('Não foi possível carregar as estatísticas.');
    } finally {
      if (telaAtiva.current && consulta === consultaAtual.current) definirCarregando(false);
    }
  }, [aluno]);

  useFocusEffect(useCallback(() => {
    telaAtiva.current = true;
    if (Platform.OS !== 'web') carregarEstatisticas();
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && Platform.OS !== 'web') carregarEstatisticas();
    });
    return () => {
      telaAtiva.current = false;
      consultaAtual.current += 1;
      inscricao.remove();
    };
  }, [carregarEstatisticas]));

  const colunas = useMemo(() => {
    if (!resumo) return [];
    const maiorTempo = Math.max(1, ...resumo.porDia.map((dia) => dia.segundos));
    return resumo.porDia.map((dia, posicao) => ({
      ...dia,
      rotulo: diasDaSemana[posicao],
      minutosFormatados: formatarMinutos(dia.segundos),
      altura: dia.segundos > 0 ? Math.max(3, (dia.segundos / maiorTempo) * 120) : 0,
    }));
  }, [resumo]);

  if (Platform.OS === 'web') {
    return <Tela titulo="Estatísticas" descricao="Para acompanhar seus treinos registrados, use o aplicativo no celular." />;
  }

  return (
    <Tela titulo="Estatísticas" descricao="Acompanhe os treinos que você concluiu.">
      {carregando ? <ActivityIndicator size="large" color={cores.verde} accessibilityLabel="Carregando estatísticas" /> : erro ? (
        <>
          <Text accessibilityRole="alert" style={estilos.texto}>{erro}</Text>
          <Botao titulo="Tentar novamente" secundario aoPressionar={carregarEstatisticas} />
        </>
      ) : resumo ? (
        <>
          <View style={estilos.indicadores}>
            <View style={estilos.indicador}>
              <Text style={estilos.numero}>{resumo.diasNaSemana}</Text>
              <Text style={estilos.texto}>Dias nesta semana</Text>
            </View>
            <View style={estilos.indicador}>
              <Text style={estilos.numero}>{resumo.totalTreinos}</Text>
              <Text style={estilos.texto}>Treinos realizados</Text>
            </View>
          </View>
          <Text style={estilos.texto}>{exibirDataAula(resumo.inicioSemana)} a {exibirDataAula(resumo.fimSemana)}</Text>
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>Minutos por dia</Text>
            <View style={estilos.grafico}>
              {colunas.map((dia) => (
                <View key={dia.data} style={estilos.coluna} accessible accessibilityLabel={`${dia.rotulo}, ${exibirDataAula(dia.data)}, ${dia.segundos} segundos de treino`}>
                  <Text style={estilos.valor} numberOfLines={1} adjustsFontSizeToFit>{dia.minutosFormatados}</Text>
                  <View style={estilos.areaBarra}>
                    <View style={[estilos.barra, { height: dia.altura }]} />
                  </View>
                  <Text style={estilos.dia}>{dia.rotulo}</Text>
                </View>
              ))}
            </View>
            {resumo.diasNaSemana === 0 ? <Text style={estilos.texto}>Nenhum treino concluído nesta semana.</Text> : null}
          </View>
          <View style={estilos.cartao}>
            <Text style={estilos.titulo}>Frequência na semana</Text>
            <View style={estilos.frequencia}>
              {colunas.map((dia) => (
                <View key={dia.data} style={[estilos.marcador, dia.frequentou && estilos.frequentado]} accessible accessibilityLabel={`${dia.rotulo}, ${exibirDataAula(dia.data)}, ${dia.frequentou ? 'treino realizado' : 'sem treino'}`}>
                  <Text style={[estilos.dia, dia.frequentou && estilos.diaFrequentado]}>{dia.rotulo}</Text>
                </View>
              ))}
            </View>
            <Text style={estilos.texto}>Os dias em verde têm pelo menos um treino concluído.</Text>
          </View>
        </>
      ) : null}
      {!erro ? <Botao titulo="Atualizar" secundario desabilitado={carregando} aoPressionar={carregarEstatisticas} /> : null}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  indicadores: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  indicador: { flex: 1, minWidth: 100, padding: 16, gap: 8, borderRadius: 8, backgroundColor: cores.superficie },
  numero: { color: cores.texto, fontSize: 30, fontWeight: '700' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
  cartao: { padding: 16, gap: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  titulo: { color: cores.texto, fontSize: 18, fontWeight: '600' },
  grafico: { flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  coluna: { flex: 1, alignItems: 'center', gap: 8 },
  valor: { color: cores.texto, fontSize: 12 },
  areaBarra: { height: 120, width: '100%', alignItems: 'center', justifyContent: 'flex-end', borderBottomWidth: 1, borderBottomColor: cores.borda },
  barra: { width: '70%', maxWidth: 24, backgroundColor: cores.verde, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  dia: { color: cores.secundario, fontSize: 11 },
  frequencia: { flexDirection: 'row', gap: 4 },
  marcador: { flex: 1, minHeight: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cores.borda, borderRadius: 6 },
  frequentado: { backgroundColor: cores.verde, borderColor: cores.verde },
  diaFrequentado: { color: cores.fundo, fontWeight: '600' },
});
