import { ExpressRequestInterface } from '@app/types/expressReaquest.interface';
import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> {
		const request = context.switchToHttp().getRequest<ExpressRequestInterface>()

		if (request.user) {
			return true
		}
		throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
	}
}