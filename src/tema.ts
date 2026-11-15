import type { NivelRisco } from './tipos';

// Cores com contraste de pelo menos 4,5:1 entre texto e fundo (WCAG AA).
export const cores = {
  fundo: '#F6F4EE',
  cartao: '#FFFFFF',
  texto: '#1A1F2B',
  textoSuave: '#4A5263',
  primaria: '#12355B',
  primariaClara: '#E3ECF6',
  borda: '#C9CFDA',
  branco: '#FFFFFF',
  perigo: '#A5221B',
  perigoClaro: '#FBE9E7',
  atencao: '#FFD166',
  atencaoTexto: '#3D2C00',
  ok: '#1B6E3C',
  okClaro: '#E4F3E9',
};

export const espaco = { p: 8, m: 16, g: 24 };

export const TOQUE_MINIMO = 56;

type AparenciaNivel = { rotulo: string; frase: string; fundo: string; texto: string; icone: 'flash' | 'warning' | 'checkmark-circle' };

export const aparenciaNivel: Record<NivelRisco, AparenciaNivel> = {
  Alto: { rotulo: 'Risco alto', frase: 'Risco alto de faltar luz', fundo: cores.perigo, texto: cores.branco, icone: 'flash' },
  Atencao: { rotulo: 'Atenção', frase: 'Pode faltar luz', fundo: cores.atencao, texto: cores.atencaoTexto, icone: 'warning' },
  Baixo: { rotulo: 'Risco baixo', frase: 'Risco baixo de faltar luz', fundo: cores.ok, texto: cores.branco, icone: 'checkmark-circle' },
};
