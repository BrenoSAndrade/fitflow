import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { abrirBanco } from '../banco/conexao';
import Botao from '../componentes/Botao';
import { cores } from '../componentes/tema';
import { apagarSessao, lerSessao, salvarSessao } from '../servicos/sessao';

const ContextoSessao = createContext(null);

export function ProvedorSessao({ children: conteudo }) {
  const [perfil, definirPerfil] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState(false);

  async function carregarDados() {
    definirCarregando(true);
    definirErro(false);
    try {
      const [perfilSalvo] = await Promise.all([
        lerSessao(),
        Platform.OS === 'web' ? Promise.resolve() : abrirBanco(),
      ]);
      definirPerfil(perfilSalvo);
    } catch {
      definirErro(true);
    } finally {
      definirCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function entrar(novoPerfil) {
    if (ocupado) return;
    definirOcupado(true);
    try {
      await salvarSessao(novoPerfil);
      definirPerfil(novoPerfil);
    } catch {
      Alert.alert('Não foi possível entrar', 'Tente novamente.');
    } finally {
      definirOcupado(false);
    }
  }

  async function sair() {
    if (ocupado) return;
    definirOcupado(true);
    try {
      await apagarSessao();
      definirPerfil(null);
    } catch {
      Alert.alert('Não foi possível sair', 'Tente novamente.');
    } finally {
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
    <ContextoSessao.Provider value={{ perfil, entrar, sair, ocupado }}>
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
