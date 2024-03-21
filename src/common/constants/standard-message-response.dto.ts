export class StandardMessageResponse {
  readonly data?: any
  readonly error?: any

  constructor(data?: any, error?: any) {
    this.data = data
    this.error = error
  }
}
