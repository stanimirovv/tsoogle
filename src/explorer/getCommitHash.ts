import { exec as execCallback } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execCallback)

export async function getCommitHash (cwd: string): Promise<string> {
  try {
    // NOTE: bellow is unsafe
    const { stdout } = await exec(`cd ${cwd} && git rev-parse HEAD`)
    return stdout.trim()
  } catch (e) {
    return 'unknown'
  }
}
