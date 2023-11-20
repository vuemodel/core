// Sample data from https://jsonplaceholder.typicode.com/
import { users, User } from './users'
import { albums, Album } from './albums'
import { comments, Comment } from './comments'
import { photos, Photo } from './photos'
import { posts, Post } from './posts'
import { PhotoTag, photoTags } from './photoTags'
import { DataverseUser, dataverseUsers } from './dataverseUsers'
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
  PhotoTag,
  photoTags,
  DataverseUser,
  dataverseUsers,
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
  photo_tags: {
    modelClass: PhotoTag,
    records: photoTags,
  },
  dataverse_users: {
    modelClass: DataverseUser,
    records: dataverseUsers,
  },
}
