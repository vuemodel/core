import { Model } from 'pinia-orm'

export class {{ resourceClass }} extends Model {
  static entity = '{{ resourceTable }}'

  static fields() {
    return {
      id: this.uid(),
      created_at: this.string(null),
      updated_at: this.string(null),

      // Fields
      user_id: this.attr('user_id'),
      some_field: this.attr(''), // 🤿

      // Relationships
      user: this.belongsTo(User, 'user_id'),
      // target_models: this.hasMany(TargetModel, '{{ resourceUnderscore }}_id'),
    }
  }
}
