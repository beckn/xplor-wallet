import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { VcType } from '../../common/constants/enums'
import { FilesErrors, VcErrors } from '../../common/constants/error-messages'
import { CreateVCRequestBodyDto } from '../dto/create-vc-request-body.dto'
import { ShareRequestCreateService } from '../service/share-request-create.service'
import { ShareRequestReadService } from '../service/share-request-read.service'
import { ShareRequestUpdateService } from '../service/share-request-update.service'
import { VerifiableCredentialCreateService } from '../service/verifiable-credential-create.service'
import { VerifiableCredentialDeleteService } from '../service/verifiable-credential-delete.service'
import { VerifiableCredentialReadService } from '../service/verifiable-credential-read.service'
import { VerifiableCredentialController } from './verifiable-credential.controller'

describe('VerifiableCredentialController', () => {
  let controller: VerifiableCredentialController
  let vcCreateService: VerifiableCredentialCreateService
  let shareRequestCreateService: ShareRequestCreateService
  let shareRequestReadService: ShareRequestReadService
  let shareRequestUpdateService: ShareRequestUpdateService
  let vcReadService: VerifiableCredentialReadService
  let vcDeleteService: VerifiableCredentialDeleteService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifiableCredentialController],
      providers: [
        {
          provide: VerifiableCredentialCreateService,
          useValue: {
            createVerifiableCredential: jest.fn(),
            pushVerifiableCredential: jest.fn(),
          },
        },
        {
          provide: VerifiableCredentialReadService,
          useValue: {
            getVCByIdAndWalletId: jest.fn(),
            getAllWalletVc: jest.fn(),
          },
        },
        {
          provide: VerifiableCredentialDeleteService,
          useValue: {
            deleteVc: jest.fn(),
          },
        },
        {
          provide: ShareRequestReadService,
          useValue: {
            getShareRequestsList: jest.fn(),
          },
        },
        {
          provide: ShareRequestUpdateService,
          useValue: {
            deleteShareRequest: jest.fn(),
            respondToShareRequest: jest.fn(),
          },
        },
        {
          provide: ShareRequestCreateService,
          useValue: {
            shareVc: jest.fn(),
            requestShareFile: jest.fn(),
          },
        },
        {
          provide: VerifiableCredentialReadService,
          useValue: {
            renderVCDocument: jest.fn(),
            getVCByIdAndWalletId: jest.fn(),
            getAllWalletVc: jest.fn(),
          },
        },
        {
          provide: VerifiableCredentialDeleteService,
          useValue: {
            deleteVc: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<VerifiableCredentialController>(VerifiableCredentialController)
    vcCreateService = module.get<VerifiableCredentialCreateService>(VerifiableCredentialCreateService)
    shareRequestCreateService = module.get<ShareRequestCreateService>(ShareRequestCreateService)
    shareRequestReadService = module.get<ShareRequestReadService>(ShareRequestReadService)
    shareRequestUpdateService = module.get<ShareRequestUpdateService>(ShareRequestUpdateService)
    vcReadService = module.get<VerifiableCredentialReadService>(VerifiableCredentialReadService)
    vcDeleteService = module.get<VerifiableCredentialDeleteService>(VerifiableCredentialDeleteService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('storeCredential', () => {
    it('should create a VC', async () => {
      const body: CreateVCRequestBodyDto = {
        did: 'did:vcId',
        fileId: 'fileId',
        walletId: 'walletId',
        type: VcType.SELF_ISSUED,
        category: 'credential',
        tags: [],
        name: 'Verifiable Credential',
      }
      const storeVcResult = {
        did: 'did:vcId',
      }
      jest.spyOn(vcCreateService, 'createVerifiableCredential').mockResolvedValue(storeVcResult)
      const result = await controller.storeCredential(body)
      expect(result).toHaveProperty('did', storeVcResult.did)
    })

    it('should create a VC throws Exception in Storing a VC', async () => {
      const body: CreateVCRequestBodyDto = {
        did: null,
        fileId: 'fileId',
        walletId: 'walletId',
        type: VcType.SELF_ISSUED,
        category: 'credential',
        tags: [],
        name: 'Verifiable Credential',
      }
      jest
        .spyOn(vcCreateService, 'createVerifiableCredential')
        .mockRejectedValue(new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR))
      const result = controller.storeCredential(body)
      await expect(result).rejects.toThrow(new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR))
    })
  })

  describe('pushCredentialToWallet', () => {
    it('should pushCredentialToWallet', async () => {
      const body: CreateVCRequestBodyDto = {
        did: 'did:vcId',
        fileId: 'fileId',
        walletId: 'walletId',
        type: VcType.SELF_ISSUED,
        category: 'credential',
        tags: [],
        name: 'Verifiable Credential',
      }
      const storeVcResult = {
        did: 'did:vcId',
      }
      jest.spyOn(vcCreateService, 'pushVerifiableCredential').mockResolvedValue(storeVcResult)
      const result = await controller.pushCredentialToWallet(body)
      expect(result).toHaveProperty('did', storeVcResult.did)
    })

    it('should pushCredentialToWallet throws Exception in Storing a VC', async () => {
      const body: CreateVCRequestBodyDto = {
        did: null,
        fileId: 'fileId',
        walletId: 'walletId',
        type: VcType.SELF_ISSUED,
        category: 'credential',
        tags: [],
        name: 'Verifiable Credential',
      }
      jest
        .spyOn(vcCreateService, 'pushVerifiableCredential')
        .mockRejectedValue(new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR))
      const result = controller.pushCredentialToWallet(body)
      await expect(result).rejects.toThrow(new InternalServerErrorException(VcErrors.ACL_GENERATION_ERROR))
    })
  })

  describe('getVCById', () => {
    it('should getVCById', async () => {
      const body = {
        vcId: 'vcId',
        walletId: 'walletId',
      }
      const storeGetIdResult = {
        did: 'did:vcId',
      }
      jest.spyOn(vcReadService, 'getVCByIdAndWalletId').mockResolvedValue(storeGetIdResult)
      const result = await controller.getVCById(body)
      expect(result).toHaveProperty('did', storeGetIdResult.did)
    })

    it('should getVCById throws Exception in Getting a VC', async () => {
      const body = {
        vcId: 'vcId',
        walletId: 'walletId',
      }
      jest.spyOn(vcReadService, 'getVCByIdAndWalletId').mockRejectedValue(new NotFoundException(VcErrors.VC_NOT_EXIST))
      const result = controller.getVCById(body)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VC_NOT_EXIST))
    })
  })

  describe('getAllWalletVc', () => {
    it('should getAllWalletVc', async () => {
      const body = {
        walletId: 'walletId',
        page: 1,
        pageSize: 1,
      }
      const storeGetIdResult = [
        {
          did: 'did:vcId',
        },
      ]
      jest.spyOn(vcReadService, 'getAllWalletVc').mockResolvedValue(storeGetIdResult)
      const result = await controller.getAllVC(body)
      expect(result).toEqual(storeGetIdResult)
    })

    it('should getAllWalletVc throws Exception in Getting All VCs', async () => {
      const body = {
        walletId: 'walletId',
        page: 1,
        pageSize: 1,
      }
      jest.spyOn(vcReadService, 'getAllWalletVc').mockRejectedValue(new NotFoundException(VcErrors.VCs_NOT_FOUND))
      const result = controller.getAllVC(body)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VCs_NOT_FOUND))
    })
  })

  describe('deleteVc', () => {
    it('should deleteVc', async () => {
      const body = {
        vcId: 'vcId',
        walletId: 'walletId',
      }
      const storeGetIdResult = {
        did: 'did:vcId',
      }
      jest.spyOn(vcDeleteService, 'deleteVc').mockResolvedValue(storeGetIdResult)
      const result = await controller.deleteVC(body)
      expect(result).toHaveProperty('did', storeGetIdResult.did)
    })

    it('should deleteVc throws Exception in Deleting a VC', async () => {
      const body = {
        vcId: 'vcId',
        walletId: 'walletId',
      }
      jest.spyOn(vcDeleteService, 'deleteVc').mockRejectedValue(new NotFoundException(VcErrors.VC_NOT_EXIST))
      const result = controller.deleteVC(body)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VC_NOT_EXIST))
    })
  })

  describe('shareVc', () => {
    it('should shareVc', async () => {
      const body = {
        params: {
          vcIds: ['vcId1', 'vcId2'],
          walletId: 'walletId',
        },
        shareDetails: {
          certificateType: 'certificateType',
          remarks: 'Sharing certificate',
          restrictions: {
            expiresIn: 48,
            viewOnce: false,
          },
        },
      }
      const storeGetIdResult = {
        vcId: 'vcId',
      }
      // jest.spyOn(shareRequestCreateService, 'shareVc').mockResolvedValue(storeGetIdResult)
      const result = await controller.shareFile(body.params, body.shareDetails)
      expect(result).toHaveProperty('vcId', storeGetIdResult.vcId)
    })

    it('should shareVc throws Exception in Sharing a VC', async () => {
      const body = {
        params: {
          vcIds: null,
          walletId: 'walletId',
        },
        shareDetails: {
          certificateType: 'certificateType',
          remarks: 'Sharing certificate',
          restrictions: {
            expiresIn: 48,
            viewOnce: false,
          },
        },
      }
      // jest.spyOn(shareRequestCreateService, 'shareVc').mockRejectedValue(new NotFoundException(VcErrors.VC_NOT_EXIST))
      const result = controller.shareFile(body.params, body.shareDetails)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VC_NOT_EXIST))
    })
  })

  describe('requestShareFile', () => {
    it('should requestShareFile', async () => {
      const body = {
        params: {
          vcId: 'vcId',
          walletId: 'walletId',
        },
        shareDetails: {
          requestedFromWallet: 'wallet123',
          certificateType: 'certificateType',
          remarks: 'Sharing certificate',
          restrictions: {
            expiresIn: 48,
            viewOnce: false,
          },
        },
      }
      const storeGetIdResult = {
        vcId: 'vcId',
      }
      jest.spyOn(shareRequestCreateService, 'requestShareFile').mockResolvedValue(storeGetIdResult)
      const result = await controller.requestShareFile(body.params.walletId, body.shareDetails)
      expect(result).toHaveProperty('vcId', storeGetIdResult.vcId)
    })

    it('should requestShareFile throws Exception in Requesting a VC', async () => {
      const body = {
        params: {
          vcId: null,
          walletId: 'walletId',
        },
        shareDetails: {
          requestedFromWallet: 'wallet123',
          certificateType: 'certificateType',
          remarks: 'Sharing certificate',
          restrictions: {
            expiresIn: 48,
            viewOnce: false,
          },
        },
      }
      jest
        .spyOn(shareRequestCreateService, 'requestShareFile')
        .mockRejectedValue(new NotFoundException(VcErrors.VC_NOT_EXIST))
      const result = controller.requestShareFile(body.params.walletId, body.shareDetails)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VC_NOT_EXIST))
    })
  })

  describe('getShareRequests', () => {
    it('should getShareRequests', async () => {
      const body = {
        walletId: 'walletId',
        page: 1,
        pageSize: 1,
      }
      const storeGetRequestsResult = [
        {
          vcId: 'did:vcId',
        },
      ]
      jest.spyOn(shareRequestReadService, 'getShareRequestsList').mockResolvedValue(storeGetRequestsResult)
      const result = await controller.getShareRequests(body)
      expect(result).toEqual(storeGetRequestsResult)
    })

    it('should getAllWalletVc throws Exception in Getting All VCs', async () => {
      const body = {
        walletId: 'walletId',
        page: 1,
        pageSize: 1,
      }
      jest
        .spyOn(shareRequestReadService, 'getShareRequestsList')
        .mockRejectedValue(new NotFoundException(VcErrors.VCs_NOT_FOUND))
      const result = controller.getShareRequests(body)
      await expect(result).rejects.toThrow(new NotFoundException(VcErrors.VCs_NOT_FOUND))
    })
  })

  describe('deleteShareRequest', () => {
    it('should deleteShareRequest', async () => {
      const body = {
        requestId: 'reqId',
        walletId: 'walletId',
      }
      const storeGetIdResult = {
        did: 'did:vcId',
      }
      jest.spyOn(shareRequestUpdateService, 'deleteShareRequest').mockResolvedValue(storeGetIdResult)
      const result = await controller.deleteShareRequest(body)
      expect(result).toHaveProperty('did', storeGetIdResult.did)
    })

    it('should deleteShareRequest throws Exception in Deleting a Request', async () => {
      const body = {
        requestId: 'vcId',
        walletId: 'walletId',
      }
      jest
        .spyOn(shareRequestUpdateService, 'deleteShareRequest')
        .mockRejectedValue(new NotFoundException(FilesErrors.REQUEST_NOT_FOUND))
      const result = controller.deleteShareRequest(body)
      await expect(result).rejects.toThrow(new NotFoundException(FilesErrors.REQUEST_NOT_FOUND))
    })
  })

  describe('respondToShareRequest', () => {
    it('should respondToShareRequest', async () => {
      const body = {
        requestId: 'reqId',
        walletId: 'walletId',
        vcId: 'vcId',
        action: 'ACCEPTED',
      }
      const storeGetIdResult = {
        did: 'did:vcId',
      }
      jest.spyOn(shareRequestUpdateService, 'respondToShareRequest').mockResolvedValue(storeGetIdResult)
      const result = await controller.respondToShareRequest(body)
      expect(result).toHaveProperty('did', storeGetIdResult.did)
    })

    it('should respondToShareRequest throws Exception in responding to a Request', async () => {
      const body = {
        requestId: 'reqId',
        walletId: 'walletId',
        vcId: 'vcId',
        action: 'WRONG_ACTION',
      }
      jest
        .spyOn(shareRequestUpdateService, 'respondToShareRequest')
        .mockRejectedValue(new BadRequestException(FilesErrors.INVALID_ACTION))
      const result = controller.respondToShareRequest(body)
      await expect(result).rejects.toThrow(new BadRequestException(FilesErrors.INVALID_ACTION))
    })
  })
})
