import { useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { Aviso, Botao, Carregando, Cartao, Linha, Subtitulo, Tela, Texto, Titulo } from '../../components/ui';
import { rotuloSituacaoPonto, rotuloTipoPonto } from '../../dados/dominio';
import { alternarFavorito, lerFavoritos } from '../../db/banco';
import { buscarPonto } from '../../services/api';
import { cores } from '../../tema';
import type { PontoEnergia } from '../../tipos';

export default function DetalhePonto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [ponto, setPonto] = useState<PontoEnergia | null | undefined>(undefined);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    buscarPonto(id).then(setPonto);
    lerFavoritos(db).then((f) => setSalvo(f.has(id)));
  }, [db, id]);

  if (ponto === undefined) return <Carregando />;
  if (ponto === null) {
    return (
      <Tela>
        <Titulo>Lugar não encontrado</Titulo>
      </Tela>
    );
  }

  async function alternar() {
    await alternarFavorito(db, id, !salvo);
    setSalvo(!salvo);
  }

  const sim = (v: boolean) => (v ? 'Sim' : 'Não');
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ponto.endereco}, ${ponto.bairro}, São Paulo`)}`;

  return (
    <Tela>
      <Titulo>{ponto.nome}</Titulo>
      <Texto cor={cores.textoSuave}>
        {rotuloTipoPonto[ponto.tipo]} · {ponto.bairro}
      </Texto>

      <Cartao>
        <Linha icone="location">
          <Texto peso="forte">Endereço</Texto>
          <Texto>{ponto.endereco}</Texto>
        </Linha>
        <Linha icone="time">
          <Texto peso="forte">Horário</Texto>
          <Texto>{ponto.horario}</Texto>
        </Linha>
        {ponto.situacao ? (
          <Linha icone={ponto.situacao === 'Funcionando' ? 'checkmark-circle' : 'alert-circle'}>
            <Texto peso="forte">Como está agora</Texto>
            <Texto>
              {rotuloSituacaoPonto[ponto.situacao]}
              {ponto.situacao === 'Funcionando' && ponto.tomadasLivres !== undefined ? `. Tomadas livres: ${ponto.tomadasLivres}` : ''}
            </Texto>
          </Linha>
        ) : null}
      </Cartao>

      <Cartao>
        <Subtitulo>O que tem neste lugar</Subtitulo>
        <Linha icone="flash">
          <Texto>Gerador próprio: {sim(ponto.temGerador)}</Texto>
        </Linha>
        <Linha icone="battery-charging">
          <Texto>Tomadas para o público: {ponto.tomadas}</Texto>
        </Linha>
        <Linha icone="medkit">
          <Texto>Aceita ligar aparelho médico: {sim(ponto.aceitaEquipamentoMedico)}</Texto>
        </Linha>
        <Linha icone="snow">
          <Texto>Guarda remédio na geladeira: {sim(ponto.guardaMedicamento)}</Texto>
        </Linha>
        <Linha icone="accessibility">
          <Texto>Entrada sem degraus: {sim(ponto.acessivel)}</Texto>
        </Linha>
      </Cartao>

      <Botao
        titulo={salvo ? 'Lugar salvo. Tocar para remover' : 'Salvar este lugar'}
        icone={salvo ? 'star' : 'star-outline'}
        tipo={salvo ? 'secundario' : 'primario'}
        onPress={alternar}
      />
      <Botao titulo="Ver no mapa" icone="map" tipo="secundario" dica="Abre o aplicativo de mapas" onPress={() => Linking.openURL(mapa)} />

      <Aviso icone="information-circle" texto="Dado de demonstração: este lugar e o endereço são simulados." />
    </Tela>
  );
}
