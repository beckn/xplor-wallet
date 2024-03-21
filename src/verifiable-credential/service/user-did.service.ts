import { Injectable } from '@nestjs/common'
import { ApiClient } from 'src/common/api-client'
import { StandardMessageResponse } from 'src/common/constants/standard-message-response.dto'
import { CreateUserDidApiBodyDto } from '../dto/create-user-did-api-body.dto'
import { CreateUserDIDRequestDto } from '../dto/create-user-did-request.dto'

@Injectable()
export class UserDidService {
  constructor(private readonly apiClient: ApiClient) {}

  async generateUserDid(didRequest: CreateUserDIDRequestDto): Promise<StandardMessageResponse> {
    const requestBody = new CreateUserDidApiBodyDto([
      {
        alsoKnownAs: [didRequest.didDetails.fullName, didRequest.didDetails.email],
        method: didRequest.organization.toString().trim(),
      },
    ])
    const createUser = await this.apiClient.post(
      process.env.SUNBIRD_IDENTITY_SERVICE_URL + '/did/generate',
      requestBody,
    )
    return {
      data: createUser,
    }
  }
}
