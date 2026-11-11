import AsyncStorage from '@react-native-async-storage/async-storage';

const chave = 'fitflow.preferencias';

export async function salvarPreferencias({ lembretesAtivos }) {
  if (typeof lembretesAtivos !== 'boolean') throw new Error('Informe se os lembretes estão ativos.');
  await AsyncStorage.setItem(chave, JSON.stringify({ lembretesAtivos }));
}

export async function lerPreferencias() {
  const valor = await AsyncStorage.getItem(chave);
  if (!valor) return { lembretesAtivos: false };
  try {
    const preferencias = JSON.parse(valor);
    return { lembretesAtivos: preferencias?.lembretesAtivos === true };
  } catch {
    return { lembretesAtivos: false };
  }
}
