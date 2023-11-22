import { program } from 'commander'
import { create } from '@vuemodel/core'
import { Post } from '@vuemodel/sample-data'
import { setupVueModel } from './setupVueModel'

setupVueModel()

program
  .option('--title <title>', 'Post Title')
  .option('--body <body>', 'Posts Body')
  .parse()

const options = program.opts()

const response = await create(Post, options)

console.log(response.record)
