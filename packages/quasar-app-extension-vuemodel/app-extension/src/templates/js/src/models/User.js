import { Model } from 'pinia-orm'

export class User extends Model {
  static entity = 'users'

  static fields () {
    return {
      id: this.uid(),
      created_at: this.string(null),
      updated_at: this.string(null),

      // Fields
      name: this.string(null),
      email: this.string(null),
      // 🤿
    }
  }
}
