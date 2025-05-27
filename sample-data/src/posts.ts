import { Model } from 'pinia-orm'
import { Attr, BelongsTo, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { User } from './users'
import { Comment } from './comments'
import { Form } from '@vuemodel/core'
import postsJson from './json/posts.json'

export class Post extends Model {
  static entity = 'posts'

  @Uid() declare id: string

  @Attr() declare tenant_id: string
  @Attr() declare title: string
  @Attr() declare body: string
  @Attr() declare created_at: string

  @Attr() declare user_id: string
  @BelongsTo(() => User, 'user_id') declare user: User | null
  @HasMany(() => Comment, 'post_id') declare comments: Comment[]
}

export const posts: Form<Post>[] = postsJson
