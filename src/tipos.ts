// Os nomes seguem o contrato da API C# (api-csharp), que devolve os enums como texto.

export type NivelRisco = 'Baixo' | 'Atencao' | 'Alto';

export type TipoDependencia =
  | 'OxigenioDomiciliar'
  | 'MedicamentoRefrigerado'
  | 'CadeiraMotorizada'
  | 'AcamadoComEquipamento'
  | 'Outro';

export type Alerta = {
  id: number;
  data: string;
  nivel: NivelRisco;
  /** null = vale para a cidade toda. */
  bairro: string | null;
  mensagem: string;
  ativo: boolean;
};

export type Origem = 'api' | 'mock' | 'cache';

export type ResultadoAlertas = {
  alertas: Alerta[];
  origem: Origem;
  atualizadoEm: string;
};

export type TipoPonto = 'Saude' | 'Biblioteca' | 'Metro' | 'Comercio' | 'Comunidade';

export type SituacaoPonto = 'Funcionando' | 'Lotado' | 'SemEnergia' | 'Fechado';

export type PontoEnergia = {
  id: string;
  nome: string;
  tipo: TipoPonto;
  bairro: string;
  endereco: string;
  horario: string;
  temGerador: boolean;
  tomadas: number;
  aceitaEquipamentoMedico: boolean;
  guardaMedicamento: boolean;
  acessivel: boolean;
  /** Só vêm do serviço de pontos; no mock ficam vazios. */
  situacao?: SituacaoPonto;
  tomadasLivres?: number;
};

export type Perfil = {
  nome: string;
  bairro: string;
  dependencia: TipoDependencia;
  autonomiaHoras: number;
  contatoNome: string;
  contatoTelefone: string;
};

export type Situacao = 'EstouBem' | 'PrecisoDeAjuda';

export type Registro = {
  id: number;
  situacao: Situacao;
  observacao: string | null;
  criadoEm: string;
};
