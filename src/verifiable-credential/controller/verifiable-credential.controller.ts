import { Body, Controller, Get, Headers, Param, Post, Res } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDIDRequestDto } from '../dto/create-user-did-request.dto'
import { IssueCredentialRequestDto } from '../dto/issue-credential-request.dto'
import { IssueCredentialRequestEntityDto } from '../entity/issue-credential-request-entity'
import { UserDidService } from '../service/user-did.service'
import { VerifiableCredentialService } from '../service/verifiable-credential.service'

@ApiTags('Verifiable Credentials')
@Controller('credentials')
export class VerifiableCredentialController {
  constructor(
    private readonly userDidService: UserDidService,
    private readonly vcService: VerifiableCredentialService,
  ) {}

  /**
   * Generates a new user DID.
   * @param didRequest The request body containing data required to generate the DID.
   * @returns The generated user DID if successful.
   */
  @Post('/did')
  @ApiOperation({
    summary: 'Generate User DID',
    description:
      'Generates a new user DID using Sunbird RC. This did acts as a issuer/administrator for all the actions like issuing VC, creating certificate Schema in Sunbird RC.',
  })
  @ApiBody({ type: CreateUserDIDRequestDto })
  @ApiResponse({ status: 200, description: 'User DID generated successfully.' })
  async generateUserDid(@Body() didRequest: CreateUserDIDRequestDto) {
    const generateDid = await this.userDidService.generateUserDid(didRequest)
    return generateDid
  }

  /**
   * Issues a new verifiable credential.
   * @param didRequest The request body containing data required to issue the credential.
   * @returns The result of issuing the verifiable credential if successful.
   */
  @Post('/issue-vc')
  @ApiOperation({
    summary: 'Issue Credential',
    description:
      'Issues a new verifiable credential via Sunbird RC. Takes the Issuer details, credential certificate receiver details, subject details of the Sunbird Credential and generates a new VC and pushes it to the receiver user wallet.',
  })
  @ApiBody({ type: IssueCredentialRequestEntityDto })
  @ApiResponse({ status: 200, description: 'Verifiable credential issued successfully.' })
  async issueCredential(@Body() didRequest: IssueCredentialRequestDto) {
    const vcResult = await this.vcService.issueCredential(didRequest)
    return vcResult
  }

  /**
   * Verifies a verifiable credential by its Id/QrCode.
   * @param vcId The ID or QR code of the verifiable credential to verify.
   * @returns The result of verifying the verifiable credential if successful.
   */
  @Get('/:vcId/verify')
  @ApiOperation({
    summary: 'Verify Credential',
    description:
      'Verifies a verifiable credential by its Id/QrCode by communicating with Sunbird RC Layer. The request contains a path for VC Id by which the VC is verified.',
  })
  @ApiResponse({ status: 200, description: 'Verifiable credential verified successfully.' })
  async verifyCredential(@Param('vcId') vcId: string) {
    const vcResult = await this.vcService.verifyCredential(vcId)
    return vcResult
  }

  /**
   * Retrieves details of a verifiable credential by its ID.
   * @param vcId The ID of the verifiable credential to retrieve details for.
   * @param outputType The desired output type for the response (e.g., application/pdf, text/html).
   * @param templateId The ID of the template to use for generating the response.
   * @param res The response object used to send the response.
   */
  @Get('/:vcId')
  @ApiOperation({
    summary: 'Get Verifiable Credential Details by VcId',
    description:
      'Retrieves details of a verifiable credential by its ID. Returns all the details of the credential in W3C Format(Json Ld) that is generated via Sunbird RC',
  })
  @ApiParam({ name: 'vcId', description: 'Verifiable Credential ID' })
  @ApiResponse({ status: 200, description: 'Verifiable credential details retrieved successfully.' })
  async getVcDetailsById(
    @Param('vcId') vcId: string,
    @Headers('accept') outputType: string,
    @Headers('templateId') templateId: string,
    @Res() res,
  ) {
    let vcResult = {}
    if (outputType == 'application/pdf' || outputType == 'text/html') {
      // Returns pdf/html
      await this.vcService.getVcVisualDocument(vcId, outputType, templateId, res)
    } else {
      vcResult = await this.vcService.getVcDetailsById(vcId)
      res.send(vcResult)
    }
  }
}
