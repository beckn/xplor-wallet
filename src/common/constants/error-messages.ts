export const FileAccessControlErrors = {
  DOCUMENT_NOT_FOUND: 'No document found with the provided restriction key.',
  ACL_NOT_FOUND: 'Access control document not found for the provided restrictedKey.',
}

export const WalletErrors = {
  WALLET_NOT_FOUND: 'Wallet with this user does not exists.',
  WALLET_ALREADY_EXIST: 'Wallet with this user already exists',
  WALLET_BAD_REQUEST: 'There was an error in creating wallet',
}

export const FilesErrors = {
  INTERNAL_ERROR: 'There was an error in completing your request.',
  ACL_GENERATION_ERROR: 'There was an error in generating access control for the file. Try again',
  FILES_NOT_FOUND: 'Files not found',
  FILE_NOT_EXIST: 'File does not exist with the fileId!',
  DELETE_PERMISSION_ERROR: "You don't have the permission to delete this file.",
  RECOVER_PERMISSION_ERROR: "You don't have the permission to recover this file.",
  FILE_DELETED_ERROR: 'You cannot view this file as its deleted, it needs to be recovered first.',
  FILES_MAX_COUNT_ERROR: "You can't access this document as the file share has reached viewCount Limit",
  SHARE_REJECTED_ERROR: 'You cannot view this file as the file share has been rejected',
  FILE_EXPIRED_ERROR: "You can't access this document as the file share has expired",
  SHARE_PERMISSION_ERROR: "You don't have the permission to share this file.",
  FILE_MAX_TIME_LIMIT_ERROR: 'You cannot request the file for more than 7 days.',
  REQUEST_NOT_FOUND: 'Request with the requestId not found.',
  REQUEST_DELETE_PERMISSION_ERROR: 'You cannot delete this share request as you did not make this share request.',
  INVALID_ACTION: 'Please enter a valid action [ACCEPTED, REJECTED, PENDING]',
  SHARE_ACTION_PERMISSION_ERROR: 'You cannot respond to this share request as you are not the file owner.',
  FILE_MISSING_ERROR: 'Please attach a file document.',
  INVALID_DELETE_ACTION: 'Incorrect action, please enter one of these [DELETE, RECOVER, PERMANENT_DELETE].',
}

export const VcErrors = {
  VCs_NOT_FOUND: 'VCs not found',
  VC_NOT_EXIST: 'VC does not exist with the VcId!',
}
