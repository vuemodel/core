import { Model } from 'pinia-orm'
import { Attr, BelongsTo, HasMany, Uid } from 'pinia-orm/dist/decorators'
import { User } from '../src/users'
import { Photo } from '../src/photos'
import { PiniaOrmForm } from 'pinia-orm-helpers'

export class Album extends Model {
  static entity = 'albums'

  @Uid() declare id: string

  @Attr() declare title: string

  @Attr() declare user_id: string
  @BelongsTo(() => User, 'user_id') declare user: User | null
  @HasMany(() => Photo, 'album_id') declare photos: Photo[]
}

export const albums: PiniaOrmForm<Album>[] = [
  {
    user_id: '1',
    id: '1',
    title: 'quidem molestiae enim',
  },
  {
    user_id: '1',
    id: '2',
    title: 'sunt qui excepturi placeat culpa',
  },
  {
    user_id: '1',
    id: '3',
    title: 'omnis laborum odio',
  },
  {
    user_id: '1',
    id: '4',
    title: 'non esse culpa molestiae omnis sed optio',
  },
  {
    user_id: '1',
    id: '5',
    title: 'eaque aut omnis a',
  },
  {
    user_id: '1',
    id: '6',
    title: 'natus impedit quibusdam illo est',
  },
  {
    user_id: '1',
    id: '7',
    title: 'quibusdam autem aliquid et et quia',
  },
  {
    user_id: '1',
    id: '8',
    title: 'qui fuga est a eum',
  },
  {
    user_id: '1',
    id: '9',
    title: 'saepe unde necessitatibus rem',
  },
  {
    user_id: '1',
    id: '10',
    title: 'distinctio laborum qui',
  },
  {
    user_id: '2',
    id: '11',
    title: 'quam nostrum impedit mollitia quod et dolor',
  },
  {
    user_id: '2',
    id: '12',
    title: 'consequatur autem doloribus natus consectetur',
  },
  {
    user_id: '2',
    id: '13',
    title: 'ab rerum non rerum consequatur ut ea unde',
  },
  {
    user_id: '2',
    id: '14',
    title: 'ducimus molestias eos animi atque nihil',
  },
  {
    user_id: '2',
    id: '15',
    title: 'ut pariatur rerum ipsum natus repellendus praesentium',
  },
  {
    user_id: '2',
    id: '16',
    title: 'voluptatem aut maxime inventore autem magnam atque repellat',
  },
  {
    user_id: '2',
    id: '17',
    title: 'aut minima voluptatem ut velit',
  },
  {
    user_id: '2',
    id: '18',
    title: 'nesciunt quia et doloremque',
  },
  {
    user_id: '2',
    id: '19',
    title: 'velit pariatur quaerat similique libero omnis quia',
  },
  {
    user_id: '2',
    id: '20',
    title: 'voluptas rerum iure ut enim',
  },
  {
    user_id: '3',
    id: '21',
    title: 'repudiandae voluptatem optio est consequatur rem in temporibus et',
  },
  {
    user_id: '3',
    id: '22',
    title: 'et rem non provident vel ut',
  },
  {
    user_id: '3',
    id: '23',
    title: 'incidunt quisquam hic adipisci sequi',
  },
  {
    user_id: '3',
    id: '24',
    title: 'dolores ut et facere placeat',
  },
  {
    user_id: '3',
    id: '25',
    title: 'vero maxime id possimus sunt neque et consequatur',
  },
  {
    user_id: '3',
    id: '26',
    title: 'quibusdam saepe ipsa vel harum',
  },
  {
    user_id: '3',
    id: '27',
    title: 'id non nostrum expedita',
  },
  {
    user_id: '3',
    id: '28',
    title: 'omnis neque exercitationem sed dolor atque maxime aut cum',
  },
  {
    user_id: '3',
    id: '29',
    title: 'inventore ut quasi magnam itaque est fugit',
  },
  {
    user_id: '3',
    id: '30',
    title: 'tempora assumenda et similique odit distinctio error',
  },
  {
    user_id: '4',
    id: '31',
    title: 'adipisci laborum fuga laboriosam',
  },
  {
    user_id: '4',
    id: '32',
    title: 'reiciendis dolores a ut qui debitis non quo labore',
  },
  {
    user_id: '4',
    id: '33',
    title: 'iste eos nostrum',
  },
  {
    user_id: '4',
    id: '34',
    title: 'cumque voluptatibus rerum architecto blanditiis',
  },
  {
    user_id: '4',
    id: '35',
    title: 'et impedit nisi quae magni necessitatibus sed aut pariatur',
  },
  {
    user_id: '4',
    id: '36',
    title: 'nihil cupiditate voluptate neque',
  },
  {
    user_id: '4',
    id: '37',
    title: 'est placeat dicta ut nisi rerum iste',
  },
  {
    user_id: '4',
    id: '38',
    title: 'unde a sequi id',
  },
  {
    user_id: '4',
    id: '39',
    title: 'ratione porro illum labore eum aperiam sed',
  },
  {
    user_id: '4',
    id: '40',
    title: 'voluptas neque et sint aut quo odit',
  },
  {
    user_id: '5',
    id: '41',
    title: 'ea voluptates maiores eos accusantium officiis tempore mollitia consequatur',
  },
  {
    user_id: '5',
    id: '42',
    title: 'tenetur explicabo ea',
  },
  {
    user_id: '5',
    id: '43',
    title: 'aperiam doloremque nihil',
  },
  {
    user_id: '5',
    id: '44',
    title: 'sapiente cum numquam officia consequatur vel natus quos suscipit',
  },
  {
    user_id: '5',
    id: '45',
    title: 'tenetur quos ea unde est enim corrupti qui',
  },
  {
    user_id: '5',
    id: '46',
    title: 'molestiae voluptate non',
  },
  {
    user_id: '5',
    id: '47',
    title: 'temporibus molestiae aut',
  },
  {
    user_id: '5',
    id: '48',
    title: 'modi consequatur culpa aut quam soluta alias perspiciatis laudantium',
  },
  {
    user_id: '5',
    id: '49',
    title: 'ut aut vero repudiandae voluptas ullam voluptas at consequatur',
  },
  {
    user_id: '5',
    id: '50',
    title: 'sed qui sed quas sit ducimus dolor',
  },
  {
    user_id: '6',
    id: '51',
    title: 'odit laboriosam sint quia cupiditate animi quis',
  },
  {
    user_id: '6',
    id: '52',
    title: 'necessitatibus quas et sunt at voluptatem',
  },
  {
    user_id: '6',
    id: '53',
    title: 'est vel sequi voluptatem nemo quam molestiae modi enim',
  },
  {
    user_id: '6',
    id: '54',
    title: 'aut non illo amet perferendis',
  },
  {
    user_id: '6',
    id: '55',
    title: 'qui culpa itaque omnis in nesciunt architecto error',
  },
  {
    user_id: '6',
    id: '56',
    title: 'omnis qui maiores tempora officiis omnis rerum sed repellat',
  },
  {
    user_id: '6',
    id: '57',
    title: 'libero excepturi voluptatem est architecto quae voluptatum officia tempora',
  },
  {
    user_id: '6',
    id: '58',
    title: 'nulla illo consequatur aspernatur veritatis aut error delectus et',
  },
  {
    user_id: '6',
    id: '59',
    title: 'eligendi similique provident nihil',
  },
  {
    user_id: '6',
    id: '60',
    title: 'omnis mollitia sunt aliquid eum consequatur fugit minus laudantium',
  },
  {
    user_id: '7',
    id: '61',
    title: 'delectus iusto et',
  },
  {
    user_id: '7',
    id: '62',
    title: 'eos ea non recusandae iste ut quasi',
  },
  {
    user_id: '7',
    id: '63',
    title: 'velit est quam',
  },
  {
    user_id: '7',
    id: '64',
    title: 'autem voluptatem amet iure quae',
  },
  {
    user_id: '7',
    id: '65',
    title: 'voluptates delectus iure iste qui',
  },
  {
    user_id: '7',
    id: '66',
    title: 'velit sed quia dolor dolores delectus',
  },
  {
    user_id: '7',
    id: '67',
    title: 'ad voluptas nostrum et nihil',
  },
  {
    user_id: '7',
    id: '68',
    title: 'qui quasi nihil aut voluptatum sit dolore minima',
  },
  {
    user_id: '7',
    id: '69',
    title: 'qui aut est',
  },
  {
    user_id: '7',
    id: '70',
    title: 'et deleniti unde',
  },
  {
    user_id: '8',
    id: '71',
    title: 'et vel corporis',
  },
  {
    user_id: '8',
    id: '72',
    title: 'unde exercitationem ut',
  },
  {
    user_id: '8',
    id: '73',
    title: 'quos omnis officia',
  },
  {
    user_id: '8',
    id: '74',
    title: 'quia est eius vitae dolor',
  },
  {
    user_id: '8',
    id: '75',
    title: 'aut quia expedita non',
  },
  {
    user_id: '8',
    id: '76',
    title: 'dolorem magnam facere itaque ut reprehenderit tenetur corrupti',
  },
  {
    user_id: '8',
    id: '77',
    title: 'cupiditate sapiente maiores iusto ducimus cum excepturi veritatis quia',
  },
  {
    user_id: '8',
    id: '78',
    title: 'est minima eius possimus ea ratione velit et',
  },
  {
    user_id: '8',
    id: '79',
    title: 'ipsa quae voluptas natus ut suscipit soluta quia quidem',
  },
  {
    user_id: '8',
    id: '80',
    title: 'id nihil reprehenderit',
  },
  {
    user_id: '9',
    id: '81',
    title: 'quibusdam sapiente et',
  },
  {
    user_id: '9',
    id: '82',
    title: 'recusandae consequatur vel amet unde',
  },
  {
    user_id: '9',
    id: '83',
    title: 'aperiam odio fugiat',
  },
  {
    user_id: '9',
    id: '84',
    title: 'est et at eos expedita',
  },
  {
    user_id: '9',
    id: '85',
    title: 'qui voluptatem consequatur aut ab quis temporibus praesentium',
  },
  {
    user_id: '9',
    id: '86',
    title: 'eligendi mollitia alias aspernatur vel ut iusto',
  },
  {
    user_id: '9',
    id: '87',
    title: 'aut aut architecto',
  },
  {
    user_id: '9',
    id: '88',
    title: 'quas perspiciatis optio',
  },
  {
    user_id: '9',
    id: '89',
    title: 'sit optio id voluptatem est eum et',
  },
  {
    user_id: '9',
    id: '90',
    title: 'est vel dignissimos',
  },
  {
    user_id: '10',
    id: '91',
    title: 'repellendus praesentium debitis officiis',
  },
  {
    user_id: '10',
    id: '92',
    title: 'incidunt et et eligendi assumenda soluta quia recusandae',
  },
  {
    user_id: '10',
    id: '93',
    title: 'nisi qui dolores perspiciatis',
  },
  {
    user_id: '10',
    id: '94',
    title: 'quisquam a dolores et earum vitae',
  },
  {
    user_id: '10',
    id: '95',
    title: 'consectetur vel rerum qui aperiam modi eos aspernatur ipsa',
  },
  {
    user_id: '10',
    id: '96',
    title: 'unde et ut molestiae est molestias voluptatem sint',
  },
  {
    user_id: '10',
    id: '97',
    title: 'est quod aut',
  },
  {
    user_id: '10',
    id: '98',
    title: 'omnis quia possimus nesciunt deleniti assumenda sed autem',
  },
  {
    user_id: '10',
    id: '99',
    title: 'consectetur ut id impedit dolores sit ad ex aut',
  },
  {
    user_id: '10',
    id: '100',
    title: 'enim repellat iste',
  },
]
