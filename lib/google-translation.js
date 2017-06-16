var request = require('request'),
  http = require('http'),
  client = {}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('/tmp/google-translate');
}

exports.init = function(obj){
  client.jwtEmail = obj.jwtEmail;
  client.jwtKey = obj.jwtKey;
  client.apiKey = obj.apiKey;
  return client;
}

client.setApiKey = function(apiKey){
  client.apiKey = apiKey;
}

client.parseXHTMLString = function(text) {
  return text.replace(/&#39;/g,'\'')
             .replace(/&amp;/g,'&')
             .replace(/&quot;/g,'"')
             .replace(/&gt;/g,'>')
             .replace(/&lt;/g,'<')
             .replace(/"/g,'');
}

client.translate = function(obj, callback){
  var text   = obj.text;
  var source = obj.source.source_language;
  var target = obj.target;
  var url    = '';
  var requestModel = obj.model;
  var options = null;
  if (requestModel === "nmt") {
	  client.getToken(function(token) {
		  if(source) {
			  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&source=' + source + '&target=' + target + "&model=nmt";
		  } else {
			  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&target=' + target + "&model=nmt";
		  }
		  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&target=' + target + "&model=nmt";
		  options = {
			  url,
			  headers: {
				  'Authorization': 'Bearer ' + token
			  },
		  }

		  request(options, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				  var bodyObj = JSON.parse(body);
				  var refineObj = {
					  translatedText: client.parseXHTMLString(bodyObj.data.translations[0].translatedText),
					  detectedSourceLanguage: bodyObj.data.translations[0].detectedSourceLanguage
				  }
				  callback(obj, null, refineObj);
			  } else {
				  callback(obj, error, null);
			  }
		  })
	  });
  } else {
	  if(source) {
		  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&source=' + source + '&target=' + target + "&model=base";
	  } else {
		  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&target=' + target + "&model=base";
	  }
	  url = 'https://translation.googleapis.com/language/translate/v2?key=' + client.apiKey + '&q=' + encodeURI(text) + '&target=' + target + "&model=base";
	  options = {
		  url,
	  }

	  request(options, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			  var bodyObj = JSON.parse(body);
			  var refineObj = {
				  translatedText: client.parseXHTMLString(bodyObj.data.translations[0].translatedText),
				  detectedSourceLanguage: bodyObj.data.translations[0].detectedSourceLanguage
			  }
			  callback(obj, null, refineObj);
		  } else {
			  callback(obj, error, null);
		  }
	  })
  }
}

client.retrieveAccessToken = function(callback) {
	callback(localStorage.getItem("google_access_token"))
}

client.saveAccessToken = function(tokens) {
	localStorage.setItem("google_access_token", tokens.access_token);
	localStorage.setItem("google_expiry_date", tokens.expiry_date)
}

client.checkIfAccessTokenValidTime = function(callback) {

	var date = localStorage.getItem("google_expiry_date");
	if(date == null) {
		callback(false);
		return;
	}

	if(date < new Date().getTime()) {
		callback(false);
	} else {
		callback(true);
	}
}

client.getToken = function(callback){
	client.checkIfAccessTokenValidTime(function(isValid){
		if(isValid) {
			client.retrieveAccessToken(function(access_token) {
				callback(access_token);
			});
		} else {
			var google = require('googleapis');
			var jwtClient = new google.auth.JWT(
				client.jwtEmail,
				null,
				client.jwtKey,
				['https://www.googleapis.com/auth/cloud-platform'],
				null
			);

			jwtClient.authorize(function (err, tokens) {
				client.saveAccessToken(tokens);
				callback(tokens.access_token);
			});
		}
	})
}