export const SELF_ISSUED_VC_CONTEXT = [
  'https://www.w3.org/2018/credentials/v1',
  'https://www.w3.org/2018/credentials/examples/v1',
  {
    '@context': {
      '@version': 1.1,
      '@protected': true,
      id: '@id',
      type: '@type',
      schema: 'https://schema.org/',
      SelfIssuedCredential: {
        '@id': 'did:SelfIssuedCredential',
        '@context': {
          '@version': 1.1,
          '@protected': true,
          id: '@id',
          type: '@type',
          certificateLink: 'schema:text',
        },
      },
    },
  },
]
