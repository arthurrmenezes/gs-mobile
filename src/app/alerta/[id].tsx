import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Botao, Carregando, Cartao, Linha, SeloNivel, Subtitulo, Tela, Texto, Titulo } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { nomeBairro, orientacoes, rotuloDependencia } from '../../dados/dominio';
import { buscarAlertaGuardado } from '../../services/api';
import { cores } from '../../tema';
import type { Alerta } from '../../tipos';
import { diaPorExtenso } from '../../utils/datas';

export default function DetalheAlerta() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const { perfil } = useApp();
  const [alerta, setAlerta] = useState<Alerta | null | undefined>(undefined);

  useEffect(() => {
    buscarAlertaGuardado(db, Number(id)).then(setAlerta);
  }, [db, id]);

  if (alerta === undefined || !perfil) return <Carregando />;

  if (alerta === null) {
    return (
      <Tela>
        <Titulo>Aviso não encontrado</Titulo>
        <Texto>Este aviso pode ter sido encerrado porque a luz voltou.</Texto>
        <Botao titulo="Voltar para o início" icone="home" onPress={() => router.dismissTo('/')} />
      </Tela>
    );
  }

  const passos = orientacoes(perfil.dependencia, alerta.nivel, perfil.autonomiaHoras);

  return (
    <Tela>
      <View style={{ gap: 8 }}>
        <SeloNivel nivel={alerta.nivel} />
        <Titulo>{diaPorExtenso(alerta.data)}</Titulo>
        <Texto cor={cores.textoSuave}>{alerta.bairro ? `Vale para ${nomeBairro(alerta.bairro)}` : 'Vale para a cidade toda'}</Texto>
      </View>

      <Cartao>
        <Texto tam={19}>{alerta.mensagem}</Texto>
      </Cartao>

      <Cartao>
        <Subtitulo>O que fazer agora</Subtitulo>
        <Texto tam={16} cor={cores.textoSuave}>
          Para quem depende de: {rotuloDependencia(perfil.dependencia).toLowerCase()}
        </Texto>
        {passos.map((p, i) => (
          <Linha key={i} icone="checkmark-circle">
            <Texto>{p}</Texto>
          </Linha>
        ))}
      </Cartao>

      <Botao titulo="Abrir minha lista de preparo" icone="checkbox" onPress={() => router.navigate('/preparo')} />
      <Botao titulo="Achar lugar com energia" icone="location" tipo="secundario" onPress={() => router.navigate('/pontos')} />
      <Botao titulo="Avisar como estou" icone="hand-left" tipo="secundario" onPress={() => router.push('/situacao')} />
    </Tela>
  );
}
