import { createContext, useContext, useState } from 'react';

const ContextoSessao = createContext(null);

export function ProvedorSessao({ children: conteudo }) {
  const [perfil, definirPerfil] = useState(null);

  function entrar(novoPerfil) {
    definirPerfil(novoPerfil);
  }

  function sair() {
    definirPerfil(null);
  }

  return (
    <ContextoSessao.Provider value={{ perfil, entrar, sair }}>
      {conteudo}
    </ContextoSessao.Provider>
  );
}

export function usarSessao() {
  return useContext(ContextoSessao);
}
