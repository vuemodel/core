import { Model } from 'pinia-orm'
import { Attr, BelongsTo, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { User } from '../src/users'
import { Photo } from '../src/photos'
import albumsJson from './json/albums.json'
import { Form } from '@vuemodel/core'

export class Album extends Model {
  static entity = 'albums'

  @Uid() declare id: string

  @Attr() declare title: string

  @Attr() declare user_id: string
  @BelongsTo(() => User, 'user_id') declare user: User | null
  @HasMany(() => Photo, 'album_id') declare photos: Photo[]
}

export const albums: Form<Album>[] = albumsJson
