import { Model } from 'pinia-orm'

export class {{ resourceClass }} extends Model {
  static entity = '{{ resourceTable }}'

  static fields() {
    return {
      id: this.uid(),
      created_at: this.attr(null),
      updated_at: this.attr(null),

      // Fields
      owner_id: this.attr('owner_id'),
      some_field: this.attr(''), // 🤿

      // Relationships
      owner: this.belongsTo(User, 'owner_id'),
      // target_models: this.hasMany(TargetModel, '{{ resourceUnderscore }}_id'),
    }
  }
}
