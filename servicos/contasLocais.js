import * as SecureStore from 'expo-secure-store';
import { adicionarUsuarioLocal, buscarUsuarioPorEmail, buscarUsuarioPorId, normalizarEmail } from '../banco/usuarios';
import { apagarSessao } from './sessao';

const chaveSessao = 'fitflow.conta';
const contas = [
  { id: 'aluno-demonstracao', nome: 'Aluno', email: 'aluno@fitflow.com', perfil: 'aluno' },
  { id: 'funcionario-demonstracao', nome: 'Funcionário', email: 'funcionario@fitflow.com', perfil: 'funcionario' },
];

export async function prepararContasLocais() {
  for (const conta of contas) {
    const chaveSenha = `fitflow.senha.${conta.id}`;
    const senha = await SecureStore.getItemAsync(chaveSenha);
    if (senha === null) await SecureStore.setItemAsync(chaveSenha, 'fitflow123');
    await adicionarUsuarioLocal(conta);
  }
}

export async function autenticarUsuario(email, senha, perfil) {
  const emailValido = normalizarEmail(email);
  if (typeof senha !== 'string' || !senha.length) throw new Error('Informe a senha.');
  if (perfil !== 'aluno' && perfil !== 'funcionario') throw new Error('Escolha o perfil de aluno ou funcionário.');
  await prepararContasLocais();
  const usuario = await buscarUsuarioPorEmail(emailValido);
  if (!usuario || usuario.perfil !== perfil) throw new Error('E-mail, senha ou perfil incorretos.');
  const senhaSalva = await SecureStore.getItemAsync(`fitflow.senha.${usuario.id}`);
  if (senhaSalva === null || senha !== senhaSalva) throw new Error('E-mail, senha ou perfil incorretos.');
  await apagarSessao();
  await SecureStore.setItemAsync(chaveSessao, usuario.id);
  return usuario;
}

export async function recuperarUsuario() {
  const identificacao = await SecureStore.getItemAsync(chaveSessao);
  if (!identificacao) return null;
  const usuario = await buscarUsuarioPorId(identificacao);
  if (!usuario) await SecureStore.deleteItemAsync(chaveSessao);
  return usuario;
}

export async function encerrarSessaoUsuario() {
  await SecureStore.deleteItemAsync(chaveSessao);
  await apagarSessao();
}
