import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

export async function installGitChglogVersion(
  versionSpec: string
): Promise<string> {
  const downloadUrl = `https://github.com/git-chglog/git-chglog/releases/download/v${versionSpec}/git-chglog_${versionSpec}_linux_amd64.tar.gz`
  core.info(`Acquiring ${versionSpec} from ${downloadUrl}`)
  const downloadPath = await tc.downloadTool(downloadUrl)

  core.info('Extracting git-chglog...')
  const extPath = await tc.extractTar(downloadPath)
  core.info(`Successfully extracted git-chglog to ${extPath}`)

  core.info('Adding to the cache ...')
  const cachedDir = await tc.cacheDir(extPath, 'git-chglog', versionSpec)
  core.info(`Successfully cached git-chglog to ${cachedDir}`)
  return cachedDir
}
