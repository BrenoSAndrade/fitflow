const endereco = 'https://wger.de/api/v2/exercise-translation/';
const quantidade = 20;

export function limparTexto(valor) {
  if (typeof valor !== 'string') return '';
  const entidades = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return valor
    .replace(/&(nbsp|amp|quot|apos|lt|gt);/g, (entidade) => entidades[entidade])
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, codigo) => {
      const numero = codigo[0].toLowerCase() === 'x' ? parseInt(codigo.slice(1), 16) : Number(codigo);
      return numero > 0 && numero <= 0x10ffff ? String.fromCodePoint(numero) : '';
    })
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?\s*>|<\/(p|li|ol|ul|div)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '')
    .replace(/\*\*/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

export async function buscarCatalogo(inicio = 0) {
  if (!Number.isSafeInteger(inicio) || inicio < 0) throw new Error('Página inválida.');
  const controle = new AbortController();
  const prazo = setTimeout(() => controle.abort(), 15000);
  try {
    const resposta = await fetch(`${endereco}?language=7&limit=${quantidade}&offset=${inicio}`, {
      headers: { Accept: 'application/json' }, signal: controle.signal,
    });
    if (!resposta.ok) throw new Error('Falha ao consultar os exercícios.');
    const dados = await resposta.json();
    if (!Array.isArray(dados.results)) throw new Error('Resposta inválida do catálogo.');
    const identificacoes = new Set();
    const exercicios = [];
    for (const item of dados.results) {
      if (!item || item.language !== 7 || !Number.isSafeInteger(item.exercise) || item.exercise < 1 || identificacoes.has(item.exercise)) continue;
      const nome = limparTexto(item.name);
      if (!nome) continue;
      identificacoes.add(item.exercise);
      exercicios.push({
        idExterno: item.exercise, nome,
        descricao: limparTexto(item.description_source || item.description),
        autor: limparTexto(item.license_author) || 'wger.de',
      });
    }
    return { exercicios, proximoInicio: dados.next ? inicio + quantidade : null };
  } finally {
    clearTimeout(prazo);
  }
}

export function prepararSelecao(exercicios) {
  if (!exercicios.length) throw new Error('Selecione pelo menos um exercício.');
  return exercicios.map((exercicio) => {
    const series = String(exercicio.series).trim();
    if (!/^[1-9]\d{0,2}$/.test(series)) throw new Error(`Informe de 1 a 999 séries para ${exercicio.nome}.`);
    return { idExterno: exercicio.idExterno, nome: exercicio.nome, descricao: exercicio.descricao, series: Number(series) };
  });
}
