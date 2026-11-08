export const treinoDoDia = {
  nome: 'Peito e tríceps',
  exercicios: [
    { nome: 'Supino reto', series: 4, repeticoes: 10 },
    { nome: 'Crucifixo', series: 3, repeticoes: 12 },
    { nome: 'Tríceps corda', series: 3, repeticoes: 15 },
    { nome: 'Mergulho', series: 3, repeticoes: 10 },
  ],
};

export function formatarTempoTreino(inicio, fim = new Date()) {
  const intervalo = new Date(fim) - new Date(inicio);
  if (!Number.isFinite(intervalo) || intervalo < 0) throw new Error('Tempo de treino inválido.');
  const segundos = Math.max(1, Math.round(intervalo / 1000));
  const minutos = Math.floor(segundos / 60);
  const restante = segundos % 60;
  return minutos ? `${minutos} min e ${restante} s` : `${restante} s`;
}
