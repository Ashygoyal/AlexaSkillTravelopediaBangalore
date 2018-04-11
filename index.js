// 1. Text strings =====================================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

var languageStrings = {
    'en': {
        'translation': {
            'WELCOME' : "Welcome to Bangalore Guide!",
            'HELP'    : "Say about, to hear more about the city, or say coffee, breakfast, lunch or dinner, to hear local restaurant suggestions, or say recommend an attraction, or say, go outside. ",
            'ABOUT'   : "Bangalore, officially known as Bengaluru, is the capital and largest city of the Indian state of Karnataka.",
            'STOP'    : "Okay, see you next time!"
        }
    }
    // , 'de-DE': { 'translation' : { 'TITLE'   : "Local Helfer etc." } }
};
var data = {
    "city"        : "Bangalore",
    "state"       : "Karnataka",
    "postcode"    : "560103",
    "restaurants" : [
        { "name":"Koramangala Social",
            "address":"118, Koramangala Industrial Area, Koramangala 7th Block, Bangalore", "phone": "080-6565-1595",
            "meals": "breakfast, coffee",
            "description": "A very happening place in the heart of Koramangala. Try the Dhingra's Punjabi breakfast!"
        },
        { "name":"The Hole in The Wall Cafe",
            "address":"4, 8th Main Road, Koramangala 4th Block, Bangalore", "phone": "080-40-9494-90",
            "meals": "coffee, breakfast, lunch",
            "description": "A book lover's paradise, an art lover's solace, a music lover's melody and a foodie's foodgasm. Try the American breakfast or the All English breakfast."
        },
        { "name":"Truffles",
            "address":"28, 4th 'B' Cross, Koramangala 5th Block, Bangalore", "phone": "080-4965-2818",
            "meals": "breakfast, lunch",
            "description": "They serve the best burgers in town. Try the All American Cheese Burger and the Ferrero Rocher Shake."
        },
        { "name":"Absolute Barbecues",
            "address":"2nd Floor,I20-A2, EPIP Zone, Near Vydehi Hospital Whitefield, Bangalore", "phone": "080-307-527-96",
            "meals": "lunch, dinner",
            "description": "Serving the best barbecues and buffets in town. There is something here, for everyone."
        },
        { "name":"Big Brewsky",
            "address":"Behind MK Retail, Before WIPRO Corporate Office, Sarjapur Road, Bangalore", "phone": "080-3951-4766",
            "meals": "lunch, dinner",
            "description": "This place is perfect combination of vibrant ambience, good food, some extraordinary cocktails and shots."
        },
        { "name":"Chianti",
            "address":"178 Washington Street", "phone": "080-4113-2021",
            "meals": "dinner, lunch",
            "description": "A must visit for the thin crust pizza lovers. Their range of pasta and pizzas along with the sides certainly qualifies for authentic Italian experience."
        },

    ],
    "attractions":[
        {
            "name": "Bannerghatta National Park",
            "description": "It is a popular tourist destination with a zoo, a pet corner, an animal rescue centre, a butterfly enclosure, an aquarium, a snake house and a safari park. There are ancient temples in the park for worship and it is a destination for trekking and hiking.",
            "distance": "0"
        },
        {
            "name": "Tipu Sultan's Summer Palace",
            "description": "Built in 1791, it is an example of Indo-Islamic architecture and was the summer residence of the Mysorean ruler Tipu Sultan.",
            "distance": "2"
        },
        {
            "name": "Wonderla Amusement Park and Resort",
            "description": "The park features a wide variety of attractions including 55 land and water rides, a musical fountain and laser shows, and a virtual reality show.",
            "distance": "4"
        },
        {
            "name": "Bangalore Palace",
            "description": "Folks who seek to experience the classic royal charm of Bangalore can head over to one of its older landmarks, the sprawling Tudor-inspired estate of Bangalore Palace. The palace was built in the year 1887 by King Chamaraja Wadiyar and is today open to the public who come to witness the lavish and elegant splendour of one of South India’s most enduring dynasties.",
            "distance": "38"
        }
    ]
}

// Weather courtesy of the Yahoo Weather API.
// This free API recommends no more than 2000 calls per day

var myAPI = {
    host: 'query.yahooapis.com',
    port: 443,
    path: `/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${encodeURIComponent(data.city)}%2C%20${data.state}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`,
    method: 'GET'
};
// 2. Skill Code =======================================================================================================

var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);

    // alexa.appId = 'amzn1.echo-sdk-ams.app.1234';
    ///alexa.dynamoDBTableName = 'YourTableName'; // creates new table for session.attributes
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        var say = this.t('WELCOME') + ' ' + this.t('HELP');
        this.emit(':ask', say, say);
    },

    'AboutIntent': function () {
        this.emit(':tell', this.t('ABOUT'));
    },

    'CoffeeIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('coffee'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'For a great coffee shop, I recommend, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'BreakfastIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('breakfast'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'For breakfast, try this, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'LunchIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('lunch'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'Lunch time! Here is a good spot. ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'DinnerIntent': function () {
        var restaurant = randomArrayElement(getRestaurantsByMeal('dinner'));
        this.attributes['restaurant'] = restaurant.name;

        var say = 'Enjoy dinner at, ' + restaurant.name + '. Would you like to hear more?';
        this.emit(':ask', say);
    },

    'AMAZON.YesIntent': function () {
        var restaurantName = this.attributes['restaurant'];
        var restaurantDetails = getRestaurantByName(restaurantName);

        var say = restaurantDetails.name
            + ' is located at ' + restaurantDetails.address
            + ', the phone number is ' + restaurantDetails.phone
            + ', and the description is, ' + restaurantDetails.description
            + '  I have sent these details to the Alexa App on your phone.  Enjoy your meal! <say-as interpret-as="interjection">bon appetit</say-as>' ;

        var card = restaurantDetails.name + '\n' + restaurantDetails.address + '\n'
            + data.city + ', ' + data.state + ' ' + data.postcode
            + '\nphone: ' + restaurantDetails.phone + '\n';

        this.emit(':tellWithCard', say, restaurantDetails.name, card);

    },

    'AttractionIntent': function () {
        var distance = 200;
        if (this.event.request.intent.slots.distance.value) {
            distance = this.event.request.intent.slots.distance.value;
        }

        var attraction = randomArrayElement(getAttractionsByDistance(distance));

        var say = 'Try '
            + attraction.name + ', which is '
            + (attraction.distance == "0" ? 'right downtown. ' : attraction.distance + ' miles away. Have fun! ')
            + attraction.description;

        this.emit(':tell', say);
    },

    'GoOutIntent': function () {

        getWeather( ( localTime, currentTemp, currentCondition) => {
            // time format 10:34 PM
            // currentTemp 72
            // currentCondition, e.g.  Sunny, Breezy, Thunderstorms, Showers, Rain, Partly Cloudy, Mostly Cloudy, Mostly Sunny

            // sample API URL for Irvine, CA
            // https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22irvine%2C%20ca%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys

            this.emit(':tell', 'It is ' + localTime
                + ' and the weather in ' + data.city
                + ' is '
                + currentTemp + ' and ' + currentCondition);

            // TODO
            // Decide, based on current time and weather conditions,
            // whether to go out to a local beach or park;
            // or recommend a movie theatre; or recommend staying home


        });
    },

    'AMAZON.NoIntent': function () {
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t('HELP'));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP'));
    }

};

//    END of Intent Handlers {} ========================================================================================
// 3. Helper Function  =================================================================================================

function getRestaurantsByMeal(mealtype) {

    var list = [];
    for (var i = 0; i < data.restaurants.length; i++) {

        if(data.restaurants[i].meals.search(mealtype) >  -1) {
            list.push(data.restaurants[i]);
        }
    }
    return list;
}

function getRestaurantByName(restaurantName) {

    var restaurant = {};
    for (var i = 0; i < data.restaurants.length; i++) {

        if(data.restaurants[i].name == restaurantName) {
            restaurant = data.restaurants[i];
        }
    }
    return restaurant;
}

function getAttractionsByDistance(maxDistance) {

    var list = [];

    for (var i = 0; i < data.attractions.length; i++) {

        if(parseInt(data.attractions[i].distance) <= maxDistance) {
            list.push(data.attractions[i]);
        }
    }
    return list;
}

function getWeather(callback) {
    var https = require('https');


    var req = https.request(myAPI, res => {
        res.setEncoding('utf8');
        var returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });
        res.on('end', () => {
            var channelObj = JSON.parse(returnData).query.results.channel;

            var localTime = channelObj.lastBuildDate.toString();
            localTime = localTime.substring(17, 25).trim();

            var currentTemp = channelObj.item.condition.temp;

            var currentCondition = channelObj.item.condition.text;

            callback(localTime, currentTemp, currentCondition);

        });

    });
    req.end();
}
function randomArrayElement(array) {
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
