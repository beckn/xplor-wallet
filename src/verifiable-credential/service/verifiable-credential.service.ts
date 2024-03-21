import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { AxiosRequestConfig } from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateFileDto } from 'src/files/dto/create-file.dto'
import { FilesService } from 'src/files/service/files.service'
import { CredentialApiDto, IssueCredentialApiRequestDto } from '../dto/issue-credential-api-body.dto'
import { IssueCredentialRequestDto } from '../dto/issue-credential-request.dto'

@Injectable()
export class VerifiableCredentialService {
  constructor(private readonly apiClient: ApiClient, private readonly fileService: FilesService) {}

  async issueCredential(issueRequest: IssueCredentialRequestDto): Promise<StandardMessageResponse> {
    const requestBody = await new IssueCredentialApiRequestDto(
      new CredentialApiDto(
        issueRequest.credential.context,
        issueRequest.credential.type,
        issueRequest.issuerId,
        new Date().toISOString(),
        issueRequest.credential.expirationDate,
        issueRequest.credential.credentialSubject,
      ),
      issueRequest.credential.schemaId,
      issueRequest.credential.schemaVersion,
      issueRequest.credential.tags,
      issueRequest.credential.organization,
    )
    const vcResult = await this.apiClient.post(process.env.SUNBIRD_VC_SERVICE_URL + '/credentials/issue', requestBody)
    console.log(vcResult)
    const vcId = vcResult['credential']['id']
    console.log(vcId)
    if (vcId !== null) {
      // Create a file for the receiver and push it in the receiver's wallet
      const documentPath = await this.getVcVisualDocumentAsPath(
        vcId,
        'application/pdf',
        issueRequest.credential.templateId,
      )
      console.log('docPath', documentPath)
      const savedFileContent = fs.readFileSync(documentPath)
      const file = {
        fieldname: 'file',
        filename: `${vcId}.pdf`,
        encoding: 'binary',
        mimetype: 'application/pdf',
        buffer: savedFileContent,
        path: documentPath,
      }
      console.log(file.filename)
      console.log('credentialObject', vcResult['credential'])
      const createFileRequest = new CreateFileDto(
        issueRequest.credentialReceiver.userId,
        issueRequest.credentialReceiver.documentType,
        issueRequest.credential.tags,
        issueRequest.credentialReceiver.documentName,
        ' ',
        ' ',
        false,
        vcResult['credential'],
      )
      this.fileService.createFile(file, createFileRequest)
    }

    return {
      data: vcResult,
    }
  }

  async getVcVisualDocumentAsPath(vcId: string, outputType: string, vcTemplateId: string) {
    const headers = {
      Accept: outputType,
      templateId: vcTemplateId,
    }
    const config: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: headers,
    }
    const visualResult = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    // Ensure directory existence
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true }) // Create directory recursively
    }

    // Save the file
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })

    console.log(`File ${fileName} saved successfully at ${fullPath}.`)

    return fullPath
  }

  async getVcVisualDocument(vcId: string, outputType: string, vcTemplateId: string, res) {
    if (outputType == null || vcTemplateId == null) {
      throw new Error('Please enter accept format and templateId in header')
    }

    const headers = {
      Accept: outputType,
      templateId: vcTemplateId,
      'Content-Type': outputType,
    }
    const config: AxiosRequestConfig = {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: headers,
    }
    const visualResult = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    // Save the file
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })

    console.log(`File ${fileName} saved successfully at ${fullPath}.`)

    if (fs.existsSync(fullPath)) {
      res.set('Content-Type', outputType)
      res.download(fullPath, fileName)
      // Clear the file!
      setTimeout(function () {
        fs.unlinkSync(fullPath)
      }, 3000)
    } else {
      res.status(404).send('File not found')
    }
  }

  async verifyCredential(vcId: string): Promise<StandardMessageResponse> {
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
    console.log(vcId)
    const vcDetails = await this.apiClient.get(
      process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}/verify`,
      config,
    )

    if (vcDetails == null) {
      throw new NotFoundException('Credential not found')
    }

    if (vcDetails['status'] == 'ISSUED') {
      return {
        data: vcDetails,
      }
    } else {
      throw new UnauthorizedException('Credential is not valid.')
    }
  }

  async getVcDetailsById(vcId: string): Promise<StandardMessageResponse> {
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
    const vcDetails = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)
    if (vcDetails == null) {
      throw new NotFoundException(
        'Cannot find Details about this credential, please check the credential Id or the request headers.',
      )
    }

    return {
      data: vcDetails,
    }
  }
}
