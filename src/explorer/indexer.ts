import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import { type FunctionDetail } from '../evaluator'

const TABLE_DEFFINITION = 'CREATE TABLE functions (id INTEGER PRIMARY KEY, commitId TEXT, payload TEXT);CREATE INDEX idx_functions_commitId ON functions(commitId);'

export async function initializeDatabase (tsconfigFilePath: string): Promise<void> {
  const dbPath = getDbPath(tsconfigFilePath)

  const dbExists = fs.existsSync(dbPath)
  if (dbExists) {
    return
  }

  const db = getDbConnection(tsconfigFilePath)
  await new Promise((resolve, reject) => {
    db.exec(TABLE_DEFFINITION, (err: unknown) => {
      if (err !== null) {
        db.close((err: unknown) => {
          if (err !== null) {
            reject(err)
            return
          }
          resolve(true)
        })
        reject(err)
      }
    })

    db.close((err: unknown) => {
      if (err !== null) {
        reject(err)
      }
      resolve(true)
    })
  })
}

function getDbConnection (tsconfigFilePath: string): sqlite3.Database {
  const dbPath = getDbPath(tsconfigFilePath)
  return new sqlite3.Database(dbPath)
}

export function getDbPath (tsconfigFilePath: string): string {
  const tsConfigDir = path.dirname(tsconfigFilePath)
  return `${tsConfigDir}/tsoogle.db`
}

export function doesDatabaseExist (tsconfigFilePath: string): boolean {
  const tsConfigDir = path.dirname(tsconfigFilePath)
  const dbPath = `${tsConfigDir}/tsoogle.db`
  return fs.existsSync(dbPath)
}

export async function storeFunctionInDatabase (tsconfigFilePath: string, commitId: string, func: FunctionDetail): Promise<void> {
  const db = getDbConnection(tsconfigFilePath)
  db.run('INSERT INTO functions (commitId, payload) VALUES (?, ?)', [commitId, JSON.stringify(func)])
  await new Promise((resolve, reject) => {
    db.close((err: unknown) => {
      if (err !== null) {
        reject(err)
      }
      resolve(true)
    })
  })
}

export async function getFunctions (tsconfigFilePath: string, commitId: string): Promise<FunctionDetail[]> {
  const db = getDbConnection(tsconfigFilePath)
  const rows: FunctionDetail[] = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM functions WHERE commitId=?', [commitId], (err: unknown, rows: any) => {
      if (err !== null) {
        reject(err)
        return
      }
      resolve(rows)
    })
  })

  await new Promise((resolve, reject) => {
    db.close((err: unknown) => {
      if (err !== null) {
        reject(err)
      }
      resolve(true)
    })
  })

  return rows.map((row: any) => JSON.parse(row.payload))
}
