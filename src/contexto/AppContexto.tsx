import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as banco from '../db/banco';
import type { Perfil } from '../tipos';

type Valor = {
  carregado: boolean;
  perfil: Perfil | null;
  salvarPerfil: (p: Perfil) => Promise<void>;
  letrasGrandes: boolean;
  definirLetrasGrandes: (v: boolean) => Promise<void>;
  escala: number;
  apagarTudo: () => Promise<void>;
};

const Contexto = createContext<Valor | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [carregado, setCarregado] = useState(false);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [letrasGrandes, setLetrasGrandes] = useState(false);

  useEffect(() => {
    (async () => {
      setPerfil(await banco.lerPerfil(db));
      setLetrasGrandes((await banco.lerPreferencia(db, 'letras_grandes')) === '1');
      setCarregado(true);
    })();
  }, [db]);

  const salvarPerfil = useCallback(
    async (p: Perfil) => {
      await banco.salvarPerfil(db, p);
      setPerfil(p);
    },
    [db],
  );

  const definirLetrasGrandes = useCallback(
    async (v: boolean) => {
      setLetrasGrandes(v);
      await banco.salvarPreferencia(db, 'letras_grandes', v ? '1' : '0');
    },
    [db],
  );

  const apagarTudo = useCallback(async () => {
    await banco.apagarTudo(db);
    setLetrasGrandes(false);
    setPerfil(null);
  }, [db]);

  const valor = useMemo(
    () => ({ carregado, perfil, salvarPerfil, letrasGrandes, definirLetrasGrandes, escala: letrasGrandes ? 1.25 : 1, apagarTudo }),
    [carregado, perfil, salvarPerfil, letrasGrandes, definirLetrasGrandes, apagarTudo],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp(): Valor {
  const v = useContext(Contexto);
  if (!v) throw new Error('useApp precisa estar dentro de AppProvider');
  return v;
}
