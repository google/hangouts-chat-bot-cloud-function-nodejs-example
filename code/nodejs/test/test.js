const {describe, it} = require('mocha');
const {assert} = require('chai');
const bot = require('../src/bot/bot');

describe('Handler', () => {
  it('should return "Hello World!" card when called', (done) => {
    const returnMessage = {
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
                    text: 'This is capacity bot! We calculated 0.',
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
    };
    const returnStatus = '200';

    const req = {body: 'ping'};
    const res = {
      send: (message) => {
        assert.isObject(message);
        assert.deepEqual(message, returnMessage);
        done();
      },
      status: (status) => {
        assert.equal(status, returnStatus);
        done();
      },
    };

    bot.conversation(req, res);
  });
});