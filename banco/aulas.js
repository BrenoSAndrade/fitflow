import { abrirBanco } from './conexao';
import { formatarData, validarData, validarNumero, validarTexto } from './validacao';

export async function criarAula({ nome, instrutor, data, horario, capacidade }) {
  const nomeValido = validarTexto(nome, 'o nome da aula');
  const instrutorValido = validarTexto(instrutor, 'o instrutor');
  validarData(data);
  validarNumero(capacidade, 'a quantidade de vagas');
  if (typeof horario !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
    throw new Error('Informe um horário válido no formato HH:MM.');
  }
  const banco = await abrirBanco();
  const resultado = await banco.runAsync(
    'INSERT INTO aulas (nome, instrutor, data, horario, capacidade) VALUES (?, ?, ?, ?, ?)',
    nomeValido, instrutorValido, data, horario, capacidade,
  );
  return resultado.lastInsertRowId;
}

export async function listarGrade() {
  const banco = await abrirBanco();
  return banco.getAllAsync(`
    SELECT aulas.*,
      capacidade - (SELECT COUNT(*) FROM reservas WHERE aula_id = aulas.id) AS vagas
    FROM aulas ORDER BY data, horario, id
  `);
}

export async function listarReservasParaLembretes() {
  const banco = await abrirBanco();
  return banco.getAllAsync(`
    SELECT aulas.id, aulas.nome, aulas.data, aulas.horario, reservas.aluno
    FROM reservas INNER JOIN aulas ON aulas.id = reservas.aula_id
    ORDER BY aulas.data, aulas.horario
  `);
}

export async function listarAulas(aluno) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const aulas = await banco.getAllAsync(`
    SELECT aulas.*,
      capacidade - (SELECT COUNT(*) FROM reservas WHERE aula_id = aulas.id) AS vagas,
      EXISTS (SELECT 1 FROM reservas WHERE aula_id = aulas.id AND aluno = ?) AS reservada
    FROM aulas ORDER BY data, horario, id
  `, alunoValido);
  return aulas.map((aula) => ({ ...aula, reservada: aula.reservada === 1 }));
}

export async function reservarAula(aulaId, aluno) {
  validarNumero(aulaId, 'a aula');
  const alunoValido = validarTexto(aluno, 'o aluno');
  const agora = new Date();
  const horarioAtual = `${formatarData(agora)}T${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
  const banco = await abrirBanco();
  const resultado = await banco.runAsync(`
    INSERT INTO reservas (aula_id, aluno)
    SELECT id, ? FROM aulas
    WHERE id = ? AND data || 'T' || horario > ?
      AND (SELECT COUNT(*) FROM reservas WHERE aula_id = aulas.id) < capacidade
    ON CONFLICT (aula_id, aluno) DO NOTHING
  `, alunoValido, aulaId, horarioAtual);
  if (!resultado.changes) {
    throw new Error('Não foi possível reservar. Confira se a aula tem vagas, ainda vai acontecer e não está reservada.');
  }
  return resultado.lastInsertRowId;
}

export async function cancelarReserva(aulaId, aluno) {
  validarNumero(aulaId, 'a aula');
  const alunoValido = validarTexto(aluno, 'o aluno');
  const banco = await abrirBanco();
  const resultado = await banco.runAsync('DELETE FROM reservas WHERE aula_id = ? AND aluno = ?', aulaId, alunoValido);
  return resultado.changes > 0;
}

export async function excluirAula(aulaId) {
  validarNumero(aulaId, 'a aula');
  const banco = await abrirBanco();
  const resultado = await banco.runAsync('DELETE FROM aulas WHERE id = ?', aulaId);
  return resultado.changes > 0;
}
