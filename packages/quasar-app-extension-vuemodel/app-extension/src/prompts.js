export default () => {
  return [
    {
      name: 'provider',
      type: 'list',
      message: "Select a driver (we recommend \"indexeddb\" if you're getting started)",
      choices: [
        {
          name: 'IndexedDB',
          value: {
            identifier: 'indexeddb',
            packageName: '@vueauth/indexeddb',
          },
        },
        {
          name: 'Orion (Laravel)',
          value: {
            identifier: 'orion',
            packageName: '@vuemodel/orion',
          },
        },
      ],
    },
  ]
}
