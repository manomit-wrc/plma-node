const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs  = require('express-handlebars');
const passport = require('passport');
const path = require('path');
const flash    = require('connect-flash');
const lodash = require('lodash');
const ActivityBudget = require('./models').activity_budget;



const port = process.env.PORT || 5000;

var handlebars = require('handlebars'),
layouts = require('handlebars-layouts');

handlebars.registerHelper(layouts(handlebars));

const app = express();

const index = require('./routes/index');
const dashboard = require('./routes/dashboard');
const firm = require('./routes/firm');
const main = require('./routes/main');
const employee = require('./routes/employee');
const activity_goal = require('./routes/activity_goal');
const financial_goal = require('./routes/financial_goal');
const target = require('./routes/target');
const activity = require('./routes/activity');
const master_contact = require('./routes/master_contact');
const referral = require('./routes/referral');

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



        inArray: function(array, value, block) {
          if (array.indexOf(value) !== -1) {
            return block.fn(this);
        }
        else {
          return block.inverse(this);
        }
    },
    get_parent_head: function(value, array) {
        var parent_category = lodash.filter(array, arr => arr.id === value);
        if (parent_category[0].parent_id == "0") {
            return "N/A";
        }
        else {
            var parent_category_name = lodash.filter(array, arr => arr.id === parent_category[0].parent_id);
            return parent_category_name[0].name;
        }
    },
    get_budget_value: async function(value) {
        const data = await ActivityBudget.findAll({
            where: {
                budget_id: value
            }
        });
       return data;
    },
    get_promise: function(data) {
        console.log(data);
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
app.use(employee);
app.use(activity_goal);
app.use(financial_goal);
app.use(target);
app.use(activity);
app.use(master_contact);
app.use(referral);
/********** End **********/
app.listen(port, () => console.log(`Server listening to port ${port}`));
