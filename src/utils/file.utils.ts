import { AxiosRequestConfig } from 'axios'
import { createHash } from 'crypto'
import { addYears, formatISO } from 'date-fns'
import { promises as fsPromises } from 'fs'
import * as path from 'path'
import { ApiClient } from '../common/api-client'
import { ErrorCodes } from '../common/constants/error-codes'
import { FilesErrors } from '../common/constants/error-messages'
import { FILE_LOCAL_CONFIG, FileMimeType } from '../common/constants/file'
import { GrafanaLoggerService } from '../grafana/service/grafana.service'

export function getCurrentTimeStamp(): number {
  return Date.now()
}

export function generateVCExpirationDate(years: number) {
  const currentDate = new Date()
  const futureDate = addYears(currentDate, years)
  const formattedFutureDate = formatISO(futureDate)
  return formattedFutureDate
}

export function generateUrlUUID(): string {
  // Generate a random string
  const randomString = Math.random().toString(36).substring(2) + Date.now().toString(36)

  // Hash the random string using SHA-256
  const hash = createHash('sha256')
  hash.update(randomString)
  const encryptedUUID = hash.digest('hex')

  return encryptedUUID
}

export async function renderFileToResponse(res, fileUrl: string, restrictionKey: string): Promise<any | boolean> {
  try {
    const apiClient = new ApiClient()
    const headers = {
      Accept: FileMimeType.ALL,
    }
    const config: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: headers,
    }

    const fileDirectory = FILE_LOCAL_CONFIG.STORE_PATH
    const filePath = path.join(__dirname, '..', fileDirectory)
    const visualResult = await apiClient.get(fileUrl, config)

    const fileResponse = await apiClient.get(fileUrl, {
      responseType: 'stream',
    })

    const contentType = fileResponse.headers['content-type']
    const fileExtension = contentType.split('/').pop()
    await fsPromises
      .access(filePath)
      .then(async (_) => {
        await fsPromises.mkdir(filePath, { recursive: true }) // Create directory recursively
      })
      .catch(async (err) => {
        await fsPromises.mkdir(filePath, { recursive: true })
      })

    // Save the file
    const fileName = `${restrictionKey}.${fileExtension}`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    await fsPromises.writeFile(fullPath, visualResult, { encoding: 'binary' })
    if (await fsPromises.stat(fullPath)) {
      res.set('Content-Type', `${FileMimeType.APPLICATION}${fileExtension}`)
      res.download(fullPath, fileName)
      // Clear the file!
      setTimeout(async function () {
        if (await fsPromises.stat(fullPath)) {
          await fsPromises.unlink(fullPath).catch((err) =>
            new GrafanaLoggerService().sendDebug({
              message: err,
              methodName: this.renderFileToResponse.name,
            }),
          )
        }
      }, 2000)
      return true
    } else {
      res.status(ErrorCodes.RESOURCE_NOT_FOUND).send(FilesErrors.INTERNAL_ERROR)
      return false
    }
  } catch (err) {
    return false
  }
}
