import { FollowEntity } from '@app/profile/follow.entity';
import { UserEntity } from '@app/user/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleController } from './article.controller';
import { ArticleEntity } from './article.entity';
import { ArticleService } from './article.service';
import { CommentEntity } from './comment.entity';

@Module({
	imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity, FollowEntity, CommentEntity])],
	controllers: [ArticleController],
	providers: [ArticleService]
})
export class ArticleModule { }