export enum FileAction {
  DELETE = 'DELETE',
  RECOVER = 'RECOVER',
  PERMANENT_DELETE = 'PERMANENT_DELETE',
}

export enum ShareRequestAction {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum FileShareType {
  SHARED = 'SHARED',
  RECEIVED = 'RECEIVED',
}

export enum VcType {
  SELF_ISSUED = 'SELF_ISSUED',
  RECEIVED = 'RECEIVED',
}

export enum VcCategory {
  EDUCATION = 'EducationCertificate',
  SKILL = 'SkillCertificate',
  PROOF_OF_ADDRESS = 'AddressProofCertificate',
  AADHAR = 'AadharCertificate',
  MISCELLANEOUS = 'MISCELLANEOUS',
}
