import * as core from '@actions/core'
import {info} from '@actions/core'
import * as tc from '@actions/tool-cache'
import path from 'path'

type InstallationType = 'dist' | 'manifest'

export interface IGitChglogVersionInfo {
  type: InstallationType
  downloadUrl: string
  resolvedVersion: string
  fileName: string
}

export async function getGitChglog(versionSpec: string): Promise<string> {
  return await installGitChglogVersion(versionSpec)
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

async function installGitChglogVersion(versionSpec: string): Promise<string> {
  const downloadUrl =
    'https://github.com/git-chglog/git-chglog/releases/download/v0.15.0/git-chglog_0.15.0_linux_amd64.tar.gz'
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
