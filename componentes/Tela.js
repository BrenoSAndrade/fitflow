import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores } from './tema';

export default function Tela({ titulo, descricao, children: conteudo }) {
  return (
    <SafeAreaView style={estilos.fundo} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={estilos.titulo}>{titulo}</Text>
        {descricao ? <Text style={estilos.descricao}>{descricao}</Text> : null}
        {conteudo}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 24, gap: 18, flexGrow: 1 },
  titulo: { color: cores.texto, fontSize: 26, fontWeight: '700' },
  descricao: { color: cores.secundario, fontSize: 15, lineHeight: 23 },
});
