import { Model } from 'pinia-orm'
import { Attr, Str, Uid, BelongsTo } from 'pinia-orm/dist/decorators'
import { User } from 'src/models/User'

export class {{ resourceClass }} extends Model {
  static override entity = '{{ resourceTable }}'

  @Uid() declare id: string
  @Str(null) declare created_at: string
  @Str(null) declare updated_at: string

  // Fields
  @Attr() declare user_id: string
  @Attr() declare some_field: string // 🤿

  // Relationships
  @BelongsTo(() => User, 'user_id') declare user: User | null
  // @HasMany(() => TargetModel, '{{ resourceUnderscore }}_id'): declare target_models: TargetModel[]
}
