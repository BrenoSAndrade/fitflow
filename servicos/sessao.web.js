import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = 'fitflow.perfil-demonstracao';

export async function salvarSessao(perfil) {
  if (perfil !== 'aluno' && perfil !== 'funcionario') throw new Error('Perfil inválido.');
  await AsyncStorage.setItem(chave, perfil);
}

export async function lerSessao() {
  const perfil = await AsyncStorage.getItem(chave);
  return perfil === 'aluno' || perfil === 'funcionario' ? perfil : null;
}

export async function apagarSessao() {
  await AsyncStorage.removeItem(chave);
}
