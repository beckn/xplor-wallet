import { AxiosRequestConfig } from 'axios'
import { createHash } from 'crypto'
import { addYears, formatISO } from 'date-fns'
import * as fs from 'fs'
import { promises as fsPromises } from 'fs'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
import { ErrorCodes } from 'src/common/constants/error-codes'
import { FilesErrors } from 'src/common/constants/error-messages'
import { FILE_LOCAL_CONFIG, FileMimeType } from 'src/common/constants/file-constants'

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

export async function renderFileToResponse(res, fileUrl: string, restrictionKey: string) {
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
  if (fs.existsSync(fullPath)) {
    res.set('Content-Type', `${FileMimeType.APPLICATION}${fileExtension}`)
    res.download(fullPath, fileName)
    // Clear the file!
    setTimeout(async function () {
      if (fs.existsSync(fullPath)) {
        await fsPromises.unlink(fullPath).catch((err) => console.error(err))
      }
    }, 3000)
  } else {
    res.status(ErrorCodes.RESOURCE_NOT_FOUND).send(FilesErrors.INTERNAL_ERROR)
  }
}
