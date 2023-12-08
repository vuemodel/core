import { Model } from 'pinia-orm'
import { Attr, BelongsTo } from 'pinia-orm/dist/decorators'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { Photo } from './photos'
import photoTagsJson from './json/photoTags.json'

export class PhotoTag extends Model {
  static entity = 'photo_tags'
  static primaryKey = ['photo_id', 'tag_id']

  @Attr() declare photo_id: string
  @Attr() declare tag_id: string

  @BelongsTo(() => Photo, 'photo_id') declare photo: Photo | null
}

export const photoTags: PiniaOrmForm<PhotoTag>[] = photoTagsJson
