import { listarAulas } from '../banco/aulas';

export async function buscarAulasFuturas(aluno, agora = new Date()) {
  const aulas = await listarAulas(aluno);
  return aulas.filter((aula) => new Date(`${aula.data}T${aula.horario}:00`) > agora);
}

export async function buscarProximaAula(aluno) {
  const aulas = await buscarAulasFuturas(aluno);
  return aulas.find((aula) => aula.reservada) || null;
}
