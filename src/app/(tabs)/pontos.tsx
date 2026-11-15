import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Aviso, Carregando, Cartao, Opcoes, Tela, Texto } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { rotuloTipoPonto } from '../../dados/dominio';
import { lerFavoritos } from '../../db/banco';
import { buscarPontos } from '../../services/api';
import { cores } from '../../tema';
import type { PontoEnergia } from '../../tipos';

type Filtro = 'bairro' | 'todos' | 'salvos';

export default function Pontos() {
  const db = useSQLiteContext();
  const { perfil } = useApp();
  const [pontos, setPontos] = useState<PontoEnergia[] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>('bairro');

  useEffect(() => {
    buscarPontos().then(setPontos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      lerFavoritos(db).then(setFavoritos);
    }, [db]),
  );

  if (!pontos || !perfil) return <Carregando texto="Buscando lugares com energia…" />;

  const visiveis = pontos.filter((p) =>
    filtro === 'bairro' ? p.bairro === perfil.bairro : filtro === 'salvos' ? favoritos.has(p.id) : true,
  );

  return (
    <Tela>
      <Aviso icone="information-circle" texto="Dados de demonstração: os lugares e endereços são simulados." />

      <Opcoes<Filtro>
        rotulo="Mostrar"
        opcoes={[
          { valor: 'bairro', rotulo: perfil.bairro },
          { valor: 'todos', rotulo: 'Todos' },
          { valor: 'salvos', rotulo: 'Salvos' },
        ]}
        valor={filtro}
        aoMudar={setFiltro}
        emLinha
      />

      <Texto cor={cores.textoSuave} accessibilityLiveRegion="polite">
        {visiveis.length === 1 ? '1 lugar encontrado' : `${visiveis.length} lugares encontrados`}
      </Texto>

      {visiveis.length === 0 ? (
        <Cartao>
          <Texto>
            {filtro === 'salvos'
              ? 'Você ainda não salvou nenhum lugar. Abra um lugar e toque em "Salvar este lugar".'
              : 'Ainda não há lugares cadastrados neste bairro. Veja a opção "Todos".'}
          </Texto>
        </Cartao>
      ) : null}

      {visiveis.map((p) => (
        <Pressable
          key={p.id}
          onPress={() => router.push(`/ponto/${p.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${p.nome}. ${rotuloTipoPonto[p.tipo]} em ${p.bairro}. ${p.horario}. ${p.temGerador ? 'Tem gerador.' : 'Não tem gerador.'}${favoritos.has(p.id) ? ' Salvo.' : ''}`}
          accessibilityHint="Abre os detalhes do lugar">
          <Cartao>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Texto tam={19} peso="forte">
                  {p.nome}
                </Texto>
                <Texto tam={16} cor={cores.textoSuave}>
                  {rotuloTipoPonto[p.tipo]} · {p.bairro}
                </Texto>
              </View>
              {favoritos.has(p.id) ? <Ionicons name="star" size={24} color={cores.primaria} /> : null}
              <Ionicons name="chevron-forward" size={24} color={cores.textoSuave} />
            </View>
            <Texto>{p.horario}</Texto>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {p.temGerador ? <Etiqueta icone="flash" texto="Tem gerador" /> : null}
              {p.aceitaEquipamentoMedico ? <Etiqueta icone="medkit" texto="Aceita aparelho médico" /> : null}
              {p.guardaMedicamento ? <Etiqueta icone="snow" texto="Guarda remédio gelado" /> : null}
            </View>
          </Cartao>
        </Pressable>
      ))}
    </Tela>
  );
}

function Etiqueta({ icone, texto }: { icone: 'flash' | 'medkit' | 'snow'; texto: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: cores.okClaro, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Ionicons name={icone} size={16} color={cores.ok} />
      <Texto tam={16} cor={cores.ok} peso="forte">
        {texto}
      </Texto>
    </View>
  );
}
