import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Linking } from 'react-native';

import { Botao, Campo, Cartao, Erro, Subtitulo, Tela, Texto, Titulo } from '../components/ui';
import { useApp } from '../contexto/AppContexto';
import { criarRegistro } from '../db/banco';
import { cores } from '../tema';
import type { Situacao } from '../tipos';

const ligar = (numero: string) => Linking.openURL(`tel:${numero}`);

export default function RegistrarSituacao() {
  const db = useSQLiteContext();
  const { perfil } = useApp();
  const [observacao, setObservacao] = useState('');
  const [registrado, setRegistrado] = useState<Situacao | null>(null);
  const [erro, setErro] = useState('');

  async function registrar(situacao: Situacao) {
    // Mesma regra da API para o check-in: pedido de ajuda precisa de descrição.
    if (situacao === 'PrecisoDeAjuda' && observacao.trim().length === 0) {
      setErro('Escreva em poucas palavras do que você precisa. Exemplo: "o oxigênio está acabando".');
      return;
    }
    setErro('');
    await criarRegistro(db, situacao, observacao.trim() || null);
    setRegistrado(situacao);
  }

  if (registrado === 'EstouBem') {
    return (
      <Tela>
        <Titulo>Registrado: você está bem</Titulo>
        <Texto>Guardamos o seu aviso com a data e a hora. Ele aparece em "Meus dados".</Texto>
        <Botao titulo="Voltar para o início" icone="home" onPress={() => router.back()} />
      </Tela>
    );
  }

  if (registrado === 'PrecisoDeAjuda') {
    return (
      <Tela>
        <Titulo>Pedido registrado</Titulo>
        <Texto>Agora ligue para alguém. Escolha uma das opções:</Texto>
        {perfil?.contatoTelefone ? (
          <Botao titulo={`Ligar para ${perfil.contatoNome || 'meu contato'}`} icone="call" onPress={() => ligar(perfil.contatoTelefone)} />
        ) : null}
        <Botao titulo="Ligar 192 (SAMU)" icone="medkit" tipo="perigo" dica="Emergência de saúde" onPress={() => ligar('192')} />
        <Botao titulo="Ligar 193 (Bombeiros)" icone="flame" tipo="secundario" onPress={() => ligar('193')} />
        <Botao titulo="Avisar a Enel: 0800 72 72 120" icone="flash" tipo="secundario" onPress={() => ligar('08007272120')} />
        <Botao titulo="Voltar para o início" icone="home" tipo="secundario" onPress={() => router.back()} />
      </Tela>
    );
  }

  return (
    <Tela>
      <Titulo>Como você está agora?</Titulo>
      <Texto cor={cores.textoSuave}>Toque em uma das opções. O registro fica guardado com a data e a hora.</Texto>

      <Botao titulo="Estou bem" icone="happy" onPress={() => registrar('EstouBem')} />

      <Cartao>
        <Subtitulo>Preciso de ajuda</Subtitulo>
        <Campo
          rotulo="Do que você precisa?"
          value={observacao}
          onChangeText={setObservacao}
          multiline
          maxLength={300}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        {erro ? <Erro texto={erro} /> : null}
        <Botao titulo="Preciso de ajuda" icone="alert-circle" tipo="perigo" onPress={() => registrar('PrecisoDeAjuda')} />
      </Cartao>

      <Texto tam={16} cor={cores.textoSuave}>
        Em caso de risco de vida, ligue direto para o 192 (SAMU).
      </Texto>
      <Botao titulo="Ligar 192 (SAMU)" icone="call" tipo="secundario" onPress={() => ligar('192')} />
    </Tela>
  );
}
