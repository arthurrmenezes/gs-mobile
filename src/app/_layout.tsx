import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '../contexto/AppContexto';
import { NOME_BANCO, prepararBanco } from '../db/banco';
import { cores } from '../tema';

export default function LayoutRaiz() {
  return (
    <SQLiteProvider databaseName={NOME_BANCO} onInit={prepararBanco}>
      <AppProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: cores.primaria },
            headerTintColor: cores.branco,
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitle: 'Voltar',
            contentStyle: { backgroundColor: cores.fundo },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="boas-vindas" options={{ headerShown: false }} />
          <Stack.Screen name="cadastro" options={{ title: 'Meu cadastro' }} />
          <Stack.Screen name="situacao" options={{ title: 'Como estou', presentation: 'modal' }} />
          <Stack.Screen name="alerta/[id]" options={{ title: 'Aviso' }} />
          <Stack.Screen name="ponto/[id]" options={{ title: 'Lugar com energia' }} />
        </Stack>
      </AppProvider>
    </SQLiteProvider>
  );
}
