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
    {
      message: 'Automatic Setup',
      type: 'checkbox',
      name: 'setup',
      choices: [
        {
          name: 'register boot file (quasar.conf)',
          description: 'injects the "vuemodel" boot file into quasar.conf > boot',
          value: 'registerBootFile',
          checked: true,
        },
      ],
    },
  ]
}
