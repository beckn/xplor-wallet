export class CreateUserDidApiBodyDto {
  content: {
    alsoKnownAs: string[]
    method: string
  }[]

  constructor(content: { alsoKnownAs: string[]; method: string }[]) {
    this.content = content
  }
}
