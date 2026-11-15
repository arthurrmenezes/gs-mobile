import type { SQLiteDatabase } from 'expo-sqlite';

import type { Alerta, Perfil, Registro, Situacao } from '../tipos';

export const NOME_BANCO = 'luzvital.db';

export async function prepararBanco(db: SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const versao = linha?.user_version ?? 0;

  if (versao < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS perfil (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        nome TEXT NOT NULL,
        bairro TEXT NOT NULL,
        dependencia TEXT NOT NULL,
        autonomia_horas INTEGER NOT NULL,
        contato_nome TEXT NOT NULL DEFAULT '',
        contato_telefone TEXT NOT NULL DEFAULT '',
        atualizado_em TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS preferencias (
        chave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS preparo (
        item_id TEXT PRIMARY KEY,
        feito INTEGER NOT NULL DEFAULT 0,
        atualizado_em TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        situacao TEXT NOT NULL,
        observacao TEXT,
        criado_em TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS alertas_cache (
        id INTEGER PRIMARY KEY,
        data TEXT NOT NULL,
        nivel TEXT NOT NULL,
        bairro TEXT,
        mensagem TEXT NOT NULL,
        salvo_em TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS pontos_favoritos (
        ponto_id TEXT PRIMARY KEY
      );
      PRAGMA user_version = 1;
    `);
  }
}

type LinhaPerfil = {
  nome: string;
  bairro: string;
  dependencia: string;
  autonomia_horas: number;
  contato_nome: string;
  contato_telefone: string;
};

export async function lerPerfil(db: SQLiteDatabase): Promise<Perfil | null> {
  const l = await db.getFirstAsync<LinhaPerfil>('SELECT * FROM perfil WHERE id = 1');
  if (!l) return null;
  return {
    nome: l.nome,
    bairro: l.bairro,
    dependencia: l.dependencia as Perfil['dependencia'],
    autonomiaHoras: l.autonomia_horas,
    contatoNome: l.contato_nome,
    contatoTelefone: l.contato_telefone,
  };
}

export async function salvarPerfil(db: SQLiteDatabase, p: Perfil): Promise<void> {
  await db.runAsync(
    `INSERT INTO perfil (id, nome, bairro, dependencia, autonomia_horas, contato_nome, contato_telefone, atualizado_em)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nome = excluded.nome, bairro = excluded.bairro,
       dependencia = excluded.dependencia, autonomia_horas = excluded.autonomia_horas,
       contato_nome = excluded.contato_nome, contato_telefone = excluded.contato_telefone,
       atualizado_em = excluded.atualizado_em`,
    [p.nome, p.bairro, p.dependencia, p.autonomiaHoras, p.contatoNome, p.contatoTelefone, new Date().toISOString()],
  );
}

export async function lerPreferencia(db: SQLiteDatabase, chave: string): Promise<string | null> {
  const l = await db.getFirstAsync<{ valor: string }>('SELECT valor FROM preferencias WHERE chave = ?', [chave]);
  return l?.valor ?? null;
}

export async function salvarPreferencia(db: SQLiteDatabase, chave: string, valor: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO preferencias (chave, valor) VALUES (?, ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor',
    [chave, valor],
  );
}

export async function lerPreparoFeito(db: SQLiteDatabase): Promise<Set<string>> {
  const linhas = await db.getAllAsync<{ item_id: string }>('SELECT item_id FROM preparo WHERE feito = 1');
  return new Set(linhas.map((l) => l.item_id));
}

export async function marcarPreparo(db: SQLiteDatabase, itemId: string, feito: boolean): Promise<void> {
  await db.runAsync(
    `INSERT INTO preparo (item_id, feito, atualizado_em) VALUES (?, ?, ?)
     ON CONFLICT(item_id) DO UPDATE SET feito = excluded.feito, atualizado_em = excluded.atualizado_em`,
    [itemId, feito ? 1 : 0, new Date().toISOString()],
  );
}

export async function limparPreparo(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM preparo');
}

export async function criarRegistro(db: SQLiteDatabase, situacao: Situacao, observacao: string | null): Promise<void> {
  await db.runAsync('INSERT INTO registros (situacao, observacao, criado_em) VALUES (?, ?, ?)', [
    situacao,
    observacao,
    new Date().toISOString(),
  ]);
}

export async function listarRegistros(db: SQLiteDatabase, limite = 20): Promise<Registro[]> {
  const linhas = await db.getAllAsync<{ id: number; situacao: string; observacao: string | null; criado_em: string }>(
    'SELECT * FROM registros ORDER BY id DESC LIMIT ?',
    [limite],
  );
  return linhas.map((l) => ({ id: l.id, situacao: l.situacao as Situacao, observacao: l.observacao, criadoEm: l.criado_em }));
}

export async function guardarAlertas(db: SQLiteDatabase, alertas: Alerta[], salvoEm: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM alertas_cache');
    for (const a of alertas) {
      await db.runAsync('INSERT INTO alertas_cache (id, data, nivel, bairro, mensagem, salvo_em) VALUES (?, ?, ?, ?, ?, ?)', [
        a.id,
        a.data,
        a.nivel,
        a.bairro,
        a.mensagem,
        salvoEm,
      ]);
    }
    await db.runAsync(
      "INSERT INTO preferencias (chave, valor) VALUES ('alertas_salvos_em', ?) ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor",
      [salvoEm],
    );
  });
}

export async function lerAlertasGuardados(db: SQLiteDatabase): Promise<{ alertas: Alerta[]; salvoEm: string | null }> {
  const linhas = await db.getAllAsync<{ id: number; data: string; nivel: string; bairro: string | null; mensagem: string }>(
    'SELECT * FROM alertas_cache ORDER BY data',
  );
  const salvoEm = await lerPreferencia(db, 'alertas_salvos_em');
  return {
    alertas: linhas.map((l) => ({ id: l.id, data: l.data, nivel: l.nivel as Alerta['nivel'], bairro: l.bairro, mensagem: l.mensagem, ativo: true })),
    salvoEm,
  };
}

export async function lerFavoritos(db: SQLiteDatabase): Promise<Set<string>> {
  const linhas = await db.getAllAsync<{ ponto_id: string }>('SELECT ponto_id FROM pontos_favoritos');
  return new Set(linhas.map((l) => l.ponto_id));
}

export async function alternarFavorito(db: SQLiteDatabase, pontoId: string, favorito: boolean): Promise<void> {
  if (favorito) await db.runAsync('INSERT OR IGNORE INTO pontos_favoritos (ponto_id) VALUES (?)', [pontoId]);
  else await db.runAsync('DELETE FROM pontos_favoritos WHERE ponto_id = ?', [pontoId]);
}

export async function apagarTudo(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    DELETE FROM perfil;
    DELETE FROM preferencias;
    DELETE FROM preparo;
    DELETE FROM registros;
    DELETE FROM alertas_cache;
    DELETE FROM pontos_favoritos;
  `);
}
