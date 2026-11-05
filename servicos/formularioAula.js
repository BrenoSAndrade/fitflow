import { validarData, validarTexto } from '../banco/validacao';

export function prepararDadosAula({ nome, instrutor, data, horario, vagas }, agora = new Date()) {
  const nomeValido = validarTexto(nome, 'o nome da aula');
  const instrutorValido = validarTexto(instrutor, 'o instrutor');
  const dataInformada = data.trim();
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataInformada)) {
    throw new Error('Informe a data no formato DD/MM/AAAA.');
  }
  const [dia, mes, ano] = dataInformada.split('/');
  const dataBanco = validarData(`${ano}-${mes}-${dia}`);
  const horarioValido = horario.trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horarioValido)) {
    throw new Error('Informe o horário no formato HH:MM, como 18:00.');
  }
  if (new Date(`${dataBanco}T${horarioValido}:00`) <= agora) {
    throw new Error('Escolha uma data e um horário futuros.');
  }
  const vagasInformadas = vagas.trim();
  if (!/^[1-9]\d{0,3}$/.test(vagasInformadas)) {
    throw new Error('Informe a quantidade de vagas entre 1 e 9999.');
  }
  return {
    nome: nomeValido, instrutor: instrutorValido, data: dataBanco,
    horario: horarioValido, capacidade: Number(vagasInformadas),
  };
}

export function exibirDataAula(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}
