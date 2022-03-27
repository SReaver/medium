import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserService } from './user.service';

@Controller()
export class UserController {
	constructor(private readonly userSerice: UserService) { }
	@Post('users')
	@UsePipes(new ValidationPipe())
	async creteUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
		const user = await this.userSerice.createUser(createUserDto)
		return this.userSerice.buildUserResponse(user)
	}
}