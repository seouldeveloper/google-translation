google-translation
==============

Just Google translator module for node.js

## Installation

```js
$ npm install google-translation
```

## API

```js
var authObj = {
  apiKey: GOOGLE_TRANSLATE_API_KEY,
  jwtEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
  jwtKey: GOOGLE_SERIVCE_ACCOUNT_PRIVATE_KEY
};
var translator = require('google-translation.js').init(GOOGLE_TRANSLATE_API_KEY);
var obj = {
	text: '독도는 대한민국 영토 입니다.'
	target: 'en',
	model: 'nmt' // enum nmt|smt
};
translator.translate(obj, function(err, res) {
  console.log(err, res);
});
```

## Reference

Please refer to [this link](https://cloud.google.com/translate/docs/apis) for the more information.