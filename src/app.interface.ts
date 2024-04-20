export interface IProvider {
  code: string
  iconLink: string
  title: string
  subTitle: string
  redirectUrl: string
}

/**
 * Represents the structure of a health check response object, typically used for reporting the health status of a microservice.
 */
export interface IHealthCheck {
  status: string
  version: string
  serverMessage: string
}
