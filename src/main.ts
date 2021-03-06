import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as installer from './installer'

export async function run(): Promise<void> {
  try {
    //
    // versionSpec is optional.  If supplied, install / use from the tool cache
    // If not supplied then problem matchers will still be setup.  Useful for self-hosted.
    //
    let versionSpec = core.getInput('git-chglog-version')
    if (!versionSpec) {
      versionSpec = '0.15.0'
    }

    const installDir = await installer.installGitChglogVersion(versionSpec)

    core.addPath(installDir)
    core.info('Added git-chglog to the path')

    await exec.exec('git-chglog --version')

    core.info(`Successfully setup git-chglog version ${versionSpec}`)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
