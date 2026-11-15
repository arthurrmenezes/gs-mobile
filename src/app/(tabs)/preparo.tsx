import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Botao, Carregando, Cartao, Tela, Texto, estilos } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { itensPara, rotuloDependencia } from '../../dados/dominio';
import { lerPreparoFeito, limparPreparo, marcarPreparo } from '../../db/banco';
import { cores } from '../../tema';

export default function Preparo() {
  const db = useSQLiteContext();
  const { perfil } = useApp();
  const [feitos, setFeitos] = useState<Set<string> | null>(null);

  useFocusEffect(
    useCallback(() => {
      lerPreparoFeito(db).then(setFeitos);
    }, [db]),
  );

  if (!perfil || !feitos) return <Carregando />;

  const itens = itensPara(perfil.dependencia);
  const prontos = itens.filter((i) => feitos.has(i.id)).length;
  const tudoPronto = prontos === itens.length;

  async function alternar(id: string) {
    const marcar = !feitos!.has(id);
    await marcarPreparo(db, id, marcar);
    const novo = new Set(feitos);
    if (marcar) novo.add(id);
    else novo.delete(id);
    setFeitos(novo);
  }

  async function recomecar() {
    await limparPreparo(db);
    setFeitos(new Set());
  }

  return (
    <Tela>
      <Texto cor={cores.textoSuave}>Lista para quem depende de: {rotuloDependencia(perfil.dependencia).toLowerCase()}</Texto>

      <Cartao style={{ backgroundColor: tudoPronto ? cores.okClaro : cores.cartao }}>
        <Texto tam={20} peso="forte" accessibilityLiveRegion="polite">
          {tudoPronto ? 'Tudo pronto!' : `${prontos} de ${itens.length} itens prontos`}
        </Texto>
        <View
          style={{ height: 12, borderRadius: 6, backgroundColor: cores.borda, overflow: 'hidden' }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <View style={{ height: 12, width: `${(prontos / itens.length) * 100}%`, backgroundColor: cores.ok }} />
        </View>
      </Cartao>

      {itens.map((item) => {
        const feito = feitos.has(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => alternar(item.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: feito }}
            accessibilityLabel={item.texto}
            style={[estilos.opcao, feito && estilos.opcaoMarcada]}>
            <Ionicons name={feito ? 'checkbox' : 'square-outline'} size={30} color={cores.primaria} />
            <Texto style={{ flex: 1 }} peso={feito ? 'forte' : 'normal'}>
              {item.texto}
            </Texto>
          </Pressable>
        );
      })}

      {prontos > 0 ? <Botao titulo="Desmarcar tudo e recomeçar" icone="refresh" tipo="secundario" onPress={recomecar} /> : null}
    </Tela>
  );
}
