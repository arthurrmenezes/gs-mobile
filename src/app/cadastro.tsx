import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Botao, Campo, Erro, Opcoes, Selecao, Subtitulo, Tela, Texto } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { BAIRROS, DEPENDENCIAS, OPCOES_AUTONOMIA } from '../dados/dominio';
import { cores } from '../tema';
import type { TipoDependencia } from '../tipos';

type Erros = Partial<Record<'nome' | 'bairro' | 'dependencia' | 'autonomia' | 'telefone', string>>;

export default function Cadastro() {
  const { perfil, salvarPerfil } = useApp();

  const [nome, setNome] = useState(perfil?.nome ?? '');
  const [bairro, setBairro] = useState<string | null>(perfil?.bairro ?? null);
  const [dependencia, setDependencia] = useState<TipoDependencia | null>(perfil?.dependencia ?? null);
  const [autonomia, setAutonomia] = useState<number | null>(perfil?.autonomiaHoras ?? null);
  const [contatoNome, setContatoNome] = useState(perfil?.contatoNome ?? '');
  const [contatoTelefone, setContatoTelefone] = useState(perfil?.contatoTelefone ?? '');
  const [erros, setErros] = useState<Erros>({});
  const [salvando, setSalvando] = useState(false);

  function mudar<T>(campo: keyof Erros, definir: (v: T) => void) {
    return (v: T) => {
      definir(v);
      setErros(({ [campo]: _removido, ...resto }) => resto);
    };
  }

  async function salvar() {
    const telefone = contatoTelefone.replace(/\D/g, '');
    const e: Erros = {};
    if (nome.trim().length < 2) e.nome = 'Escreva como você quer ser chamado.';
    if (!bairro) e.bairro = 'Escolha o bairro onde você mora.';
    if (!dependencia) e.dependencia = 'Escolha a opção mais parecida com a sua necessidade.';
    if (autonomia === null) e.autonomia = 'Escolha quanto tempo você aguenta sem energia.';
    if (telefone.length > 0 && telefone.length < 10) e.telefone = 'O telefone precisa ter DDD e número. Exemplo: 11 90000-0000.';
    setErros(e);
    if (Object.keys(e).length > 0 || !bairro || !dependencia || autonomia === null) return;

    setSalvando(true);
    try {
      await salvarPerfil({
        nome: nome.trim(),
        bairro,
        dependencia,
        autonomiaHoras: autonomia,
        contatoNome: contatoNome.trim(),
        contatoTelefone: telefone,
      });
      router.dismissTo('/');
    } finally {
      setSalvando(false);
    }
  }

  const temErro = Object.keys(erros).length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Tela>
        <Texto cor={cores.textoSuave}>Com estas respostas o app mostra os avisos do seu bairro e o que fazer no seu caso.</Texto>

        <Campo
          rotulo="Como você quer ser chamado?"
          value={nome}
          onChangeText={mudar('nome', setNome)}
          autoCapitalize="words"
          autoComplete="given-name"
          maxLength={60}
          erro={erros.nome}
        />

        <Selecao
          rotulo="Em que bairro você mora?"
          vazio="Toque para escolher o bairro"
          opcoes={BAIRROS}
          valor={bairro}
          aoMudar={mudar('bairro', setBairro)}
          erro={erros.bairro}
        />

        <Opcoes
          rotulo="Do que você depende que usa energia?"
          opcoes={DEPENDENCIAS}
          valor={dependencia}
          aoMudar={mudar('dependencia', setDependencia)}
          erro={erros.dependencia}
        />

        <Opcoes
          rotulo="Quanto tempo você aguenta sem energia?"
          opcoes={OPCOES_AUTONOMIA.map((h) => ({ valor: h, rotulo: h === 1 ? '1 hora' : `${h} horas` }))}
          valor={autonomia}
          aoMudar={mudar('autonomia', setAutonomia)}
          emLinha
          erro={erros.autonomia}
        />

        <Subtitulo>Contato de confiança (opcional)</Subtitulo>
        <Texto cor={cores.textoSuave}>Alguém para quem você liga com um toque se precisar de ajuda.</Texto>
        <Campo rotulo="Nome do contato" value={contatoNome} onChangeText={setContatoNome} autoCapitalize="words" maxLength={60} />
        <Campo
          rotulo="Telefone do contato"
          ajuda="Com DDD. Exemplo: 11 90000-0000"
          value={contatoTelefone}
          onChangeText={mudar('telefone', setContatoTelefone)}
          keyboardType="phone-pad"
          maxLength={16}
          erro={erros.telefone}
        />

        {temErro ? <Erro texto="Faltou alguma resposta. Confira os avisos em vermelho acima." /> : null}
        <Botao titulo="Salvar" icone="checkmark" onPress={salvar} carregando={salvando} />
      </Tela>
    </KeyboardAvoidingView>
  );
}
