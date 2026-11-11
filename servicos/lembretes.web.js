export async function sincronizarLembretes() {
  return { semPermissao: true };
}

export async function alterarLembretes() {
  throw new Error('Os lembretes estão disponíveis no aplicativo do celular.');
}
