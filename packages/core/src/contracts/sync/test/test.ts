/* eslint-disable @typescript-eslint/no-unused-vars */
import { Sync } from '../Sync'
import { Tag } from './tags'
import { User } from './users'
import { Album } from './albums'
import { PiniaOrmManyRelationsForm } from '../../../types/PiniaOrmManyRelationsForm'

const relationsForm: PiniaOrmManyRelationsForm<Album> = {
  photos: {
    2: { blah: 'k' },
  },
}
