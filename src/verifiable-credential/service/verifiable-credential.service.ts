import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
<<<<<<< HEAD
import { ConfigService } from '@nestjs/config'
=======
>>>>>>> develop
import { AxiosRequestConfig } from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
<<<<<<< HEAD
import { FileAccessControlErrors, VerifiableCredentialErrors } from 'src/common/constants/error-messages'
import { RequestRoutes } from 'src/common/constants/request-routes'
=======
>>>>>>> develop
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateFileDto } from 'src/files/dto/create-file.dto'
import { FilesService } from 'src/files/service/files.service'
import { CredentialApiDto, IssueCredentialApiRequestDto } from '../dto/issue-credential-api-body.dto'
import { IssueCredentialRequestDto } from '../dto/issue-credential-request.dto'

@Injectable()
export class VerifiableCredentialService {
<<<<<<< HEAD
  constructor(
    private readonly apiClient: ApiClient,
    private readonly fileService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  async issueCredential(issueRequest: IssueCredentialRequestDto): Promise<StandardMessageResponse | any> {
=======
  constructor(private readonly apiClient: ApiClient, private readonly fileService: FilesService) {}

  async issueCredential(issueRequest: IssueCredentialRequestDto): Promise<StandardMessageResponse> {
>>>>>>> develop
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
<<<<<<< HEAD
    const vcResult = await this.apiClient.post(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + RequestRoutes.ISSUE_CREDENTIAL,
      requestBody,
    )
    const vcId = vcResult['credential']['id']
=======
    const vcResult = await this.apiClient.post(process.env.SUNBIRD_VC_SERVICE_URL + '/credentials/issue', requestBody)
    console.log(vcResult)
    const vcId = vcResult['credential']['id']
    console.log(vcId)
>>>>>>> develop
    if (vcId !== null) {
      // Create a file for the receiver and push it in the receiver's wallet
      const documentPath = await this.getVcVisualDocumentAsPath(
        vcId,
        'application/pdf',
        issueRequest.credential.templateId,
      )
<<<<<<< HEAD
=======
      console.log('docPath', documentPath)
>>>>>>> develop
      const savedFileContent = fs.readFileSync(documentPath)
      const file = {
        fieldname: 'file',
        filename: `${vcId}.pdf`,
        encoding: 'binary',
        mimetype: 'application/pdf',
        buffer: savedFileContent,
        path: documentPath,
      }
<<<<<<< HEAD
=======
      console.log(file.filename)
      console.log('credentialObject', vcResult['credential'])
>>>>>>> develop
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

<<<<<<< HEAD
    return vcResult
=======
    return {
      data: vcResult,
    }
>>>>>>> develop
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
<<<<<<< HEAD
    const visualResult = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )
=======
    const visualResult = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)
>>>>>>> develop

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    // Ensure directory existence
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true }) // Create directory recursively
    }

    // Save the file
<<<<<<< HEAD
    // The output file format is pdf
=======
>>>>>>> develop
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })
<<<<<<< HEAD
=======

    console.log(`File ${fileName} saved successfully at ${fullPath}.`)

>>>>>>> develop
    return fullPath
  }

  async getVcVisualDocument(vcId: string, outputType: string, vcTemplateId: string, res) {
    if (outputType == null || vcTemplateId == null) {
<<<<<<< HEAD
      throw new Error(VerifiableCredentialErrors.BAD_REQUEST)
=======
      throw new Error('Please enter accept format and templateId in header')
>>>>>>> develop
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
<<<<<<< HEAD
    const visualResult = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )
=======
    const visualResult = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)
>>>>>>> develop

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    // Save the file
<<<<<<< HEAD
    // The output file format is pdf
=======
>>>>>>> develop
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })

<<<<<<< HEAD
=======
    console.log(`File ${fileName} saved successfully at ${fullPath}.`)

>>>>>>> develop
    if (fs.existsSync(fullPath)) {
      res.set('Content-Type', outputType)
      res.download(fullPath, fileName)
      // Clear the file!
      setTimeout(function () {
        fs.unlinkSync(fullPath)
      }, 3000)
    } else {
<<<<<<< HEAD
      res.status(404).send(VerifiableCredentialErrors.CREDENTIAL_NOT_FOUND)
    }
  }

  async verifyCredential(vcId: string): Promise<StandardMessageResponse | any> {
=======
      res.status(404).send('File not found')
    }
  }

  async verifyCredential(vcId: string): Promise<StandardMessageResponse> {
>>>>>>> develop
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
<<<<<<< HEAD
    const vcDetails = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') +
        `${RequestRoutes.CREDENTIAL}/${vcId}${RequestRoutes.VERIFY_CREDENTIAL}`,
=======
    console.log(vcId)
    const vcDetails = await this.apiClient.get(
      process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}/verify`,
>>>>>>> develop
      config,
    )

    if (vcDetails == null) {
<<<<<<< HEAD
      throw new NotFoundException(VerifiableCredentialErrors.CREDENTIAL_NOT_FOUND)
=======
      throw new NotFoundException('Credential not found')
>>>>>>> develop
    }

    if (vcDetails['status'] == 'ISSUED') {
      return {
        data: vcDetails,
      }
    } else {
<<<<<<< HEAD
      throw new UnauthorizedException(VerifiableCredentialErrors.INVALID_CREDENTIAL)
    }
  }

  async getVcDetailsById(vcId: string): Promise<StandardMessageResponse | any> {
=======
      throw new UnauthorizedException('Credential is not valid.')
    }
  }

  async getVcDetailsById(vcId: string): Promise<StandardMessageResponse> {
>>>>>>> develop
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
<<<<<<< HEAD
    const vcDetails = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )
    if (vcDetails == null) {
      throw new NotFoundException(FileAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return vcDetails
=======
    const vcDetails = await this.apiClient.get(process.env.SUNBIRD_VC_SERVICE_URL + `/credentials/${vcId}`, config)
    if (vcDetails == null) {
      throw new NotFoundException(
        'Cannot find Details about this credential, please check the credential Id or the request headers.',
      )
    }

    return {
      data: vcDetails,
    }
>>>>>>> develop
  }
}
