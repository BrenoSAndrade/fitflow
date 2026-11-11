import { cancelarReserva, excluirAula, reservarAula } from '../banco/aulas';
import { sincronizarLembretes } from './lembretes';

export async function reservarComLembrete(aulaId, aluno) {
  const resultado = await reservarAula(aulaId, aluno);
  try {
    const estado = await sincronizarLembretes();
    return { resultado, aviso: estado.semPermissao ? 'O lembrete está sem permissão no aparelho.' : '' };
  } catch {
    return { resultado, aviso: 'A reserva foi salva, mas não foi possível atualizar o lembrete.' };
  }
}

export async function cancelarComLembrete(aulaId, aluno) {
  const resultado = await cancelarReserva(aulaId, aluno);
  try {
    await sincronizarLembretes();
    return { resultado, aviso: '' };
  } catch {
    return { resultado, aviso: 'A reserva foi cancelada, mas não foi possível remover o lembrete. Tente atualizar os lembretes.' };
  }
}

export async function excluirComLembretes(aulaId) {
  const resultado = await excluirAula(aulaId);
  try {
    await sincronizarLembretes();
    return { resultado, aviso: '' };
  } catch {
    return { resultado, aviso: 'A aula foi excluída, mas não foi possível remover os lembretes. Tente atualizar os lembretes.' };
  }
}
