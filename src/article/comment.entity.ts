import { UserEntity } from '@app/user/user.entity';
import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity('comments')
export class CommentEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ default: '' })
	body: string

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	updatedAt: Date

	@BeforeUpdate()
	updateTimestamp() {
		this.updatedAt = new Date()
	}

	@ManyToOne(() => UserEntity, user => user.comments, { eager: true })
	author: UserEntity

	@ManyToOne(() => ArticleEntity, article => article.comments)
	article: ArticleEntity

}