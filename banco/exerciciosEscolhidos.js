import { abrirBanco } from './conexao';
import { buscarTreinoEmAndamento, iniciarTreino } from './treinos';
import { validarExercicios, validarNumero, validarTexto } from './validacao';

export async function salvarExerciciosEscolhidos(aluno, exercicios) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const identificacoes = new Set();
  const escolhidos = validarExercicios(exercicios).map((exercicio) => {
    validarNumero(exercicio.idExterno, 'a identificação do exercício');
    if (identificacoes.has(exercicio.idExterno)) throw new Error('Não selecione o mesmo exercício duas vezes.');
    identificacoes.add(exercicio.idExterno);
    return { ...exercicio, descricao: exercicio.descricao || '', concluido: false };
  });
  const banco = await abrirBanco();
  await banco.runAsync(`
    INSERT INTO exercicios_escolhidos (aluno, exercicios) VALUES (?, ?)
    ON CONFLICT (aluno) DO UPDATE SET exercicios = excluded.exercicios
  `, alunoValido, JSON.stringify(escolhidos));
}

export async function buscarExerciciosEscolhidos(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const registro = await banco.getFirstAsync('SELECT exercicios FROM exercicios_escolhidos WHERE aluno = ?', alunoValido);
  return registro ? JSON.parse(registro.exercicios) : [];
}

export async function apagarExerciciosEscolhidos(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const resultado = await banco.runAsync('DELETE FROM exercicios_escolhidos WHERE aluno = ?', alunoValido);
  return resultado.changes > 0;
}

export async function iniciarTreinoEscolhido(aluno, inicio = new Date()) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const progresso = await buscarTreinoEmAndamento(alunoValido);
  if (progresso) return progresso;
  const exercicios = await buscarExerciciosEscolhidos(alunoValido);
  if (!exercicios.length) throw new Error('Escolha os exercícios antes de iniciar o treino.');
  return iniciarTreino(alunoValido, exercicios, inicio);
}
