import { abrirBanco } from './conexao';
import { formatarData, validarData, validarTexto } from './validacao';

export async function consultarEstatisticas(aluno, referencia = new Date()) {
  const alunoValido = validarTexto(aluno, 'o aluno');
  const somenteData = typeof referencia === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(referencia);
  const data = new Date(somenteData ? `${validarData(referencia)}T12:00:00` : referencia);
  if (!referencia || Number.isNaN(data.getTime())) throw new Error('Informe uma data válida para consultar a semana.');
  const segunda = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  segunda.setDate(segunda.getDate() - ((segunda.getDay() + 6) % 7));
  const dias = [];
  for (let posicao = 0; posicao < 7; posicao += 1) {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + posicao);
    dias.push(formatarData(dia));
  }
  const banco = await abrirBanco();
  const total = await banco.getFirstAsync('SELECT COUNT(*) AS total FROM treinos WHERE aluno = ?', alunoValido);
  const registros = await banco.getAllAsync(`
    SELECT data, COUNT(*) AS treinos, SUM(duracao_segundos) AS segundos
    FROM treinos WHERE aluno = ? AND data BETWEEN ? AND ?
    GROUP BY data ORDER BY data
  `, alunoValido, dias[0], dias[6]);
  const porDia = dias.map((dia) => {
    const registro = registros.find((item) => item.data === dia);
    const segundos = registro ? registro.segundos : 0;
    return {
      data: dia, segundos, minutos: segundos / 60,
      treinos: registro ? registro.treinos : 0, frequentou: Boolean(registro),
    };
  });
  return {
    inicioSemana: dias[0], fimSemana: dias[6], totalTreinos: total.total,
    diasNaSemana: porDia.filter((dia) => dia.frequentou).length, porDia,
  };
}
