import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Linking, Pressable, RefreshControl, View } from 'react-native';

import { Aviso, Botao, Carregando, Cartao, SeloNivel, Subtitulo, Tela, Texto, Titulo } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { ehPrioritario, itensPara } from '../../dados/dominio';
import { lerPreparoFeito } from '../../db/banco';
import { buscarAlertas } from '../../services/api';
import { aparenciaNivel, cores } from '../../tema';
import type { Alerta, ResultadoAlertas } from '../../tipos';
import { dataHora, diaPorExtenso } from '../../utils/datas';

export default function Inicio() {
  const db = useSQLiteContext();
  const { perfil } = useApp();
  const [resultado, setResultado] = useState<ResultadoAlertas | null>(null);
  const [atualizando, setAtualizando] = useState(false);
  const [preparo, setPreparo] = useState({ feitos: 0, total: 0 });

  const bairro = perfil?.bairro;
  const dependencia = perfil?.dependencia;

  const carregar = useCallback(async () => {
    if (!bairro || !dependencia) return;
    setResultado(await buscarAlertas(db, bairro));
    const itens = itensPara(dependencia);
    const feitos = await lerPreparoFeito(db);
    setPreparo({ feitos: itens.filter((i) => feitos.has(i.id)).length, total: itens.length });
  }, [db, bairro, dependencia]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function atualizar() {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }

  if (!perfil) return null;
  if (!resultado) return <Carregando texto="Buscando os avisos do seu bairro…" />;

  const [principal, ...proximos] = resultado.alertas;

  return (
    <Tela refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} />}>
      <View>
        <Titulo>Olá, {perfil.nome}</Titulo>
        <Texto cor={cores.textoSuave}>Avisos para {perfil.bairro}, São Paulo</Texto>
      </View>

      {resultado.origem === 'mock' ? (
        <Aviso icone="information-circle" texto="Dados de demonstração: estes avisos são simulados." />
      ) : null}
      {resultado.origem === 'cache' ? (
        <Aviso
          icone="cloud-offline"
          texto={
            resultado.atualizadoEm
              ? `Sem conexão. Mostrando os avisos guardados em ${dataHora(resultado.atualizadoEm)}.`
              : 'Sem conexão e ainda sem avisos guardados. Tente atualizar daqui a pouco.'
          }
        />
      ) : null}

      {principal ? <CartaoPrincipal alerta={principal} /> : <SemAlerta />}

      <Botao
        titulo="Avisar como estou"
        icone="hand-left"
        dica="Abre a tela para registrar se você está bem ou se precisa de ajuda"
        onPress={() => router.push('/situacao')}
      />
      <Botao titulo="Achar lugar com energia" icone="location" tipo="secundario" onPress={() => router.push('/pontos')} />
      {perfil.contatoTelefone ? (
        <Botao
          titulo={`Ligar para ${perfil.contatoNome || 'meu contato'}`}
          icone="call"
          tipo="secundario"
          onPress={() => Linking.openURL(`tel:${perfil.contatoTelefone}`)}
        />
      ) : null}

      <Cartao>
        <Subtitulo>Seu preparo</Subtitulo>
        <Texto>
          {preparo.feitos} de {preparo.total} itens prontos.{' '}
          {ehPrioritario(perfil.autonomiaHoras)
            ? `Você aguenta cerca de ${perfil.autonomiaHoras}h sem energia, então vale deixar tudo pronto antes.`
            : ''}
        </Texto>
        <Botao titulo="Ver minha lista" icone="checkbox" tipo="secundario" onPress={() => router.push('/preparo')} />
      </Cartao>

      {proximos.length > 0 ? (
        <View style={{ gap: 8 }}>
          <Subtitulo>Próximos avisos</Subtitulo>
          {proximos.map((a) => (
            <ItemAlerta key={a.id} alerta={a} />
          ))}
        </View>
      ) : null}

      <Botao titulo="Atualizar avisos" icone="refresh" tipo="secundario" onPress={atualizar} carregando={atualizando} />
      {resultado.atualizadoEm ? (
        <Texto tam={16} cor={cores.textoSuave} style={{ textAlign: 'center' }}>
          Última atualização: {dataHora(resultado.atualizadoEm)}
        </Texto>
      ) : null}
    </Tela>
  );
}

function CartaoPrincipal({ alerta }: { alerta: Alerta }) {
  const a = aparenciaNivel[alerta.nivel];
  const quando = diaPorExtenso(alerta.data);
  return (
    <Pressable
      onPress={() => router.push(`/alerta/${alerta.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${a.frase}. ${quando}. ${alerta.mensagem}`}
      accessibilityHint="Abre o aviso com o que fazer agora"
      style={{ backgroundColor: a.fundo, borderRadius: 18, padding: 18, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name={a.icone} size={36} color={a.texto} />
        <View style={{ flex: 1 }}>
          <Texto tam={16} peso="forte" cor={a.texto}>
            {quando.toUpperCase()}
          </Texto>
          <Texto tam={24} peso="forte" cor={a.texto}>
            {a.frase}
          </Texto>
        </View>
      </View>
      <Texto cor={a.texto}>{alerta.mensagem}</Texto>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 }}>
        <Texto peso="forte" cor={a.texto}>
          Ver o que fazer agora
        </Texto>
        <Ionicons name="arrow-forward" size={20} color={a.texto} />
      </View>
    </Pressable>
  );
}

function SemAlerta() {
  return (
    <View
      accessible
      accessibilityLabel="Sem risco previsto. Nenhum aviso de falta de luz para os próximos dias."
      style={{ backgroundColor: cores.ok, borderRadius: 18, padding: 18, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="checkmark-circle" size={36} color={cores.branco} />
        <Texto tam={24} peso="forte" cor={cores.branco} style={{ flex: 1 }}>
          Sem risco previsto
        </Texto>
      </View>
      <Texto cor={cores.branco}>Nenhum aviso de falta de luz para os próximos dias. A gente avisa se mudar.</Texto>
    </View>
  );
}

function ItemAlerta({ alerta }: { alerta: Alerta }) {
  const quando = diaPorExtenso(alerta.data);
  return (
    <Pressable
      onPress={() => router.push(`/alerta/${alerta.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${aparenciaNivel[alerta.nivel].rotulo}. ${quando}. ${alerta.mensagem}`}>
      <Cartao>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <Texto peso="forte">{quando}</Texto>
          <SeloNivel nivel={alerta.nivel} />
        </View>
        <Texto>{alerta.mensagem}</Texto>
      </Cartao>
    </Pressable>
  );
}
