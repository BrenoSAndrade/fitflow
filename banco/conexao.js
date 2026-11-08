import * as SQLite from 'expo-sqlite';

let conexao;

async function prepararBanco() {
  const banco = await SQLite.openDatabaseAsync('fitflow.db');
  await banco.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      perfil TEXT NOT NULL CHECK (perfil IN ('aluno', 'funcionario'))
    );

    CREATE TABLE IF NOT EXISTS aulas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      instrutor TEXT NOT NULL,
      data TEXT NOT NULL,
      horario TEXT NOT NULL,
      capacidade INTEGER NOT NULL CHECK (capacidade > 0)
    );

    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aula_id INTEGER NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
      aluno TEXT NOT NULL,
      UNIQUE (aula_id, aluno)
    );

    CREATE TABLE IF NOT EXISTS treinos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aluno TEXT NOT NULL,
      inicio TEXT NOT NULL,
      fim TEXT NOT NULL,
      data TEXT NOT NULL,
      duracao_segundos INTEGER NOT NULL CHECK (duracao_segundos > 0),
      exercicios TEXT NOT NULL,
      UNIQUE (aluno, inicio)
    );

    CREATE TABLE IF NOT EXISTS treinos_em_andamento (
      aluno TEXT PRIMARY KEY NOT NULL,
      inicio TEXT NOT NULL,
      exercicios TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS treinos_aluno_data ON treinos (aluno, data);
  `);
  return banco;
}

export function abrirBanco() {
  if (!conexao) {
    conexao = prepararBanco().catch((erro) => {
      conexao = null;
      throw erro;
    });
  }
  return conexao;
}
