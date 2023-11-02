import { IndexResourcesOptions } from './IndexResources'
import { Post } from 'sample-data'
import { IndexResourcesFilters } from './IndexResourcesFilters'

const options: IndexResourcesOptions<typeof Post> = {
  includes: {
    comments: {
      _sortBy: [
        { field: 'name', direction: 'descending' },
      ],
      _limit: 15,
    },
  },
  sortBy: [
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

const options2: IndexResourcesOptions<typeof Post> = {
  includes: {
    comments: {
      _sortBy: [
        { field: 'name', direction: 'descending' },
      ],
      _limit: 15,
    },
  },
}

console.log(options2)

const filters: IndexResourcesFilters<typeof Post> = {
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
