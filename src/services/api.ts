import type { SQLiteDatabase } from 'expo-sqlite';

import pontosMock from '../dados/pontos.mock.json';
import { guardarAlertas, lerAlertasGuardados } from '../db/banco';
import type { Alerta, NivelRisco, PontoEnergia, ResultadoAlertas } from '../tipos';
import { dataISO } from '../utils/datas';

const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const PONTOS_URL = (process.env.EXPO_PUBLIC_PONTOS_URL ?? '').replace(/\/+$/, '');

export const usandoApi = API_URL.length > 0;

const esperar = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

async function buscarJson<T>(endereco: string, tempoLimiteMs = 6000): Promise<T> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), tempoLimiteMs);
  try {
    const resposta = await fetch(endereco, { signal: controle.signal, headers: { Accept: 'application/json' } });
    if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status}`);
    return (await resposta.json()) as T;
  } finally {
    clearTimeout(relogio);
  }
}

const PESO_NIVEL: Record<NivelRisco, number> = { Baixo: 0, Atencao: 1, Alto: 2 };

function ordenar(alertas: Alerta[]): Alerta[] {
  return [...alertas].sort((a, b) => a.data.localeCompare(b.data) || PESO_NIVEL[b.nivel] - PESO_NIVEL[a.nivel]);
}

function alertasMock(bairro: string): Alerta[] {
  return [
    {
      id: 9001,
      data: dataISO(1),
      nivel: 'Alto',
      bairro: null,
      mensagem: 'Risco alto de falta de energia por causa de temporal. Carregue os aparelhos e confira o plano de emergência.',
      ativo: true,
    },
    {
      id: 9002,
      data: dataISO(3),
      nivel: 'Atencao',
      bairro,
      mensagem: `Previsão de vento forte em ${bairro}. Pode haver queda de energia no fim da tarde.`,
      ativo: true,
    },
  ];
}

// Com a API configurada, guarda uma cópia no SQLite e cai nela quando a API não responde. Sem API, usa o mock.
export async function buscarAlertas(db: SQLiteDatabase, bairro: string): Promise<ResultadoAlertas> {
  const agora = new Date().toISOString();

  if (!usandoApi) {
    await esperar(500);
    const alertas = alertasMock(bairro);
    await guardarAlertas(db, alertas, agora);
    return { alertas, origem: 'mock', atualizadoEm: agora };
  }

  try {
    const lista = await buscarJson<Alerta[]>(`${API_URL}/api/alertas?bairro=${encodeURIComponent(bairro)}`);
    const alertas = ordenar(lista);
    await guardarAlertas(db, alertas, agora);
    return { alertas, origem: 'api', atualizadoEm: agora };
  } catch {
    const guardados = await lerAlertasGuardados(db);
    const hoje = dataISO(0);
    return {
      alertas: ordenar(guardados.alertas.filter((a) => a.data >= hoje)),
      origem: 'cache',
      atualizadoEm: guardados.salvoEm ?? '',
    };
  }
}

export async function buscarAlertaGuardado(db: SQLiteDatabase, id: number): Promise<Alerta | null> {
  const { alertas } = await lerAlertasGuardados(db);
  return alertas.find((a) => a.id === id) ?? null;
}

// O serviço de pontos devolve o id como número; o app usa "p1", "p2"... (o mesmo id do mock e dos lugares salvos).
type PontoDoServico = Omit<PontoEnergia, 'id'> & { id: number };

// Com o serviço de pontos configurado (EXPO_PUBLIC_PONTOS_URL), busca nele. Sem endereço, ou se ele não responder, usa o mock.
export async function buscarPontos(): Promise<PontoEnergia[]> {
  if (PONTOS_URL) {
    try {
      const lista = await buscarJson<PontoDoServico[]>(`${PONTOS_URL}/api/pontos`);
      return lista.map((p) => ({ ...p, id: `p${p.id}` }));
    } catch {
      return pontosMock as PontoEnergia[];
    }
  }
  await esperar(400);
  return pontosMock as PontoEnergia[];
}

export async function buscarPonto(id: string): Promise<PontoEnergia | null> {
  const pontos = await buscarPontos();
  return pontos.find((p) => p.id === id) ?? null;
}
