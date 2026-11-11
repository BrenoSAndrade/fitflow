import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { listarReservasParaLembretes } from '../banco/aulas';
import { lerPreferencias, salvarPreferencias } from './preferencias';

const chaveRegistro = 'fitflow.lembretes';
const canal = 'aulas-fitflow';
let configurado = false;
let fila = Promise.resolve();

function enfileirar(operacao) {
  const resultado = fila.then(operacao);
  fila = resultado.catch(() => {});
  return resultado;
}

async function configurar() {
  if (configurado) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(canal, { name: 'Lembretes de aulas', importance: Notifications.AndroidImportance.HIGH, sound: 'default' });
  }
  configurado = true;
}

function permissaoConcedida(permissao) {
  return permissao.granted || permissao.status === 'granted' || permissao.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

function pertenceAoApp(pedido) {
  return pedido.content?.data?.aplicativo === 'fitflow' && pedido.content?.data?.tipo === 'aula';
}

async function lerRegistro() {
  const valor = await AsyncStorage.getItem(chaveRegistro);
  try {
    const registro = JSON.parse(valor);
    return registro && typeof registro === 'object' && !Array.isArray(registro) ? registro : {};
  } catch {
    return {};
  }
}

async function cancelarNotificacao(id) {
  await Notifications.cancelScheduledNotificationAsync(id);
  await Notifications.dismissNotificationAsync(id);
}

async function atualizarLembretes() {
  await configurar();
  const preferencias = await lerPreferencias();
  const registro = await lerRegistro();
  const agendados = (await Notifications.getAllScheduledNotificationsAsync()).filter(pertenceAoApp);
  const entregues = (await Notifications.getPresentedNotificationsAsync()).map((item) => item.request).filter(pertenceAoApp);
  const pedidos = [...entregues, ...agendados];
  const permissao = preferencias.lembretesAtivos ? await Notifications.getPermissionsAsync() : null;
  const permitido = preferencias.lembretesAtivos && permissaoConcedida(permissao);
  const agora = Date.now();
  const reservas = permitido ? await listarReservasParaLembretes() : [];
  const desejados = new Map();
  for (const aula of reservas) {
    const inicioAula = new Date(`${aula.data}T${aula.horario}:00`).getTime();
    if (!Number.isFinite(inicioAula) || inicioAula <= agora) continue;
    const chave = `fitflow.aula.${aula.id}.${encodeURIComponent(aula.aluno)}`;
    desejados.set(chave, { aula, inicioAula });
  }
  const cancelar = new Set();
  for (const pedido of pedidos) {
    const desejado = desejados.get(pedido.content.data.chave);
    if (!desejado || pedido.content.data.inicioAula !== desejado.inicioAula) cancelar.add(pedido.identifier);
  }
  for (const [chave, item] of Object.entries(registro)) {
    const desejado = desejados.get(chave);
    if ((!desejado || item?.inicioAula !== desejado.inicioAula) && typeof item?.notificacaoId === 'string') cancelar.add(item.notificacaoId);
  }
  for (const id of cancelar) await cancelarNotificacao(id);
  const novoRegistro = {};
  for (const [chave, { aula, inicioAula }] of desejados) {
    const existente = pedidos.find((pedido) => pedido.content.data.chave === chave && pedido.content.data.inicioAula === inicioAula);
    const anterior = registro[chave]?.inicioAula === inicioAula && Number.isFinite(registro[chave]?.alertaEm) ? registro[chave] : null;
    if (existente) {
      novoRegistro[chave] = { inicioAula, alertaEm: existente.content.data.alertaEm, notificacaoId: existente.identifier };
      continue;
    }
    if (anterior && anterior.alertaEm <= agora) {
      novoRegistro[chave] = anterior;
      continue;
    }
    const alertaEm = anterior?.alertaEm || Math.min(Math.max(inicioAula - 10 * 60 * 1000, agora + 5000), inicioAula - 1000);
    if (alertaEm <= agora) {
      novoRegistro[chave] = { inicioAula, alertaEm };
      continue;
    }
    const notificacaoId = await Notifications.scheduleNotificationAsync({
      identifier: chave,
      content: {
        title: 'Lembrete de aula',
        body: `${aula.nome} começa às ${aula.horario}. Sua vaga está reservada.`,
        sound: 'default',
        data: { aplicativo: 'fitflow', tipo: 'aula', chave, aulaId: aula.id, aluno: aula.aluno, inicioAula, alertaEm },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(alertaEm), ...(Platform.OS === 'android' ? { channelId: canal } : {}) },
    });
    novoRegistro[chave] = { inicioAula, alertaEm, notificacaoId };
  }
  await AsyncStorage.setItem(chaveRegistro, JSON.stringify(novoRegistro));
  return { semPermissao: preferencias.lembretesAtivos && !permitido };
}

export function sincronizarLembretes() {
  return enfileirar(atualizarLembretes);
}

export function alterarLembretes(ativar) {
  if (typeof ativar !== 'boolean') return Promise.reject(new Error('Preferência inválida.'));
  return enfileirar(async () => {
    await configurar();
    if (ativar) {
      let permissao = await Notifications.getPermissionsAsync();
      if (!permissaoConcedida(permissao)) permissao = await Notifications.requestPermissionsAsync();
      if (!permissaoConcedida(permissao)) {
        await salvarPreferencias({ lembretesAtivos: false });
        await atualizarLembretes();
        return { permitido: false };
      }
    }
    await salvarPreferencias({ lembretesAtivos: ativar });
    await atualizarLembretes();
    return { permitido: true };
  });
}
