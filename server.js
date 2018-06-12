const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs  = require('express-handlebars');
const passport = require('passport');
const path = require('path');
const flash    = require('connect-flash');
const lodash = require('lodash');


const port = process.env.PORT || 5000;

var handlebars = require('handlebars'),
      layouts = require('handlebars-layouts');  

handlebars.registerHelper(layouts(handlebars));

const app = express();

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const firm = require('./routes/firm');
const main = require('./routes/main');

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);
require('./config/passport')(passport);

const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        if_eq: function (a, b, opts) {
            if (a == b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        first_letter: function(a) {
            return a.charAt(0);
        },
        dateFormat: require('handlebars-dateformat')
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
	secret: 'W$q4=25*8%v-}UV',
	resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        maxAge: 1800000
    },
    name: "id",
    ttl: (1* 60* 60)
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/******** Routes *****/
app.use(index);
app.use(dashboard);
app.use(firm);
app.use(main);
/******** End  *******/
app.listen(port, () => console.log(`Server listening to port ${port}`));
