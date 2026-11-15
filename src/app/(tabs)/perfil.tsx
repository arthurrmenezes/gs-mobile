import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Switch, View } from 'react-native';

import { Botao, Cartao, Linha, Subtitulo, Tela, Texto } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { ehPrioritario, rotuloDependencia } from '../../dados/dominio';
import { listarRegistros } from '../../db/banco';
import { usandoApi } from '../../services/api';
import { cores, TOQUE_MINIMO } from '../../tema';
import type { Registro } from '../../tipos';
import { dataHora } from '../../utils/datas';

export default function MeusDados() {
  const db = useSQLiteContext();
  const { perfil, letrasGrandes, definirLetrasGrandes, apagarTudo } = useApp();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [confirmando, setConfirmando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      listarRegistros(db).then(setRegistros);
      setConfirmando(false);
    }, [db]),
  );

  if (!perfil) return null;

  return (
    <Tela>
      <Cartao>
        <Subtitulo>{perfil.nome}</Subtitulo>
        <Linha icone="location">
          <Texto>Bairro: {perfil.bairro}</Texto>
        </Linha>
        <Linha icone="medkit">
          <Texto>Depende de: {rotuloDependencia(perfil.dependencia).toLowerCase()}</Texto>
        </Linha>
        <Linha icone="time">
          <Texto>
            Aguenta sem energia: {perfil.autonomiaHoras === 1 ? '1 hora' : `${perfil.autonomiaHoras} horas`}
            {ehPrioritario(perfil.autonomiaHoras) ? ' (atendimento prioritário)' : ''}
          </Texto>
        </Linha>
        <Linha icone="call">
          <Texto>
            Contato de confiança: {perfil.contatoTelefone ? `${perfil.contatoNome || 'sem nome'}, ${perfil.contatoTelefone}` : 'não informado'}
          </Texto>
        </Linha>
        <Botao titulo="Alterar meus dados" icone="create" tipo="secundario" onPress={() => router.push('/cadastro')} />
      </Cartao>

      <Cartao>
        <Subtitulo>Leitura</Subtitulo>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: TOQUE_MINIMO }}>
          <Texto style={{ flex: 1 }}>Letras grandes</Texto>
          <Switch
            value={letrasGrandes}
            onValueChange={definirLetrasGrandes}
            accessibilityLabel="Letras grandes"
            accessibilityHint="Aumenta o tamanho de todos os textos do aplicativo"
            trackColor={{ true: cores.primaria, false: cores.borda }}
          />
        </View>
      </Cartao>

      <Cartao>
        <Subtitulo>Meus registros</Subtitulo>
        {registros.length === 0 ? (
          <Texto cor={cores.textoSuave}>Você ainda não registrou como está. Use o botão "Avisar como estou" no início.</Texto>
        ) : (
          registros.map((r) => (
            <Linha key={r.id} icone={r.situacao === 'EstouBem' ? 'happy' : 'alert-circle'}>
              <Texto peso="forte">{r.situacao === 'EstouBem' ? 'Estou bem' : 'Pedi ajuda'}</Texto>
              <Texto tam={16} cor={cores.textoSuave}>
                {dataHora(r.criadoEm)}
              </Texto>
              {r.observacao ? <Texto>{r.observacao}</Texto> : null}
            </Linha>
          ))
        )}
      </Cartao>

      <Cartao>
        <Subtitulo>Sobre os seus dados</Subtitulo>
        <Texto>
          Seu cadastro, sua lista e seus registros ficam guardados só neste celular. O app não pede CPF nem endereço.
        </Texto>
        <Texto tam={16} cor={cores.textoSuave}>
          {usandoApi ? 'Avisos: vêm da API da Luz Vital.' : 'Avisos: dados de demonstração (simulados).'} Lugares com energia: dados
          simulados.
        </Texto>
        {confirmando ? (
          <View style={{ gap: 8 }} accessibilityLiveRegion="polite">
            <Texto peso="forte" cor={cores.perigo}>
              Apagar tudo? Não dá para desfazer.
            </Texto>
            <Botao titulo="Sim, apagar tudo" icone="trash" tipo="perigo" onPress={apagarTudo} />
            <Botao titulo="Não, manter meus dados" tipo="secundario" onPress={() => setConfirmando(false)} />
          </View>
        ) : (
          <Botao titulo="Apagar meus dados deste celular" icone="trash" tipo="secundario" onPress={() => setConfirmando(true)} />
        )}
      </Cartao>
    </Tela>
  );
}
