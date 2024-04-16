// Enum to define standard HTTP response messages.
// Used throughout the application to standardize response messages.
export enum HttpResponseMessage {
  OK = 'OK',
  BAD_REQUEST = 'Bad Request',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  NOT_FOUND = 'Not Found',
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
}
