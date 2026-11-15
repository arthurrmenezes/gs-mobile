import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { Carregando, type NomeIcone } from '../../components/ui';
import { useApp } from '../../contexto/AppContexto';
import { cores } from '../../tema';

const icone = (nome: NomeIcone) =>
  function IconeDaAba({ focused, size }: { focused: boolean; size: number }) {
    return <Ionicons name={nome} size={size + 2} color={focused ? cores.primaria : cores.textoSuave} />;
  };

export default function LayoutAbas() {
  const { carregado, perfil, escala } = useApp();

  if (!carregado) return <Carregando />;
  if (!perfil) return <Redirect href="/boas-vindas" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primaria },
        headerTintColor: cores.branco,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarLabelStyle: { fontSize: 13 * escala, fontWeight: '600' },
        tabBarStyle: { height: 64 + 8 * escala, paddingTop: 6, paddingBottom: 8 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Início', headerTitle: 'Luz Vital', tabBarIcon: icone('home') }} />
      <Tabs.Screen name="pontos" options={{ title: 'Lugares', headerTitle: 'Lugares com energia', tabBarIcon: icone('location') }} />
      <Tabs.Screen name="preparo" options={{ title: 'Preparo', headerTitle: 'Minha lista de preparo', tabBarIcon: icone('checkbox') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', headerTitle: 'Meus dados', tabBarIcon: icone('person') }} />
    </Tabs>
  );
}
