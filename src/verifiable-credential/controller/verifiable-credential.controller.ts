import { Body, Controller, Get, Headers, Param, Post, Res } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDIDRequestDto } from '../dto/create-user-did-request.dto'
import { IssueCredentialRequestDto } from '../dto/issue-credential-request.dto'
import { UserDidService } from '../service/user-did.service'
import { VerifiableCredentialService } from '../service/verifiable-credential.service'

@ApiTags('Verifiable Credentials')
@Controller('credentials')
export class VerifiableCredentialController {
  constructor(
    private readonly userDidService: UserDidService,
    private readonly vcService: VerifiableCredentialService,
  ) {}

  @Post('/did')
  @ApiOperation({ summary: 'Generate User DID', description: 'Generates a new user DID.' })
  @ApiBody({ type: CreateUserDIDRequestDto })
  @ApiResponse({ status: 200, description: 'User DID generated successfully.' })
  async generateUserDid(@Body() didRequest: CreateUserDIDRequestDto) {
    const generateDid = await this.userDidService.generateUserDid(didRequest)
    return generateDid
  }

  @Post('/issue-vc')
  @ApiOperation({ summary: 'Issue Credential', description: 'Issues a new verifiable credential.' })
  @ApiBody({ type: IssueCredentialRequestDto })
  @ApiResponse({ status: 200, description: 'Verifiable credential issued successfully.' })
  async issueCredential(@Body() didRequest: IssueCredentialRequestDto) {
    const vcResult = await this.vcService.issueCredential(didRequest)
    return vcResult
  }

  @Get('/:vcId/verify')
  @ApiOperation({ summary: 'Verify Credential', description: 'Verifies a verifiable credential by its Id/QrCode' })
  @ApiResponse({ status: 200, description: 'Verifiable credential verified successfully.' })
  async verifyCredential(@Param('vcId') vcId: string) {
    const vcResult = await this.vcService.verifyCredential(vcId)
    return vcResult
  }

  @Get('/:vcId')
  @ApiOperation({
    summary: 'Get Verifiable Credential Details',
    description: 'Retrieves details of a verifiable credential by its ID.',
  })
  @ApiParam({ name: 'vcId', description: 'Verifiable Credential ID' })
  @ApiResponse({ status: 200, description: 'Verifiable credential details retrieved successfully.' })
  async getVcDetailsById(
    @Param('vcId') vcId: string,
    @Headers('accept') outputType: string,
    @Headers('templateId') templateId: string,
    @Res() res,
  ) {
    console.log(outputType)
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
