import { Model } from 'pinia-orm'
import { Str, Uid } from 'pinia-orm/decorators'

export class User extends Model {
  // entity is a required property for all models.
  static override entity = 'users'

  @Uid() declare id: string
  @Str(null) declare created_at: string
  @Str(null) declare updated_at: string

  @Str(null) declare name: string
  @Str(null) declare email: string
  // 🤿
}
