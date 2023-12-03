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
    const link = '/' + file
    const linkSplit = file.split('/')
    const text = capitalCase(
      linkSplit[linkSplit.length - 1].replace('.md', '').slice(3)
    )

    return {
      link,
      text
    }
  })
}

const sidebarActions = makeSidebar(fastGlob.sync('actions/*.md'))
const sidebarComposables = makeSidebar(fastGlob.sync('composables/*.md'))
const sidebarArchitecture = makeSidebar(fastGlob.sync('architecture/*.md'))

export default defineConfig({
  vue: {
    script: {
      defineModel: true
    }
  },
  title: 'VueModel',
  head: [['script', { src: 'https://cdn.jsdelivr.net/npm/shiki' }]],
  base: '/core',
  themeConfig: {
    outline: [2,3],
    search: {
      provider: 'local'
    },
    sidebar: [
      {
        text: 'Getting Started',
        link: '/getting-started'
      },
      {
        text: 'Multiple Drivers',
        link: '/multiple-drivers'
      },
      {
        text: 'Composables',
        collapsed: true,
        items: sortByFileName(sidebarComposables)
      },
      {
        text: 'Actions',
        collapsed: true,
        items: sortByFileName(sidebarActions)
      },
      // {
      //   text: 'Architecture',
      //   collapsed: true,
      //   items: sortByFileName(sidebarArchitecture)
      // },
    ],
  },
})