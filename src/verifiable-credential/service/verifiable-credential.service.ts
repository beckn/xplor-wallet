import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AxiosRequestConfig } from 'axios'
import * as fs from 'fs'
import * as path from 'path'
import { ApiClient } from 'src/common/api-client'
import { FileAccessControlErrors, VerifiableCredentialErrors } from 'src/common/constants/error-messages'
import { RequestRoutes } from 'src/common/constants/request-routes'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateFileDto } from 'src/files/dto/create-file.dto'
import { FilesService } from 'src/files/service/files.service'
import { CredentialApiDto, IssueCredentialApiRequestDto } from '../dto/issue-credential-api-body.dto'
import { IssueCredentialRequestDto } from '../dto/issue-credential-request.dto'

@Injectable()
export class VerifiableCredentialService {
  constructor(
    private readonly apiClient: ApiClient,
    private readonly fileService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Issue a VC to the user and push to user's wallet
   */
  async issueCredential(issueRequest: IssueCredentialRequestDto): Promise<StandardMessageResponse | any> {
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
    const vcResult = await this.apiClient.post(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + RequestRoutes.ISSUE_CREDENTIAL,
      requestBody,
    )
    const vcId = vcResult['credential']['id']
    if (vcId !== null) {
      // Create a file for the receiver and push it in the receiver's wallet
      const documentPath = await this.getVcVisualDocumentAsPath(
        vcId,
        'application/pdf',
        issueRequest.credential.templateId,
      )
      const savedFileContent = fs.readFileSync(documentPath)
      const file = {
        fieldname: 'file',
        filename: `${vcId}.pdf`,
        encoding: 'binary',
        mimetype: 'application/pdf',
        buffer: savedFileContent,
        path: documentPath,
      }
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

    return vcResult
  }

  /**
   * Saves and returns path of retrieved VC document
   */
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
    const visualResult = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    // Ensure directory existence
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true }) // Create directory recursively
    }

    // Save the file
    // The output file format is pdf
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })
    return fullPath
  }

  /**
   * Renders the VC visual document as pdf
   */
  async getVcVisualDocument(vcId: string, outputType: string, vcTemplateId: string, res) {
    if (outputType == null || vcTemplateId == null) {
      throw new Error(VerifiableCredentialErrors.BAD_REQUEST)
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
    const visualResult = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )

    const fileDirectory = '/file-uploads/'
    const filePath = path.join(__dirname, '..', fileDirectory)

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true })
    }

    // Save the file
    // The output file format is pdf
    const fileName = `${vcId}.pdf`
    const fullPath = path.join(filePath, fileName)

    // Write PDF data to the file
    fs.writeFileSync(fullPath, visualResult, { encoding: 'binary' })

    if (fs.existsSync(fullPath)) {
      res.set('Content-Type', outputType)
      res.download(fullPath, fileName)
      // Clear the file!
      setTimeout(function () {
        fs.unlinkSync(fullPath)
      }, 3000)
    } else {
      res.status(404).send(VerifiableCredentialErrors.CREDENTIAL_NOT_FOUND)
    }
  }

  /**
   * Verifies the credential
   */
  async verifyCredential(vcId: string): Promise<StandardMessageResponse | any> {
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
    const vcDetails = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') +
        `${RequestRoutes.CREDENTIAL}/${vcId}${RequestRoutes.VERIFY_CREDENTIAL}`,
      config,
    )

    if (vcDetails == null) {
      throw new NotFoundException(VerifiableCredentialErrors.CREDENTIAL_NOT_FOUND)
    }

    if (vcDetails['status'] == 'ISSUED') {
      return {
        data: vcDetails,
      }
    } else {
      throw new UnauthorizedException(VerifiableCredentialErrors.INVALID_CREDENTIAL)
    }
  }

  /**
   * Returns VC details by Vc Id
   */
  async getVcDetailsById(vcId: string): Promise<StandardMessageResponse | any> {
    const headers = {
      Accept: 'application/json',
    }

    const config: AxiosRequestConfig = {
      headers: headers,
    }
    const vcDetails = await this.apiClient.get(
      this.configService.get('SUNBIRD_VC_SERVICE_URL') + `${RequestRoutes.CREDENTIAL}/${vcId}`,
      config,
    )
    if (vcDetails == null) {
      throw new NotFoundException(FileAccessControlErrors.DOCUMENT_NOT_FOUND)
    }

    return vcDetails
  }
}
