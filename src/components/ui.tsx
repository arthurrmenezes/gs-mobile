import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type RefreshControlProps,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewStyle,
} from 'react-native';

import { useApp } from '../contexto/AppContexto';
import { aparenciaNivel, cores, espaco, TOQUE_MINIMO } from '../tema';
import type { NivelRisco } from '../tipos';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

type TextoProps = TextProps & { tam?: number; peso?: 'normal' | 'forte'; cor?: string };

export function Texto({ tam = 17, peso = 'normal', cor = cores.texto, style, ...resto }: TextoProps) {
  const { escala } = useApp();
  const tamanho = tam * escala;
  return (
    <Text
      {...resto}
      style={[{ fontSize: tamanho, lineHeight: tamanho * 1.4, color: cor, fontWeight: peso === 'forte' ? '700' : '400' }, style]}
    />
  );
}

export function Titulo(props: TextoProps) {
  return <Texto tam={24} peso="forte" accessibilityRole="header" {...props} />;
}

export function Subtitulo(props: TextoProps) {
  return <Texto tam={19} peso="forte" accessibilityRole="header" {...props} />;
}

type TelaProps = { children: ReactNode; refreshControl?: React.ReactElement<RefreshControlProps> };

export function Tela({ children, refreshControl }: TelaProps) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cores.fundo }}
      contentContainerStyle={estilos.tela}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}>
      {children}
    </ScrollView>
  );
}

export function Cartao({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[estilos.cartao, style]}>{children}</View>;
}

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  icone?: NomeIcone;
  tipo?: 'primario' | 'secundario' | 'perigo';
  dica?: string;
  desabilitado?: boolean;
  carregando?: boolean;
};

export function Botao({ titulo, onPress, icone, tipo = 'primario', dica, desabilitado, carregando }: BotaoProps) {
  const fundo = tipo === 'primario' ? cores.primaria : tipo === 'perigo' ? cores.perigo : cores.cartao;
  const corTexto = tipo === 'secundario' ? cores.primaria : cores.branco;
  const parado = desabilitado || carregando;
  return (
    <Pressable
      onPress={onPress}
      disabled={parado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={dica}
      accessibilityState={{ disabled: !!parado, busy: !!carregando }}
      style={({ pressed }) => [
        estilos.botao,
        { backgroundColor: fundo, borderColor: tipo === 'secundario' ? cores.primaria : fundo, opacity: pressed ? 0.8 : parado ? 0.6 : 1 },
      ]}>
      {carregando ? <ActivityIndicator color={corTexto} /> : icone ? <Ionicons name={icone} size={24} color={corTexto} /> : null}
      <Texto tam={18} peso="forte" cor={corTexto} style={{ flexShrink: 1, textAlign: 'center' }}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

type CampoProps = TextInputProps & { rotulo: string; ajuda?: string; erro?: string };

export function Campo({ rotulo, ajuda, erro, style, ...resto }: CampoProps) {
  const { escala } = useApp();
  return (
    <View style={{ gap: 6 }}>
      <Texto peso="forte">{rotulo}</Texto>
      {ajuda ? <Texto tam={16} cor={cores.textoSuave}>{ajuda}</Texto> : null}
      <TextInput
        {...resto}
        accessibilityLabel={ajuda ? `${rotulo}. ${ajuda}` : rotulo}
        placeholderTextColor={cores.textoSuave}
        style={[estilos.campo, { fontSize: 18 * escala, borderColor: erro ? cores.perigo : cores.borda }, style]}
      />
      {erro ? <Erro texto={erro} /> : null}
    </View>
  );
}

export function Erro({ texto }: { texto: string }) {
  return (
    <View style={estilos.linha} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Ionicons name="alert-circle" size={20} color={cores.perigo} />
      <Texto tam={16} cor={cores.perigo} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  );
}

type OpcoesProps<T extends string | number> = {
  rotulo: string;
  opcoes: { valor: T; rotulo: string; descricao?: string }[];
  valor: T | null;
  aoMudar: (v: T) => void;
  emLinha?: boolean;
  erro?: string;
};

export function Opcoes<T extends string | number>({ rotulo, opcoes, valor, aoMudar, emLinha, erro }: OpcoesProps<T>) {
  return (
    <View style={{ gap: 6 }}>
      <Texto peso="forte">{rotulo}</Texto>
      <View accessibilityRole="radiogroup" accessibilityLabel={rotulo} style={emLinha ? estilos.opcoesLinha : { gap: espaco.p }}>
        {opcoes.map((o) => {
          const marcado = o.valor === valor;
          return (
            <Pressable
              key={String(o.valor)}
              onPress={() => aoMudar(o.valor)}
              accessibilityRole="radio"
              accessibilityState={{ checked: marcado }}
              accessibilityLabel={o.descricao ? `${o.rotulo}. ${o.descricao}` : o.rotulo}
              style={[estilos.opcao, marcado && estilos.opcaoMarcada]}>
              <Ionicons name={marcado ? 'radio-button-on' : 'radio-button-off'} size={24} color={cores.primaria} />
              <View style={{ flexShrink: 1 }}>
                <Texto peso={marcado ? 'forte' : 'normal'}>{o.rotulo}</Texto>
                {o.descricao ? <Texto tam={16} cor={cores.textoSuave}>{o.descricao}</Texto> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      {erro ? <Erro texto={erro} /> : null}
    </View>
  );
}

const semAcento = (t: string) => t.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

type SelecaoProps = {
  rotulo: string;
  vazio: string;
  opcoes: string[];
  valor: string | null;
  aoMudar: (v: string) => void;
  erro?: string;
};

export function Selecao({ rotulo, vazio, opcoes, valor, aoMudar, erro }: SelecaoProps) {
  const { escala } = useApp();
  const [aberta, setAberta] = useState(false);
  const [busca, setBusca] = useState('');

  const visiveis = opcoes.filter((o) => semAcento(o).includes(semAcento(busca.trim())));

  function fechar() {
    setAberta(false);
    setBusca('');
  }

  function escolher(o: string) {
    aoMudar(o);
    fechar();
  }

  return (
    <View style={{ gap: 6 }}>
      <Texto peso="forte">{rotulo}</Texto>
      <Pressable
        onPress={() => setAberta(true)}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo} ${valor ? `Escolhido: ${valor}` : 'Nada escolhido'}`}
        accessibilityHint="Abre a lista de opções"
        style={[estilos.campo, estilos.selecao, { borderColor: erro ? cores.perigo : cores.borda }]}>
        <Texto tam={18} cor={valor ? cores.texto : cores.textoSuave} style={{ flex: 1 }}>
          {valor ?? vazio}
        </Texto>
        <Ionicons name="chevron-down" size={24} color={cores.primaria} />
      </Pressable>
      {erro ? <Erro texto={erro} /> : null}

      <Modal visible={aberta} animationType="slide" transparent onRequestClose={fechar}>
        <View style={estilos.fundoJanela}>
          <View style={estilos.janela} accessibilityViewIsModal>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Subtitulo style={{ flex: 1 }}>{rotulo}</Subtitulo>
              <Pressable
                onPress={fechar}
                accessibilityRole="button"
                accessibilityLabel="Fechar a lista"
                hitSlop={8}
                style={estilos.fechar}>
                <Ionicons name="close" size={28} color={cores.primaria} />
              </Pressable>
            </View>
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Digite para procurar"
              placeholderTextColor={cores.textoSuave}
              accessibilityLabel="Procurar na lista"
              autoCorrect={false}
              style={[estilos.campo, { fontSize: 18 * escala, borderColor: cores.borda }]}
            />
            <FlatList
              data={visiveis}
              keyExtractor={(o) => o}
              keyboardShouldPersistTaps="handled"
              accessibilityRole="radiogroup"
              contentContainerStyle={{ gap: espaco.p, paddingBottom: espaco.m }}
              ListEmptyComponent={<Texto cor={cores.textoSuave}>Nenhuma opção com esse nome. Apague e tente de novo.</Texto>}
              renderItem={({ item }) => {
                const marcado = item === valor;
                return (
                  <Pressable
                    onPress={() => escolher(item)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: marcado }}
                    accessibilityLabel={item}
                    style={[estilos.opcao, marcado && estilos.opcaoMarcada]}>
                    <Ionicons name={marcado ? 'radio-button-on' : 'radio-button-off'} size={24} color={cores.primaria} />
                    <Texto peso={marcado ? 'forte' : 'normal'} style={{ flex: 1 }}>
                      {item}
                    </Texto>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export function SeloNivel({ nivel }: { nivel: NivelRisco }) {
  const a = aparenciaNivel[nivel];
  return (
    <View style={[estilos.selo, { backgroundColor: a.fundo }]}>
      <Ionicons name={a.icone} size={18} color={a.texto} />
      <Texto tam={16} peso="forte" cor={a.texto}>
        {a.rotulo}
      </Texto>
    </View>
  );
}

export function Aviso({ icone, texto }: { icone: NomeIcone; texto: string }) {
  return (
    <View style={estilos.aviso} accessibilityRole="text">
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <Texto tam={16} style={{ flex: 1 }}>
        {texto}
      </Texto>
    </View>
  );
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <View style={estilos.centro} accessibilityRole="progressbar" accessibilityLabel={texto}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Texto cor={cores.textoSuave}>{texto}</Texto>
    </View>
  );
}

export function Linha({ icone, children }: { icone: NomeIcone; children: ReactNode }) {
  return (
    <View style={estilos.linha}>
      <Ionicons name={icone} size={22} color={cores.primaria} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export const estilos = StyleSheet.create({
  tela: { padding: espaco.m, gap: espaco.m, paddingBottom: espaco.g * 2, width: '100%', maxWidth: 640, alignSelf: 'center' },
  cartao: { backgroundColor: cores.cartao, borderRadius: 16, padding: espaco.m, gap: 12, borderWidth: 1, borderColor: cores.borda },
  botao: {
    minHeight: TOQUE_MINIMO,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: espaco.m,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  campo: {
    minHeight: TOQUE_MINIMO,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: cores.cartao,
    color: cores.texto,
  },
  selecao: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fundoJanela: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  janela: {
    maxHeight: '85%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    backgroundColor: cores.fundo,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: espaco.m,
    gap: 12,
  },
  fechar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  opcoesLinha: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.p },
  opcao: {
    minHeight: TOQUE_MINIMO,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
  },
  opcaoMarcada: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  selo: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  aviso: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: cores.primariaClara, borderRadius: 12, padding: 12 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: espaco.g, backgroundColor: cores.fundo },
  linha: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
});
