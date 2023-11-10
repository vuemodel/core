// Sample data from https://jsonplaceholder.typicode.com/
import { users, User } from './users'
import { albums, Album } from './albums'
import { comments, Comment } from './comments'
import { photos, Photo } from './photos'
import { posts, Post } from './posts'
import { populateRecords } from '../helpers/populateRecords'

export {
  users,
  User,
  albums,
  Album,
  comments,
  Comment,
  photos,
  Photo,
  posts,
  Post,
  // helpers
  populateRecords,
}

export const exampleDataMap = {
  albums: {
    modelClass: Album,
    records: albums,
  },
  comments: {
    modelClass: Comment,
    records: comments,
  },
  photos: {
    modelClass: Photo,
    records: photos,
  },
  posts: {
    modelClass: Post,
    records: posts,
  },
  users: {
    modelClass: User,
    records: users,
  },
}
