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
