import { apagarSessao } from './sessao';

export async function prepararContasLocais() {}

export async function autenticarUsuario() {
  throw new Error('Para entrar com e-mail e senha, use o aplicativo no celular.');
}

export async function recuperarUsuario() {
  return null;
}

export async function encerrarSessaoUsuario() {
  await apagarSessao();
}
