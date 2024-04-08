export interface IStorageService {
  uploadFile(file: Express.Multer.File | any): Promise<void>

  getSignedFileUrl(expiresIn: number, fileKey: string): Promise<string>

  refreshFileUrl(fileKey: string): Promise<string>

  deleteFileUrl(fileKey: string)
}
