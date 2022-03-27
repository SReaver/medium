import { JWT_SECRET } from '@app/config';
import { ExpressRequestInterface } from '@app/types/expressReaquest.interface';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken'
import { UserService } from '../user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly userSerice: UserService) { }
	async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
		if (!req.headers.authorization) {
			req.user = null
			next()
			return
		}
		const token = req.headers.authorization.split(' ')[1]

		try {
			const decode = verify(token, JWT_SECRET)
			const user = await this.userSerice.findById(decode.id)
			req.user = user
			next()
		} catch (error) {
			req.user = null
			next()
		}
	}

}