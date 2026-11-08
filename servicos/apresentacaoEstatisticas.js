export function formatarMinutos(segundos) {
  if (!Number.isFinite(segundos) || segundos < 0) throw new Error('Tempo de treino inválido.');
  if (segundos === 0) return '0';
  if (segundos < 60) return '<1';
  return (segundos / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}
