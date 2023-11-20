import { IndexOptions } from './Index'
import { Post } from '@vuemodel/sample-data'
import { IndexFilters } from './IndexFilters'

const options: IndexOptions<typeof Post> = {
  with: {
    comments: {
      _orderBy: [
        { field: 'name', direction: 'descending' },
      ],
      _limit: 15,
    },
  },
  orderBy: [
    { field: 'sdfg', direction: 'ascending' },
  ],
  filters: {
    body: {
      contains: 'blah',
    },
    comments: {
      post: {
        user: {
          age: {
            greaterThan: 18,
          },
        },
      },
    },
    or: [
      {
        created_at: {
          greaterThan: '2023-08-02',
        },
      },
      {
        user_id: {
          equals: '1',
        },
      },
    ],
  },
}

console.log(options)

const options2: IndexOptions<typeof Post> = {
  with: {
    comments: {
      _orderBy: [
        { field: 'name', direction: 'descending' },
      ],
      _limit: 15,
    },
  },
}

console.log(options2)

const filters: IndexFilters<Post> = {
  body: {
    contains: 'blah',
  },
  comments: {
    post: {
      user: {
        age: {
          greaterThan: 18,
        },
      },
    },
  },
  or: [
    {
      created_at: {
        greaterThan: '2023-08-02',
      },
    },
    {
      user_id: {
        equals: '1',
      },
    },
  ],
}

console.log(filters)
