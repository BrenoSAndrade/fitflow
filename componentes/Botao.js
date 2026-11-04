import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from './tema';

export default function Botao({ titulo, aoPressionar, secundario = false, desabilitado = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={aoPressionar}
      style={({ pressed: pressionado }) => [estilos.botao, secundario && estilos.secundario, (pressionado || desabilitado) && estilos.pressionado]}
    >
      <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: { backgroundColor: cores.verde, borderRadius: 8, padding: 15, alignItems: 'center' },
  secundario: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  pressionado: { opacity: 0.75 },
  texto: { color: cores.fundo, fontSize: 15, fontWeight: '600' },
  textoSecundario: { color: cores.texto },
});
