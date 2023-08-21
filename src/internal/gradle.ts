import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as exec from '@actions/exec'

/**
 * Runs `./gradlew --stop` if `gradlew` can be found in order to stop any extransous daemon processes still running.
 */
export async function stop(): Promise<void> {
  core.info('Stopping any extraneous Gradle deamons')
  const globber = await glob.create('**/gradlew')
  const gradlews: string[] = await globber.glob()
  for (const gradlew of gradlews) {
    await exec.exec(gradlew, [`--stop`])
    break
  }
}
