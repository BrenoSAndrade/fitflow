import * as SecureStore from 'expo-secure-store';

const chave = 'fitflow.sessao';

export async function salvarSessao(perfil) {
  if (perfil !== 'aluno' && perfil !== 'funcionario') throw new Error('Perfil inválido.');
  await SecureStore.setItemAsync(chave, perfil);
}

export async function lerSessao() {
  const perfil = await SecureStore.getItemAsync(chave);
  return perfil === 'aluno' || perfil === 'funcionario' ? perfil : null;
}

export async function apagarSessao() {
  await SecureStore.deleteItemAsync(chave);
}
