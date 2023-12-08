import { Model } from 'pinia-orm'
import { Attr, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { Album } from './albums'
import { Post } from './posts'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import dataverseUsersJson from './json/dataverseUsers.json'

export class DataverseUser extends Model {
  static entity = 'dataverse_users'
  static primaryKey = 'userid'

  @Uid() declare userid: string

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

export const dataverseUsers: PiniaOrmForm<DataverseUser>[] = dataverseUsersJson
