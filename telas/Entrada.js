import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Botao from '../componentes/Botao';
import { cores } from '../componentes/tema';
import { usarSessao } from '../contextos/Sessao';

export default function Entrada() {
  const [perfil, definirPerfil] = useState('aluno');
  const { entrar, ocupado } = usarSessao();

  return (
    <SafeAreaView style={estilos.tela}>
      <View style={estilos.conteudo}>
        <Text accessibilityRole="header" style={estilos.titulo}>FitFlow</Text>
        <Text style={estilos.descricao}>Sua academia na palma da mão</Text>
        <View style={estilos.perfis}>
          {['aluno', 'funcionario'].map((opcao) => (
            <Pressable key={opcao} accessibilityRole="radio"
              accessibilityState={{ checked: perfil === opcao }}
              onPress={() => definirPerfil(opcao)}
              style={[estilos.perfil, perfil === opcao && estilos.selecionado]}>
              <Text style={[estilos.nomePerfil, perfil === opcao && estilos.nomeSelecionado]}>
                {opcao === 'aluno' ? 'Aluno' : 'Funcionário'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={estilos.descricao}>Escolha um perfil para conhecer as telas.</Text>
        <Botao titulo={ocupado ? 'Entrando...' : 'Entrar na demonstração'} desabilitado={ocupado} aoPressionar={() => entrar(perfil)} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, justifyContent: 'center' },
  conteudo: { padding: 28, gap: 20, width: '100%', maxWidth: 480, alignSelf: 'center' },
  titulo: { color: cores.texto, fontSize: 34, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 15, lineHeight: 22 },
  perfis: { flexDirection: 'row', gap: 12 },
  perfil: { flex: 1, borderRadius: 8, backgroundColor: cores.superficie, padding: 15, alignItems: 'center' },
  selecionado: { backgroundColor: cores.verde },
  nomePerfil: { color: cores.texto, fontWeight: '600' },
  nomeSelecionado: { color: cores.fundo },
});
