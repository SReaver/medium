import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UsePipes } from '@nestjs/common';
import { timeStamp } from 'console';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { CreateCommentDto } from './dto/createComment.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

@Controller('articles')
export class ArticleController {
	constructor(private readonly articleService: ArticleService) { }

	@Get()
	async findAll(
		@User('id') currentUserId: number,
		@Query() query: any
	): Promise<ArticlesResponseInterface> {
		return await this.articleService.findAll(currentUserId, query)
	}

	@Get('feed')
	@UseGuards(AuthGuard)
	async getFeed(
		@User('id') currentUserId: number,
		@Query() query: any
	): Promise<ArticlesResponseInterface> {
		return await this.articleService.getFeed(currentUserId, query)
	}

	@Post()
	@UseGuards(AuthGuard)
	@UsePipes(new BackendValidationPipe())
	async create(
		@User() currentUser: UserEntity,
		@Body('article') createArticleDto: CreateArticleDto
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.createArticle(currentUser, createArticleDto)

		return await this.articleService.buildArticleResponse(article)
	}

	@Get(':slug')
	async getSingleArticle(@Param('slug') slug: string): Promise<ArticleResponseInterface> {
		const article = await this.articleService.findBySlug(slug)
		return this.articleService.buildArticleResponse(article)
	}

	@Delete(':slug')
	@UseGuards(AuthGuard)
	async deleteArticle(@User('id') currentUserId: number,
		@Param('slug') slug: string) {
		return await this.articleService.deleteArticle(slug, currentUserId)
	}

	@Put(':slug')
	@UseGuards(AuthGuard)
	@UsePipes(new BackendValidationPipe())
	async updateArticle(
		@User('id') currentUserId: number,
		@Param('slug') slug: string,
		@Body('article') updateArticleDto: CreateArticleDto
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.updateArticle(slug, updateArticleDto, currentUserId)
		return this.articleService.buildArticleResponse(article)
	}

	@Post(':slug/favorite')
	@UseGuards(AuthGuard)
	async addArticleToFavorites(
		@User('id') currentUserId: number,
		@Param('slug') slug: string
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.addArticleToFavorites(slug, currentUserId)
		return this.articleService.buildArticleResponse(article)
	}

	@Delete(':slug/favorite')
	@UseGuards(AuthGuard)
	async deleteArticleFromFavorites(
		@User('id') currentUserId: number,
		@Param('slug') slug: string
	): Promise<ArticleResponseInterface> {
		const article = await this.articleService.deleteArticleFromFavorites(slug, currentUserId)
		return this.articleService.buildArticleResponse(article)
	}

	@Post(':slug/comments')
	@UseGuards(AuthGuard)
	@UsePipes(new BackendValidationPipe())
	async createComment(
		@User() currentUser: UserEntity,
		@Param('slug') slug: string,
		@Body('comment') createCommentDto: CreateCommentDto
	): Promise<CommentResponseInterface> {
		const comment = await this.articleService.createComment(currentUser, slug, createCommentDto)
		return this.articleService.buildCommentResponse(comment)
	}

	@Get(':slug/comments')
	async getCommentsBySlug(
		@Param('slug') slug: string
	): Promise<CommentsResponseInterface> {
		const comments = await this.articleService.getCommentsBySlug(slug)
		return await this.articleService.buildCommentsResponse(comments)
	}
}