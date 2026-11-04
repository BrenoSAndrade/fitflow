import { abrirBanco } from './conexao';
import { formatarData, validarNumero, validarTexto } from './validacao';

export async function registrarTreino({ aluno, inicio, fim, exercicios }) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);
  if (!inicio || !fim || Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime()) || dataFim <= dataInicio) {
    throw new Error('O fim do treino deve ser posterior ao início.');
  }
  if (!Array.isArray(exercicios) || !exercicios.length) {
    throw new Error('Informe os exercícios do treino.');
  }
  const exerciciosValidos = exercicios.map((exercicio) => ({
    nome: validarTexto(exercicio?.nome, 'o nome do exercício'),
    series: validarNumero(exercicio?.series, 'a quantidade de séries'),
    repeticoes: validarNumero(exercicio?.repeticoes, 'a quantidade de repetições'),
    concluido: exercicio.concluido === true,
  }));
  if (!exerciciosValidos.some((exercicio) => exercicio.concluido)) {
    throw new Error('Conclua pelo menos um exercício para registrar o treino.');
  }
  const duracao = Math.max(1, Math.round((dataFim - dataInicio) / 1000));
  const banco = await abrirBanco();
  const resultado = await banco.runAsync(`
    INSERT INTO treinos (aluno, inicio, fim, data, duracao_segundos, exercicios)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (aluno, inicio) DO NOTHING
  `, alunoValido, dataInicio.toISOString(), dataFim.toISOString(), formatarData(dataFim), duracao, JSON.stringify(exerciciosValidos));
  if (!resultado.changes) throw new Error('Esse treino já foi registrado.');
  return resultado.lastInsertRowId;
}

export async function listarTreinos(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const treinos = await banco.getAllAsync('SELECT * FROM treinos WHERE aluno = ? ORDER BY fim DESC, id DESC', alunoValido);
  return treinos.map((treino) => ({ ...treino, exercicios: JSON.parse(treino.exercicios) }));
}
