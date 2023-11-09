import { defineConfig } from 'vitepress'
import fastGlob from 'fast-glob'
import { capitalCase } from 'change-case'

function sortByFileName(array) {
  return array.sort((a, b) => {
    let numA = parseInt(a.text.split('-')[0]);
    let numB = parseInt(b.text.split('-')[0]);

    return numA - numB;
  });
}

function makeSidebar(files: string[]) {
  return files.map(file => {
    const link = file
    const linkSplit = file.split('/')
    const text = capitalCase(
      linkSplit[linkSplit.length - 1].replace('.md', '').slice(3)
    )

    console.log(link)
  
    return {
      link,
      text
    }
  })
}

const sidebarActions = makeSidebar(fastGlob.sync('packages/core/src/actions/*.md'))
const sidebarComposables = makeSidebar(fastGlob.sync('packages/core/src/composables/*.md'))

export default defineConfig({
  title: 'Augment Quasar',
  rewrites: {
    'packages/core/src/:parentPath/:actionKebab': ':parentPath/:actionKebab',
    'docs/:parentPath/:actionKebab': ':parentPath/:actionKebab',
    'docs/:parentPath': ':parentPath',
  },
  srcDir: '../',
  dir: '../',
  head: [['script', { src: 'https://cdn.jsdelivr.net/npm/shiki' }]],
  themeConfig: {
    outline: [2,3],
    sidebar: [
      {
        text: 'Actions',
        collapsed: true,
        items: sortByFileName(sidebarActions)
      },
      {
        text: 'Composables',
        collapsed: true,
        items: sortByFileName(sidebarComposables)
      }
    ],
  },
})