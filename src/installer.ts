import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import os from 'os'
import path from 'path'

type InstallationType = 'dist' | 'manifest'

export interface IGitChglogVersionInfo {
  type: InstallationType
  downloadUrl: string
  resolvedVersion: string
  fileName: string
}

export async function getGitChglog(versionSpec: string, stable: boolean, auth: string | undefined): Promise<string> {
  // check cache
  const toolPath = tc.find('git-chglog', versionSpec)
  // If not found in cache, download
  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`)
    return toolPath
  }
  core.info(`Attempting to download ${versionSpec}...`)
  let downloadPath = ''
  let info: IGitChglogVersionInfo | null = null

  //
  // Try download from internal distribution (popular versions only)
  //
  try {
    info = await getInfoFromManifest(versionSpec, stable, auth)
    if (info) {
      downloadPath = await installGitChglogVersion(info, auth)
    } else {
      core.info('Not found in manifest.  Falling back to download directly from git-chglog')
    }
  } catch (err) {
    if (err instanceof tc.HTTPError && (err.httpStatusCode === 403 || err.httpStatusCode === 429)) {
      core.info(
        `Received HTTP status code ${err.httpStatusCode}.  This usually indicates the rate limit has been exceeded`
      )
    } else {
      core.info(err.message)
    }
    core.debug(err.stack)
  }

  return downloadPath
}

export async function getInfoFromManifest(
  versionSpec: string,
  stable: boolean,
  auth: string | undefined
): Promise<IGitChglogVersionInfo | null> {
  core.info(`matching ${versionSpec}...`)

  let info: IGitChglogVersionInfo | null = null
  core.debug(`tc.getManifestFromRepo auth: ${auth}`)
  const releases = await tc.getManifestFromRepo('git-chglog', 'git-chglog', auth, 'master')
  core.debug(`tc.getManifestFromRepo: ${releases}`)
  const rel = await tc.findFromManifest(versionSpec, stable, releases)
  core.debug(`tc.findFromManifest: ${rel}`)

  if (rel && rel.files.length > 0) {
    info = {} as IGitChglogVersionInfo
    info.type = 'manifest'
    info.resolvedVersion = rel.version
    info.downloadUrl = rel.files[0].download_url
    info.fileName = rel.files[0].filename
  }

  return info
}

async function installGitChglogVersion(info: IGitChglogVersionInfo, auth: string | undefined): Promise<string> {
  core.info(`Acquiring ${info.resolvedVersion} from ${info.downloadUrl}`)
  const downloadPath = await tc.downloadTool(info.downloadUrl, undefined, auth)

  core.info('Extracting git-chglog...')
  let extPath = await extractGitChglogArchive(downloadPath)
  core.info(`Successfully extracted git-chglog to ${extPath}`)
  if (info.type === 'dist') {
    extPath = path.join(extPath, 'git-chglog')
  }

  core.info('Adding to the cache ...')
  const cachedDir = await tc.cacheDir(extPath, 'git-chglog', info.resolvedVersion)
  core.info(`Successfully cached git-chglog to ${cachedDir}`)
  return cachedDir
}

export async function extractGitChglogArchive(archivePath: string): Promise<string> {
  const platform = os.platform()
  let extPath: string

  if (platform === 'win32') {
    extPath = await tc.extractZip(archivePath)
  } else {
    extPath = await tc.extractTar(archivePath)
  }

  return extPath
}
