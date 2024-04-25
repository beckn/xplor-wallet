import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
  Optional,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { LoggerMessage } from '../common/constants/logger-message'
import { GrafanaLoggerService } from '../grafana/service/grafana.service'

// Define types for request, response, and error handlers
export type RequestHandler = (request: Request, logger: GrafanaLoggerService) => void
export type ResponseHandler = (
  request: Request,
  response: Response,
  body: unknown,
  logger: GrafanaLoggerService,
) => void
export type ErrorHandler = (request: Request, error: Error, logger: GrafanaLoggerService) => void

// Default request handler function
export const defaultRequestHandler: RequestHandler = (request: Request, logger: GrafanaLoggerService) => {
  // Extract request details

  const message = `REQUEST: ${request.method} ${request.url}`
  const { headers, connection, body } = request
  const deviceId = headers['device-id']
  const deviceDetails = headers['device-details']
  const ipAddress = connection.remoteAddress

  // Extract browser details from user-agent header
  let browserDetails = ''
  if (headers['user-agent']) {
    const userAgent = headers['user-agent']
    browserDetails = `Browser: ${userAgent}`
  }

  // Log request details
  const messagePayload = {
    headers: { message, headers, deviceId, deviceDetails, ipAddress, browserDetails },
    body: body,
  }
  logger.sendDebug({ message: messagePayload, methodName: LoggerMessage.requestInterceptorName })
}

// Default response handler function
export const defaultResponseHandler: ResponseHandler = (
  request: Request,
  response: Response,
  _body: unknown,
  logger: GrafanaLoggerService,
) => {
  // Log response details

  const message = `RESPONSE: ${request.method} ${request.url} => ${JSON.stringify(_body)}`

  logger.sendLog({ message, methodName: LoggerMessage.responseInterceptorName })
}

// Default error handler function
export const defaultErrorHandler: ErrorHandler = (request: Request, error: Error, logger: GrafanaLoggerService) => {
  // Check if the error is an HTTP exception
  if (error instanceof HttpException) {
    const statusCode: number = error.getStatus()
    const message = `ERROR: ${request.method} ${request.url} => ${statusCode}`

    // Log error with appropriate severity level
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const messagePayload = {
        message: {
          message,
          error,
          stack: error.stack,
        },
        methodName: LoggerMessage.errorInterceptorName,
      }
      logger.sendError(messagePayload)
    } else {
      const messagePayload = {
        message: {
          message,
          error,
        },
      }
      logger.sendWarn(messagePayload)
    }
  } else {
    // Log non-HTTP errors
    const messagePayload = {
      message: {
        message: `ERROR: ${request.method} ${request.url}`,
        error,
      },
      stack: error.stack,
    }
    logger.sendError(messagePayload)
  }
}

// Configuration interface for the logging interceptor
export type LoggingInterceptorConfig = {
  requestHandler: RequestHandler | null
  responseHandler: ResponseHandler | null
  errorHandler: ErrorHandler | null
  context: string
}

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger
  private readonly config: LoggingInterceptorConfig

  // Constructor to initialize the interceptor with optional configuration
  constructor(@Optional() config?: Partial<LoggingInterceptorConfig> | string) {
    // Initialize configuration with defaults if not provided
    const partialConfig: Partial<LoggingInterceptorConfig> =
      typeof config === 'string' ? { context: config } : { ...config }

    this.config = {
      ...partialConfig,
      // Assign default handlers if not provided
      requestHandler: partialConfig.requestHandler !== undefined ? partialConfig.requestHandler : defaultRequestHandler,
      responseHandler:
        partialConfig.responseHandler !== undefined ? partialConfig.responseHandler : defaultResponseHandler,
      errorHandler: partialConfig.errorHandler !== undefined ? partialConfig.errorHandler : defaultErrorHandler,
      // Set context for logger
      context: partialConfig.context || LoggingInterceptor.name,
    }

    // Create logger instance with provided context
    this.logger = new Logger(this.config.context)
  }

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param callHandler implements the handle method that returns an Observable
   */
  public intercept(context: ExecutionContext, callHandler: CallHandler): Observable<unknown> {
    // Log request details before processing
    if (this.config.requestHandler != null) {
      const request = context.switchToHttp().getRequest()
      const logger = new GrafanaLoggerService()
      this.config.requestHandler(request, logger)
    }

    // Intercept the call handler and log response/error afterward
    return callHandler.handle().pipe(
      tap({
        next: (val: unknown): void => {
          this.logNext(val, context)
        },
        error: (err: Error): void => {
          this.logError(err, context)
        },
      }),
    )
  }

  /**
   * Logs the request response in success cases
   * @param body body returned
   * @param context details about the current request
   */
  private logNext(body: unknown, context: ExecutionContext): void {
    // Log response details
    if (this.config.responseHandler != null) {
      const request = context.switchToHttp().getRequest<Request>()
      const response = context.switchToHttp().getResponse<Response>()
      const logger = new GrafanaLoggerService()

      this.config.responseHandler(request, response, body, logger)
    }
  }

  /**
   * Logs the request response in error cases
   * @param error Error object
   * @param context details about the current request
   */
  private logError(error: Error, context: ExecutionContext): void {
    // Log error details
    const request = context.switchToHttp().getRequest<Request>()
    const logger = new GrafanaLoggerService()

    if (this.config.errorHandler != null) {
      this.config.errorHandler(request, error, logger)
    }
  }
}
