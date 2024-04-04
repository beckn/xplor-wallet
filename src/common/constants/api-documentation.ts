export const CREATE_WALLET_API = {
  summary: 'Create Wallet',
  description: 'Creates a wallet with given userId. This will also generate a VC Registry did.',
  successResponseCode: 201,
  successResponseMessage: 'Wallet created successfully.',
}

export const DELETE_WALLET_API = {
  summary: 'Delete wallet',
  description: 'Deletes the wallet associated with the given userId or walletId',
  successResponseCode: 200,
  successResponseMessage: 'Wallet deleted successfully.',
}

export const GET_WALLET_DETAILS_API = {
  summary: 'Get wallet details',
  description: 'Retrieves the details of the wallet for the given userId or walletId',
  successResponseCode: 200,
  successResponseMessage: 'Retrieved wallet details successfully.',
}

export const STORE_CREDENTIAL_API = {
  summary: 'Create/Store Verifiable Credential to wallet',
  description:
    'Creates a VC record and stores it in the user wallet, it contains information of both Sunbird VC and Stored File',
  successResponseCode: 201,
  successResponseMessage: 'Created/Stored VC successfully.',
}

export const GET_CREDENTIAL_LIST_API = {
  summary: 'Get All VCs',
  description:
    'Fetches all VC that a user owns. The VCs which were stored by user or issued by someone appear in this.',
  successResponseCode: 200,
  successResponseMessage: 'VCs retrieved successfully.',
}

export const GET_SINGLE_CREDENTIAL_API = {
  summary: 'Get VC by Id',
  description: 'Returns the VC by its id. The VCs which was stored by user or issued by someone appear in this.',
  successResponseCode: 200,
  successResponseMessage: 'VC retrieved successfully.',
}

export const DELETE_CREDENTIAL_API = {
  summary: 'Deletes VC by Id',
  description: 'Deletes the VC by its id from the wallet permanently',
  successResponseCode: 200,
  successResponseMessage: 'VC deleted successfully.',
}

export const VIEW_CREDENTIAL_API = {
  summary: 'View VC Document',
  description: 'View/Render the VC document via the restrictedUrl',
  successResponseCode: 200,
  successResponseMessage: 'VC Document rendered successfully.',
}

export const SHARE_CREDENTIAL_API = {
  summary: 'Share VC',
  description:
    'Shares a VC with another user. This generates an self ACCEPTED VC share request with the expiry time and allowed view Count entered by the user and generates a publically access file document link of the File Access Control.',
  successResponseCode: 201,
  successResponseMessage: 'File shared successfully.',
}
