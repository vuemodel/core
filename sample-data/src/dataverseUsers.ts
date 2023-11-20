import { Model } from 'pinia-orm'
import { Attr, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { Album } from './albums'
import { Post } from './posts'
import { PiniaOrmForm } from 'pinia-orm-helpers'

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

  @Attr() declare album_id: string
  @HasMany(() => Album, 'user_id') declare albums: Album[]
  @HasMany(() => Post, 'user_id') declare posts: Post[]
}

export const dataverseUsers: PiniaOrmForm<DataverseUser>[] = [
  {
    userid: '1',
    tenant_id: '1',
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'Sincere@april.biz',
    phone: '1-770-736-8031 x56442',
    website: 'hildegard.org',
    age: 27,
  },
  {
    userid: '2',
    tenant_id: '1',
    name: 'Ervin Howell',
    username: 'Antonette',
    email: 'Shanna@melissa.tv',
    phone: '010-692-6593 x09125',
    website: 'anastasia.net',
    age: 41,
  },
  {
    userid: '3',
    tenant_id: '2',
    name: 'Clementine Bauch',
    username: 'Samantha',
    email: 'Nathan@yesenia.net',
    phone: '1-463-123-4447',
    website: 'ramiro.info',
    age: 54,
  },
  {
    userid: '4',
    tenant_id: '2',
    name: 'Patricia Lebsack',
    username: 'Karianne',
    email: 'Julianne.OConner@kory.org',
    phone: '493-170-9623 x156',
    website: 'kale.biz',
    age: 8,
  },
]
