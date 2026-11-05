import { StyleSheet, Text, TextInput, View } from 'react-native';
import { cores } from './tema';

export default function Campo({ rotulo, valor, aoAlterar, exemplo, teclado = 'default', limite = 80, editavel = true }) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        accessibilityLabel={rotulo}
        value={valor}
        onChangeText={aoAlterar}
        placeholder={exemplo}
        placeholderTextColor={cores.secundario}
        keyboardType={teclado}
        maxLength={limite}
        editable={editavel}
        selectionColor={cores.verde}
        style={estilos.entrada}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  campo: { gap: 8 },
  rotulo: { color: cores.texto, fontSize: 14 },
  entrada: {
    color: cores.texto, backgroundColor: cores.superficie,
    borderWidth: 1, borderColor: cores.borda, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 16,
  },
});
