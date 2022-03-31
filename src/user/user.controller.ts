import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { Body, Controller, Get, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { User } from './decorators/user.decorator';
import { CreateUserDto } from './dto/createUser.dto';
import { LoginUserDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { AuthGuard } from './guards/auth.guard';
import { UserResponseInterface } from './types/userResponse.interface';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Controller()
export class UserController {
	constructor(private readonly userSerice: UserService) { }

	@Post('users')
	@UsePipes(new BackendValidationPipe())
	async creteUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
		const user = await this.userSerice.createUser(createUserDto)
		return this.userSerice.buildUserResponse(user)
	}

	@Post('users/login')
	@UsePipes(new BackendValidationPipe())
	async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseInterface> {
		const user = await this.userSerice.login(loginUserDto)
		return this.userSerice.buildUserResponse(user)
	}

	@Get('user')
	@UseGuards(AuthGuard)
	async currentUser(
		@User() user: UserEntity
	): Promise<UserResponseInterface> {
		return this.userSerice.buildUserResponse(user)
	}

	@Put('user')
	@UseGuards(AuthGuard)
	async updateCurrentUser(
		@User('id') currentUserId: number,
		@Body('user') updateUserDto: UpdateUserDto): Promise<UserResponseInterface> {
		const user = await this.userSerice.updateUser(currentUserId, updateUserDto)
		return this.userSerice.buildUserResponse(user)
	}
}