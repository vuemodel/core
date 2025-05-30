import { Model } from 'pinia-orm'
import { Attr, BelongsTo, Uid } from 'pinia-orm/dist/decorators'
import { Post } from './posts'
import { Form } from '@vuemodel/core'
import commentsJson from './json/comments.json'

export class Comment extends Model {
  static entity = 'comments'

  @Uid() declare id: string

  @Attr() declare commented_on: string
  @Attr() declare name: string
  @Attr() declare email: string
  @Attr() declare body: string

  @Attr() declare post_id: string
  @BelongsTo(() => Post, 'post_id') declare post: Post | null
}

export const comments: Form<Comment>[] = commentsJson
