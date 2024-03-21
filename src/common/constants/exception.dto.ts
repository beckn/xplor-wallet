import { HttpException, HttpStatus } from '@nestjs/common'

export class ExceptionDto extends HttpException {
  constructor(status: HttpStatus, message: string, success: boolean = false) {
    super({ success, message }, status)
  }
}
