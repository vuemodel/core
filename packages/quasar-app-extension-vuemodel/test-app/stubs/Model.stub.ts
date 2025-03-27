import { Model } from 'pinia-orm'
import { Attr, Uid, BelongsTo } from 'pinia-orm/dist/decorators'
import { User } from 'src/models/User'

export class {{ resourceClass }} extends Model {
  static override entity = '{{ resourceTable }}'

  @Uid() declare id: string
  @Attr(null) declare created_at: number
  @Attr(null) declare updated_at: number

  // Fields
  @Attr() declare owner_id: string
  @Attr() declare some_field: string

  // Relationships
  @BelongsTo(() => User, 'owner_id') declare owner: User | null
  // @HasMany(() => TargetModel, '{{ resourceUnderscore }}_id'): declare target_models: TargetModel[]
}
