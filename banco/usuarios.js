import { abrirBanco } from './conexao';
import { validarTexto } from './validacao';

export function normalizarEmail(email) {
  const emailValido = validarTexto(email, 'o e-mail').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValido)) throw new Error('Informe um e-mail válido.');
  return emailValido;
}

export async function adicionarUsuarioLocal({ id, nome, email, perfil }) {
  const identificacao = validarTexto(id, 'a identificação do usuário');
  const nomeValido = validarTexto(nome, 'o nome');
  const emailValido = normalizarEmail(email);
  if (perfil !== 'aluno' && perfil !== 'funcionario') throw new Error('Perfil inválido.');
  const banco = await abrirBanco();
  await banco.runAsync(`
    INSERT INTO usuarios (id, nome, email, perfil) VALUES (?, ?, ?, ?)
    ON CONFLICT (id) DO NOTHING
  `, identificacao, nomeValido, emailValido, perfil);
}

export async function buscarUsuarioPorEmail(email) {
  const emailValido = normalizarEmail(email);
  const banco = await abrirBanco();
  return await banco.getFirstAsync('SELECT id, nome, email, perfil FROM usuarios WHERE email = ?', emailValido) || null;
}

export async function buscarUsuarioPorId(id) {
  const identificacao = validarTexto(id, 'a identificação do usuário');
  const banco = await abrirBanco();
  return await banco.getFirstAsync('SELECT id, nome, email, perfil FROM usuarios WHERE id = ?', identificacao) || null;
}
