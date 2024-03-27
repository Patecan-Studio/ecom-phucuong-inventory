import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	Logger,
	Type,
} from '@nestjs/common'
import { Response } from 'express'
import { BaseException } from '../exceptions/exception.base'
import { ResultCode } from '../enums/result-code.enum'

export const createExceptionFilter = (
	resultCodeMapping: Record<string, string>,
): Type<ExceptionFilter> => {
	@Catch()
	class ExceptionFilterInternal implements ExceptionFilter {
		catch(exception: Error, host: ArgumentsHost) {
			Logger.error(exception.message, exception.stack)

			let statusCode, code, message
			// application exception
			if (exception instanceof HttpException) {
				statusCode = exception.getStatus()
				code = statusCode
				message = exception.message
			} else if (exception instanceof BaseException) {
				statusCode = 400
				code = exception.code
				message = exception.message
			} else {
				statusCode = 500
				code = 'INTERNAL_SERVER_ERROR'
				message = 'Internal server error'
			}

			const res = host.switchToHttp().getResponse() as Response
			res.status(statusCode).json({
				resultCode: resultCodeMapping[code] || ResultCode.Error,
				resultMessage: message,
				// @deprecated - remove this in the future
				message,
			})
		}
	}

	return ExceptionFilterInternal
}
