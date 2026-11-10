import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Platform, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { alterarLembretes, sincronizarLembretes } from '../servicos/lembretes';
import { lerPreferencias } from '../servicos/preferencias';
import Botao from './Botao';
import { cores } from './tema';

export default function PreferenciasLembretes() {
  const [ativo, definirAtivo] = useState(false);
  const [carregando, definirCarregando] = useState(true);
  const [mensagem, definirMensagem] = useState('');
  const [semPermissao, definirSemPermissao] = useState(false);
  const telaAtiva = useRef(false);
  const operacaoEmAndamento = useRef(false);

  const carregar = useCallback(async () => {
    if (operacaoEmAndamento.current) return;
    operacaoEmAndamento.current = true;
    definirCarregando(true);
    definirMensagem('');
    try {
      const preferencias = await lerPreferencias();
      if (telaAtiva.current) definirAtivo(preferencias.lembretesAtivos);
      const estado = await sincronizarLembretes();
      if (telaAtiva.current) {
        definirSemPermissao(estado.semPermissao);
        if (estado.semPermissao) definirMensagem('Libere as notificações nas configurações do aparelho para receber os lembretes.');
      }
    } catch {
      if (telaAtiva.current) definirMensagem('Não foi possível atualizar os lembretes. Tente novamente.');
    } finally {
      operacaoEmAndamento.current = false;
      definirCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    telaAtiva.current = true;
    if (Platform.OS !== 'web') carregar();
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && Platform.OS !== 'web') carregar();
    });
    return () => { telaAtiva.current = false; inscricao.remove(); };
  }, [carregar]));

  async function alterar(valor) {
    if (operacaoEmAndamento.current) return;
    operacaoEmAndamento.current = true;
    definirCarregando(true);
    definirMensagem('');
    try {
      const resultado = await alterarLembretes(valor);
      if (telaAtiva.current) {
        definirSemPermissao(!resultado.permitido);
        definirMensagem(resultado.permitido ? (valor ? 'Lembretes ativados.' : 'Lembretes desativados.') : 'Permissão não concedida. Você pode liberá-la nas configurações do aparelho.');
      }
    } catch {
      if (telaAtiva.current) definirMensagem('Não foi possível concluir a alteração dos lembretes. Tente atualizar novamente.');
    } finally {
      try {
        const preferencias = await lerPreferencias();
        if (telaAtiva.current) definirAtivo(preferencias.lembretesAtivos);
      } catch {
        if (telaAtiva.current) definirMensagem('Não foi possível consultar a preferência salva. Tente atualizar novamente.');
      }
      operacaoEmAndamento.current = false;
      definirCarregando(false);
    }
  }

  if (Platform.OS === 'web') return null;

  return (
    <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <Text style={estilos.titulo}>Lembretes de aulas</Text>
        <Switch accessibilityLabel="Ativar lembretes de aulas" value={ativo} disabled={carregando} onValueChange={alterar} trackColor={{ false: cores.borda, true: cores.verde }} />
      </View>
      <Text style={estilos.texto}>Avise dez minutos antes das aulas reservadas. Se faltar menos tempo, o aviso será agendado para poucos segundos depois da reserva.</Text>
      {carregando ? <ActivityIndicator color={cores.verde} accessibilityLabel="Atualizando lembretes" /> : null}
      {mensagem ? <Text accessibilityLiveRegion="polite" style={estilos.texto}>{mensagem}</Text> : null}
      <Botao titulo="Atualizar lembretes" secundario desabilitado={carregando} aoPressionar={carregar} />
      {semPermissao ? <Botao titulo="Configurações do aparelho" secundario aoPressionar={() => Linking.openSettings().catch(() => definirMensagem('Não foi possível abrir as configurações.'))} /> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { padding: 18, borderRadius: 8, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 12 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titulo: { flex: 1, color: cores.texto, fontSize: 18, fontWeight: '600' },
  texto: { color: cores.secundario, fontSize: 14, lineHeight: 21 },
});
