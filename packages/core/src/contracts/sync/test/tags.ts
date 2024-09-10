import { Model } from 'pinia-orm'
import { Attr, BelongsToMany, Uid } from 'pinia-orm/dist/decorators'
import { Photo } from './photos'
import { PhotoTag } from './photoTags'

export class Tag extends Model {
  static entity = 'tags'

  @Uid() declare id: string

  @Attr() declare name: string

  @BelongsToMany(() => Photo, () => PhotoTag, 'tag_id', 'photo_id') declare photos: Photo[]
}
