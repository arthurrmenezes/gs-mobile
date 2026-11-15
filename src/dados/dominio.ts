import type { NivelRisco, TipoDependencia, TipoPonto } from '../tipos';

export const BAIRROS = [
  'Aclimação',
  'Bela Vista',
  'Belém',
  'Bom Retiro',
  'Brás',
  'Butantã',
  'Cambuci',
  'Campo Belo',
  'Campo Limpo',
  'Capão Redondo',
  'Casa Verde',
  'Consolação',
  'Freguesia do Ó',
  'Grajaú',
  'Ipiranga',
  'Itaim Bibi',
  'Itaquera',
  'Jabaquara',
  'Jardim Paulista',
  'Lapa',
  'Liberdade',
  'Moema',
  'Mooca',
  'Penha',
  'Perdizes',
  'Pinheiros',
  'Pirituba',
  'República',
  'Santana',
  'Santo Amaro',
  'São Mateus',
  'São Miguel Paulista',
  'Saúde',
  'Sé',
  'Tatuapé',
  'Tucuruvi',
  'Vila Mariana',
  'Vila Prudente',
];

export const nomeBairro = (b: string) => BAIRROS.find((x) => x.toUpperCase() === b.toUpperCase()) ?? b;

export const DEPENDENCIAS: { valor: TipoDependencia; rotulo: string; descricao: string }[] = [
  { valor: 'OxigenioDomiciliar', rotulo: 'Oxigênio em casa', descricao: 'Concentrador ou outro aparelho para respirar' },
  { valor: 'MedicamentoRefrigerado', rotulo: 'Remédio na geladeira', descricao: 'Insulina ou outro remédio que precisa ficar gelado' },
  { valor: 'CadeiraMotorizada', rotulo: 'Cadeira motorizada', descricao: 'Cadeira de rodas ou scooter com bateria' },
  { valor: 'AcamadoComEquipamento', rotulo: 'Pessoa acamada', descricao: 'Cama elétrica, aspirador, bomba de alimentação' },
  { valor: 'Outro', rotulo: 'Outra necessidade', descricao: 'Qualquer outro aparelho que não pode desligar' },
];

export const rotuloDependencia = (d: TipoDependencia) => DEPENDENCIAS.find((x) => x.valor === d)?.rotulo ?? 'Outra necessidade';

export const OPCOES_AUTONOMIA = [1, 2, 4, 8, 12, 24];

/** Mesma regra da API: até 4h sem energia é prioritário. */
export const ehPrioritario = (autonomiaHoras: number) => autonomiaHoras <= 4;

export const rotuloTipoPonto: Record<TipoPonto, string> = {
  Saude: 'Unidade de saúde',
  Biblioteca: 'Biblioteca',
  Metro: 'Estação de metrô',
  Comercio: 'Comércio parceiro',
  Comunidade: 'Espaço comunitário',
};

export type ItemPreparo = { id: string; texto: string; para?: TipoDependencia[] };

export const ITENS_PREPARO: ItemPreparo[] = [
  { id: 'celular', texto: 'Carregar o celular e a bateria extra (power bank)' },
  { id: 'lanterna', texto: 'Deixar lanterna e pilhas em lugar fácil de achar' },
  { id: 'contato', texto: 'Avisar meu contato de confiança que pode faltar luz' },
  { id: 'ponto', texto: 'Escolher um lugar com energia perto de casa' },
  { id: 'agua', texto: 'Separar água e os remédios do dia' },
  { id: 'cilindro', texto: 'Conferir se o cilindro reserva de oxigênio está cheio', para: ['OxigenioDomiciliar'] },
  { id: 'fornecedor', texto: 'Anotar o telefone do fornecedor de oxigênio', para: ['OxigenioDomiciliar'] },
  { id: 'gelo', texto: 'Colocar gelo reutilizável no congelador', para: ['MedicamentoRefrigerado'] },
  { id: 'caixa', texto: 'Deixar a caixa térmica pronta para o remédio', para: ['MedicamentoRefrigerado'] },
  { id: 'bateria-cadeira', texto: 'Carregar a bateria da cadeira até o fim', para: ['CadeiraMotorizada'] },
  { id: 'cadeira-manual', texto: 'Deixar a cadeira manual ou o apoio por perto', para: ['CadeiraMotorizada'] },
  { id: 'bateria-equip', texto: 'Carregar as baterias dos aparelhos', para: ['AcamadoComEquipamento', 'Outro'] },
  { id: 'posicao', texto: 'Ajustar a cama na posição mais confortável antes da queda', para: ['AcamadoComEquipamento'] },
];

export const itensPara = (d: TipoDependencia) => ITENS_PREPARO.filter((i) => !i.para || i.para.includes(d));

export function orientacoes(d: TipoDependencia, nivel: NivelRisco, autonomiaHoras: number): string[] {
  const lista: string[] = [];
  if (nivel === 'Alto') lista.push('Combine agora com alguém de confiança quem vai ver como você está se a luz cair.');
  else lista.push('Fique de olho no aplicativo e deixe o celular carregado.');

  switch (d) {
    case 'OxigenioDomiciliar':
      lista.push('Confira o cilindro reserva e deixe-o ao lado da cama.');
      lista.push('Se o oxigênio acabar ou você sentir falta de ar, ligue 192 (SAMU).');
      break;
    case 'MedicamentoRefrigerado':
      lista.push('Evite abrir a geladeira: fechada, ela segura o frio por algumas horas.');
      lista.push('Se a luz demorar, passe o remédio para a caixa térmica com gelo.');
      break;
    case 'CadeiraMotorizada':
      lista.push('Carregue a bateria da cadeira até o fim antes do temporal.');
      lista.push('Evite sair sozinho se o elevador do prédio puder parar.');
      break;
    case 'AcamadoComEquipamento':
      lista.push('Carregue as baterias dos aparelhos e ajuste a cama antes da queda.');
      lista.push('Se algum aparelho essencial parar, ligue 192 (SAMU).');
      break;
    default:
      lista.push('Carregue as baterias dos aparelhos que você usa.');
  }

  lista.push(
    ehPrioritario(autonomiaHoras)
      ? `Você aguenta cerca de ${autonomiaHoras}h sem energia: escolha desde já um lugar com energia perto de casa.`
      : 'Veja na aba "Lugares" onde há energia perto de você, caso a luz demore a voltar.',
  );
  return lista;
}
