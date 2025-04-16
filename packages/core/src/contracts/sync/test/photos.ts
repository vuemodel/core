import { Model } from 'pinia-orm'
import { Attr, BelongsTo, BelongsToMany, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { Album } from './albums'
import { PhotoTag } from './photoTags'
import { Tag } from './tags'

export class Photo extends Model {
  static entity = 'photos'

  @Uid() declare id: string

  @Attr() declare title: string
  @Attr() declare url: string
  @Attr() declare thumbnailUrl: string

  @Attr() declare album_id: string
  @BelongsTo(() => Album, 'album_id') declare album: Album | null
  @HasMany(() => PhotoTag, 'photo_id') declare photo_tags: PhotoTag | null
  @BelongsToMany(() => Tag, () => PhotoTag, 'photo_id', 'tag_id') declare tags: Tag[]
}
