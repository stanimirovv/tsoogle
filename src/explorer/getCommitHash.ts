import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCallback)

export async function getCommitHash (): Promise<string> {
  try {
    const { stdout } = await exec('git rev-parse HEAD')
    return stdout.trim()
  } catch (e) {
    return 'unknown'
  }
}
