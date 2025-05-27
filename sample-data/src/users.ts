import { Model } from 'pinia-orm'
import { Attr, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { Album } from './albums'
import { Post } from './posts'
import usersJson from './json/users.json'
import { Form } from '@vuemodel/core'

export class User extends Model {
  static entity = 'users'

  @Uid() declare id: string

  @Attr() declare name: string
  @Attr() declare tenant_id: string
  @Attr() declare username: string
  @Attr() declare email: string
  @Attr() declare phone: string
  @Attr() declare website: string
  @Attr() declare age: number

  @HasMany(() => Album, 'user_id') declare albums: Album[]
  @HasMany(() => Post, 'user_id') declare posts: Post[]
}

export const users: Form<User>[] = usersJson
