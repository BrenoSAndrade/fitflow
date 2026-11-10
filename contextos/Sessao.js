import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { autenticarUsuario, encerrarSessaoUsuario, prepararContasLocais, recuperarUsuario } from '../servicos/contasLocais';
import Botao from '../componentes/Botao';
import { cores } from '../componentes/tema';
import { apagarSessao } from '../servicos/sessao';
import { sincronizarLembretes } from '../servicos/lembretes';

const ContextoSessao = createContext(null);

export function ProvedorSessao({ children: conteudo }) {
  const [usuario, definirUsuario] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState(false);
  const operacaoEmAndamento = useRef(false);
  const perfil = usuario ? usuario.perfil : null;

  async function carregarDados() {
    definirCarregando(true);
    definirErro(false);
    try {
      if (Platform.OS !== 'web') await prepararContasLocais();
      await apagarSessao();
      definirUsuario(await recuperarUsuario());
    } catch {
      definirErro(true);
    } finally {
      definirCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (!usuario || Platform.OS === 'web') return;
    const atualizar = () => { sincronizarLembretes().catch(() => {}); };
    atualizar();
    const inscricao = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizar();
    });
    return () => inscricao.remove();
  }, [usuario]);

  async function entrar(email, senha, perfilEscolhido) {
    if (operacaoEmAndamento.current) return false;
    operacaoEmAndamento.current = true;
    definirOcupado(true);
    try {
      const conta = await autenticarUsuario(email, senha, perfilEscolhido);
      definirUsuario(conta);
      return true;
    } finally {
      operacaoEmAndamento.current = false;
      definirOcupado(false);
    }
  }

  async function sair() {
    if (operacaoEmAndamento.current) return;
    operacaoEmAndamento.current = true;
    definirOcupado(true);
    try {
      await encerrarSessaoUsuario();
      definirUsuario(null);
    } catch {
      Alert.alert('Não foi possível sair', 'Tente novamente.');
    } finally {
      operacaoEmAndamento.current = false;
      definirOcupado(false);
    }
  }

  if (carregando || erro) {
    return (
      <SafeAreaView style={estilos.carregamento}>
        {carregando ? (
          <ActivityIndicator size="large" color={cores.verde} accessibilityLabel="Carregando dados" />
        ) : (
          <>
            <Text style={estilos.mensagem}>Não foi possível carregar os dados.</Text>
            <Botao titulo="Tentar novamente" aoPressionar={carregarDados} />
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <ContextoSessao.Provider value={{ usuario, perfil, aluno: perfil === 'aluno' ? usuario.id : null, entrar, sair, ocupado }}>
      {conteudo}
    </ContextoSessao.Provider>
  );
}

export function usarSessao() {
  return useContext(ContextoSessao);
}

const estilos = StyleSheet.create({
  carregamento: { flex: 1, justifyContent: 'center', padding: 28, gap: 20, backgroundColor: cores.fundo },
  mensagem: { color: cores.texto, fontSize: 16, textAlign: 'center' },
});
