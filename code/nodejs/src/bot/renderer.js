const helloWorld = (req, nbr) => ({
  cards: [
    {
      header: {
        title: 'Hello World!',
      },
      sections: [
        {
          'widgets': [
            {
              textParagraph: {
                text: `This is capacity bot! We calculated ${nbr}.`,
              },
            },
            {
              image: {
                imageUrl: 'https://cdn.pixabay.com/photo/2017/10/24/00/39/bot-icon-2883144_640.png',
              },
            },
          ],
        },
      ],
    },
  ],
});

const configureOAuth = (req, authURL) => ({
  'actionResponse': {
    'type': 'REQUEST_CONFIG',
    'url': authURL,
  },
});

module.exports = {
  configureOAuth,
  helloWorld,
};