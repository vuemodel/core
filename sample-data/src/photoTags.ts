import { Model } from 'pinia-orm'
import { Attr, BelongsTo } from 'pinia-orm/dist/decorators'
import { PiniaOrmForm } from 'pinia-orm-helpers'
import { Photo } from './photos'

export class PhotoTag extends Model {
  static entity = 'photo_tags'
  static primaryKey = ['photo_id', 'tag_id']

  @Attr() declare photo_id: string
  @Attr() declare tag_id: string

  @BelongsTo(() => Photo, 'photo_id') declare photo: Photo | null
}

export const photoTags: PiniaOrmForm<PhotoTag>[] = [
  {
    photo_id: '1',
    tag_id: '1',
  },
  {
    photo_id: '1',
    tag_id: '2',
  },
  {
    photo_id: '2',
    tag_id: '1',
  },
  {
    photo_id: '4',
    tag_id: '1',
  },
  {
    photo_id: '4',
    tag_id: '3',
  },
  {
    photo_id: '4',
    tag_id: '4',
  },
  {
    photo_id: '5',
    tag_id: '2',
  },
  {
    photo_id: '6',
    tag_id: '5',
  },
  {
    photo_id: '7',
    tag_id: '1',
  },
  {
    photo_id: '7',
    tag_id: '3',
  },
  {
    photo_id: '8',
    tag_id: '3',
  },
  {
    photo_id: '10',
    tag_id: '2',
  },
  {
    photo_id: '10',
    tag_id: '5',
  },
  {
    photo_id: '11',
    tag_id: '2',
  },
  {
    photo_id: '11',
    tag_id: '4',
  },
  {
    photo_id: '12',
    tag_id: '1',
  },
  {
    photo_id: '13',
    tag_id: '1',
  },
  {
    photo_id: '14',
    tag_id: '3',
  },
]
