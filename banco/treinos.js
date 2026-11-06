import { abrirBanco } from './conexao';
import { formatarData, validarExercicios, validarTexto } from './validacao';

function prepararRegistro({ aluno, inicio, fim, exercicios }) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);
  if (!inicio || !fim || Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime()) || dataFim <= dataInicio) {
    throw new Error('O fim do treino deve ser posterior ao início.');
  }
  const exerciciosValidos = validarExercicios(exercicios);
  if (!exerciciosValidos.some((exercicio) => exercicio.concluido)) {
    throw new Error('Conclua pelo menos um exercício para registrar o treino.');
  }
  return {
    aluno: alunoValido, inicio: dataInicio.toISOString(), fim: dataFim.toISOString(),
    data: formatarData(dataFim), duracao: Math.max(1, Math.round((dataFim - dataInicio) / 1000)),
    exercicios: JSON.stringify(exerciciosValidos),
  };
}

async function inserirRegistro(banco, registro) {
  const resultado = await banco.runAsync(`
    INSERT INTO treinos (aluno, inicio, fim, data, duracao_segundos, exercicios)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (aluno, inicio) DO NOTHING
  `, registro.aluno, registro.inicio, registro.fim, registro.data, registro.duracao, registro.exercicios);
  if (!resultado.changes) throw new Error('Esse treino já foi registrado.');
  return resultado.lastInsertRowId;
}

export async function registrarTreino(dados) {
  const registro = prepararRegistro(dados);
  const banco = await abrirBanco();
  return inserirRegistro(banco, registro);
}

export async function listarTreinos(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const treinos = await banco.getAllAsync('SELECT * FROM treinos WHERE aluno = ? ORDER BY fim DESC, id DESC', alunoValido);
  return treinos.map((treino) => ({ ...treino, exercicios: JSON.parse(treino.exercicios) }));
}

export async function buscarTreinoEmAndamento(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const treino = await banco.getFirstAsync('SELECT * FROM treinos_em_andamento WHERE aluno = ?', alunoValido);
  return treino ? { ...treino, exercicios: JSON.parse(treino.exercicios) } : null;
}

export async function iniciarTreino(aluno, exercicios, inicio = new Date()) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const dataInicio = new Date(inicio);
  if (!inicio || Number.isNaN(dataInicio.getTime())) throw new Error('Informe um início de treino válido.');
  const exerciciosValidos = validarExercicios(exercicios).map((exercicio) => ({ ...exercicio, concluido: false }));
  const banco = await abrirBanco();
  await banco.runAsync(`
    INSERT INTO treinos_em_andamento (aluno, inicio, exercicios) VALUES (?, ?, ?)
    ON CONFLICT (aluno) DO NOTHING
  `, alunoValido, dataInicio.toISOString(), JSON.stringify(exerciciosValidos));
  return buscarTreinoEmAndamento(alunoValido);
}

export async function marcarExercicio(aluno, posicao, concluido) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  if (!Number.isSafeInteger(posicao) || posicao < 0) throw new Error('Informe um exercício válido.');
  if (typeof concluido !== 'boolean') throw new Error('Informe se o exercício foi concluído.');
  const banco = await abrirBanco();
  await banco.withExclusiveTransactionAsync(async (transacao) => {
    const treino = await transacao.getFirstAsync('SELECT * FROM treinos_em_andamento WHERE aluno = ?', alunoValido);
    if (!treino) throw new Error('Nenhum treino em andamento.');
    const exercicios = JSON.parse(treino.exercicios);
    if (posicao >= exercicios.length) throw new Error('Exercício não encontrado no treino.');
    exercicios[posicao].concluido = concluido;
    await transacao.runAsync('UPDATE treinos_em_andamento SET exercicios = ? WHERE aluno = ?', JSON.stringify(exercicios), alunoValido);
  });
}

export async function finalizarTreino(aluno, fim = new Date()) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  let treinoId;
  await banco.withExclusiveTransactionAsync(async (transacao) => {
    const treino = await transacao.getFirstAsync('SELECT * FROM treinos_em_andamento WHERE aluno = ?', alunoValido);
    if (!treino) throw new Error('Nenhum treino em andamento.');
    const registro = prepararRegistro({ ...treino, fim, exercicios: JSON.parse(treino.exercicios) });
    treinoId = await inserirRegistro(transacao, registro);
    await transacao.runAsync('DELETE FROM treinos_em_andamento WHERE aluno = ?', alunoValido);
  });
  return treinoId;
}

export async function descartarTreino(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const resultado = await banco.runAsync('DELETE FROM treinos_em_andamento WHERE aluno = ?', alunoValido);
  return resultado.changes > 0;
}
