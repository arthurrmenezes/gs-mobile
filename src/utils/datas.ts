const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function dataISO(maisDias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + maisDias);
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function diaPorExtenso(iso: string): string {
  if (iso === dataISO(0)) return 'Hoje';
  if (iso === dataISO(1)) return 'Amanhã';
  const [ano, mes, dia] = iso.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia);
  return `${DIAS[d.getDay()]}, ${doisDigitos(dia)}/${doisDigitos(mes)}`;
}

export function dataHora(iso: string): string {
  const d = new Date(iso);
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)} às ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}
