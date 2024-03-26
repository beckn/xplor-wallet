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

export enum FileType {
  public = 'public',
  private = 'private',
}
