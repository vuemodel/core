import { Model } from 'pinia-orm'
import { Attr, BelongsToMany, Uid } from 'pinia-orm/dist/decorators'
import { Photo } from '../src/photos'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import tagsJson from './json/tags.json'
import { PhotoTag } from './photoTags'

export class Tag extends Model {
  static entity = 'tags'

  @Uid() declare id: string

  @Attr() declare name: string
  @Attr() declare color: string

  @BelongsToMany(() => Photo, () => PhotoTag, 'tag_id', 'photo_id') declare photos: Photo[]
}

export const tags: PiniaOrmForm<Tag>[] = tagsJson
