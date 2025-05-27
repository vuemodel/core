import { Model } from 'pinia-orm'
import { Attr, BelongsTo } from 'pinia-orm/dist/decorators'
import { Form } from '@vuemodel/core'
import { Photo } from './photos'
import photoTagsJson from './json/photoTags.json'
import { Tag } from './tags'

export class PhotoTag extends Model {
  static entity = 'photo_tags'
  static primaryKey = ['photo_id', 'tag_id']

  @Attr() declare id: string

  @Attr() declare photo_id: string
  @Attr() declare tag_id: string

  @BelongsTo(() => Photo, 'photo_id') declare photo: Photo | null
  @BelongsTo(() => Tag, 'tag_id') declare tag: Tag | null
}

export const photoTags: Form<PhotoTag>[] = photoTagsJson
