import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiClient } from 'src/common/api-client'
import { RequestRoutes } from 'src/common/constants/request-routes'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateUserDidApiBodyDto } from '../dto/create-user-did-api-body.dto'
import { CreateUserDIDRequestDto } from '../dto/create-user-did-request.dto'

@Injectable()
export class UserDidService {
  constructor(private readonly apiClient: ApiClient, private readonly configService: ConfigService) {}

  /**
   * Generates a user did in Sunbird RC
   */
  async generateUserDid(didRequest: CreateUserDIDRequestDto): Promise<StandardMessageResponse> {
    const requestBody = new CreateUserDidApiBodyDto([
      {
        alsoKnownAs: [didRequest.didDetails.fullName, didRequest.didDetails.email],
        method: didRequest.organization.toString().trim(),
      },
    ])
    const createUser = await this.apiClient.post(
      this.configService.get('SUNBIRD_IDENTITY_SERVICE_URL') + RequestRoutes.GENERATE_DID,
      requestBody,
    )
    return createUser
  }
}
