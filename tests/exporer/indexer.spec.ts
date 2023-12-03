import { doesDatabaseExist, getDbPath, getFunctionsFromDb, initializeDatabase, storeFunctionInDatabase } from '../../src/explorer/indexer'
import fs from 'fs'

describe('test indexer', () => {
  it.skip('should correctly create DB, verify DB and insert & select records', async () => {
    cleanupDB()

    const tsConfigFilePath = 'testproject.tsconfig.json'
    let exists = doesDatabaseExist(tsConfigFilePath)
    expect(exists).toBeFalsy()

    await initializeDatabase(tsConfigFilePath)

    exists = doesDatabaseExist(tsConfigFilePath)
    expect(exists).toBeTruthy()

    const functionDetail = {
      name: 'asd',
      parameters: [{ name: 'asd', type: 'string' }, { name: 'dzhe', type: 'string' }],
      paramString: '(asd, dzhe)',
      fileLine: 12,
      fileName: 'asd',
      returnType: 'void'
    }
    await storeFunctionInDatabase(tsConfigFilePath, '12345', functionDetail)
    const rows = await getFunctionsFromDb(tsConfigFilePath, '12345')
    expect(rows.length).toEqual(1)
    expect(JSON.stringify(rows[0])).toEqual(JSON.stringify(functionDetail))

    cleanupDB()
  })
})

function cleanupDB (): void {
  const tsConfigFilePath = 'testproject.tsconfig.json'
  const dbPath = getDbPath(tsConfigFilePath)
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
}
