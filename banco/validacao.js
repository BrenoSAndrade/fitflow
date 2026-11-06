export function validarTexto(valor, campo) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new Error(`Informe ${campo}.`);
  }
  return valor.trim();
}

export function validarNumero(valor, campo) {
  if (!Number.isSafeInteger(valor) || valor < 1) {
    throw new Error(`Informe ${campo} como número inteiro maior que zero.`);
  }
  return valor;
}

export function validarData(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw new Error('Informe a data no formato AAAA-MM-DD.');
  }
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.getTime()) || formatarData(data) !== valor) {
    throw new Error('Informe uma data válida.');
  }
  return valor;
}

export function formatarData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function validarExercicios(exercicios) {
  if (!Array.isArray(exercicios) || !exercicios.length) {
    throw new Error('Informe os exercícios do treino.');
  }
  return exercicios.map((exercicio) => ({
    nome: validarTexto(exercicio?.nome, 'o nome do exercício'),
    series: validarNumero(exercicio?.series, 'a quantidade de séries'),
    repeticoes: validarNumero(exercicio?.repeticoes, 'a quantidade de repetições'),
    concluido: exercicio.concluido === true,
  }));
}
