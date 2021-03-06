import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify'
import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';
import { CommentEntity } from './comment.entity';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(ArticleEntity) private readonly articleRepository: Repository<ArticleEntity>,
		@InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(FollowEntity) private readonly followRepository: Repository<FollowEntity>,
		@InjectRepository(CommentEntity) private readonly commentRepository: Repository<CommentEntity>,
	) { }

	async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
		const queryBuilder = getRepository(ArticleEntity)
			.createQueryBuilder('articles')
			.leftJoinAndSelect('articles.author', 'author')
			.leftJoinAndSelect('articles.comments', 'comments')

		queryBuilder.orderBy('articles.createdAt', 'DESC')

		if (query.tag) {
			queryBuilder.andWhere('articles.tagList LIKE :tag', {
				tag: `%${query.tag}%`
			})
		}

		if (query.author) {
			const author = await this.userRepository.findOne({
				username: query.author
			})

			queryBuilder.andWhere('articles.authorId = :id', {
				id: author.id
			})
		}

		if (query.favorited) {
			const author = await this.userRepository.findOne({
				username: query.favorited
			},
				{
					relations: ['favorites']
				})
			const ids = author.favorites.map(el => el.id)

			if (ids.length > 0) {
				queryBuilder.andWhere('articles.authorId IN (:...ids)', { ids })
			} else {
				queryBuilder.andWhere('1=0')
			}
		}

		if (query.limit) {
			queryBuilder.limit(query.limit)
		}

		if (query.offset) {
			queryBuilder.offset(query.offset)
		}

		let favoritedIds: number[] = []
		if (currentUserId) {
			const currentUser = await this.userRepository.findOne(currentUserId, {
				relations: ['favorites']
			})
			favoritedIds = currentUser.favorites.map(favorite => favorite.id)

		}
		const articles = await queryBuilder.getMany()
		const articlesWithFavorites = articles.map(article => {
			const favorited = favoritedIds.includes(article.id)
			return { ...article, favorited }
		})

		const articlesCount = await queryBuilder.getCount()
		return { articles: articlesWithFavorites, articlesCount }
	}

	async getFeed(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
		const follows = await this.followRepository.find({
			followerId: currentUserId
		})

		if (follows.length === 0) {
			return { articles: [], articlesCount: 0 }
		}

		const followingUserIds = follows.map(follow => follow.followingId)
		const queryBuilder = getRepository(ArticleEntity).createQueryBuilder('articles')
			.leftJoinAndSelect('articles.author', 'author')
			.where('articles.authorId IN (:...ids)', { ids: followingUserIds })

		queryBuilder.orderBy('articles.createdAt', 'DESC')
		const articlesCount = await queryBuilder.getCount()

		if (query.limit) {
			queryBuilder.limit(query.limit)
		}

		if (query.offset) {
			queryBuilder.offset(query.offset)
		}

		const articles = await queryBuilder.getMany()
		return { articles, articlesCount }
	}

	async createArticle(currentUser: UserEntity, createArticleDto: CreateArticleDto): Promise<ArticleEntity> {
		const article = new ArticleEntity()
		Object.assign(article, createArticleDto)
		if (!article.tagList) {
			article.tagList = []
		}
		article.slug = this.getSlug(createArticleDto.title)
		article.author = currentUser
		return await this.articleRepository.save(article)
	}

	async findBySlug(slug: string): Promise<ArticleEntity> {
		return await this.articleRepository.findOne({ slug }, {
			relations: ['comments']
		})
	}

	async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
		const article = await this.findBySlug(slug)
		if (!article) {
			throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
		}

		if (article.author.id !== currentUserId) {
			throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
		}
		return await this.articleRepository.delete({ slug })
	}

	async updateArticle(slug: string, updateArticleDto: CreateArticleDto, currentUserId: number): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug)
		if (!article) {
			throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND)
		}

		if (article.author.id !== currentUserId) {
			throw new HttpException('You are not an author', HttpStatus.FORBIDDEN)
		}

		Object.assign(article, updateArticleDto)
		return await this.articleRepository.save(article)
	}

	async addArticleToFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug)
		const user = await this.userRepository.findOne(currentUserId, {
			relations: ['favorites'],
		})
		const isNotFavorited = user.favorites.findIndex(articleFavorites => articleFavorites.id === article.id) === -1

		if (isNotFavorited) {
			user.favorites.push(article)
			article.favoritesCount++
			await this.userRepository.save(user)
			await this.articleRepository.save(article)
		}
		return article
	}

	async deleteArticleFromFavorites(slug: string, currentUserId: number): Promise<ArticleEntity> {
		const article = await this.findBySlug(slug)
		const user = await this.userRepository.findOne(currentUserId, {
			relations: ['favorites'],
		})
		const articleIndex = user.favorites.findIndex(articleFavorites => articleFavorites.id === article.id)

		if (articleIndex >= 0) {
			user.favorites.splice(articleIndex, 1)
			article.favoritesCount--
			await this.userRepository.save(user)
			await this.articleRepository.save(article)
		}
		return article
	}

	async createComment(currentUser: UserEntity, slug: string, createCommentDto: CreateCommentDto): Promise<CommentEntity> {
		const errorResponse = {
			errors: {
				'comment': 'Article not found'
			}
		}
		const article = await this.findBySlug(slug)

		if (!article) {
			throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
		}

		const comment = new CommentEntity()
		Object.assign(comment, createCommentDto)
		comment.author = currentUser
		comment.article = article
		await this.articleRepository.save(article)
		await this.commentRepository.save(comment)
		return comment
	}

	async getCommentsBySlug(slug: string): Promise<CommentEntity[]> {
		const article = await this.findBySlug(slug)
		return article.comments
	}

	buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
		return { article }
	}

	buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
		return { comment }
	}

	buildCommentsResponse(comments: CommentEntity[]): CommentsResponseInterface {
		return { comments }
	}

	private getSlug(title: string): string {
		return slugify(title, { lower: true }) + '-' +
			((Math.random() * Math.pow(36, 6)) | 0).toString(36)
	}
}