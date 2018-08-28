const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');
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
const attorney = require('./routes/attorney');
const budget_report = require('./routes/budget_report');
const forgot_password = require('./routes/forgot_password');
const activity_approvals = require('./routes/activity-approval');

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};
app.use(allowCrossDomain);
require('./config/passport')(passport);

const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        couunt: function(count,opts) {
            if (count>0) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        if_eq: function(a, b, opts) {
            if (a == b)
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        noop: function(options) {
            return options.fn(this)
        },
        if_con: function(a, opts) {
            if (a)
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        math: function(lvalue, operator, rvalue) {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            return {
                "+": lvalue + rvalue,
                "-": lvalue - rvalue,
                "*": lvalue * rvalue,
                "/": lvalue / rvalue,
                "%": lvalue % rvalue
            }[operator];
        },
        times: function(n, block) {
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        },

        first_letter: function(a) {
            return a.charAt(0);
        },

        inArray: function(array, value, block) {
            if (array.indexOf(value) !== -1) {
                return block.fn(this);
            } else {
                return block.inverse(this);
            }
        },
        inArrayCustom: function(array, value, type, block) {
            var filter = lodash.filter(array, arr => arr.id === value && arr.type === type);
            if (!!filter.length) {
                return block.fn(this);
            } else {
                return block.inverse(this);
            }
        },
        get_parent_head: function(value, array) {
            var parent_category = lodash.filter(array, arr => arr.id === value);
            if (parent_category[0].parent_id == "0") {
                return "N/A";
            } else {
                var parent_category_name = lodash.filter(array, arr => arr.id === parent_category[0].parent_id);
                return parent_category_name[0].name;
            }
        },
        if_eq_budget: function(a, b, opts) {
            if (a == b.activity_goal_id) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        },
        get_budget_hour: function(value, obj) {
            var x = 0;
            const hour = lodash.filter(obj, arr => arr.activity_goal_id === value)
            if (hour.length > 0) {
                const total_hour = lodash.map(hour, arr => x + parseInt(arr.hour));
                return total_hour[0];
            } else {
                return "-";
            }
        },
        get_budget_amount: function(value, obj) {
            var x = 0;
            const amount = lodash.filter(obj, arr => arr.activity_goal_id === value)
            if (amount.length > 0) {
                const total_amount = lodash.map(amount, arr => x + parseInt(arr.amount));
                return total_amount[0];
            } else {
                return "-";
            }
        },
        get_activity_budget_hour: function(value, obj) {
            const hour = lodash.filter(obj, arr => arr.activity_id === value)
            if (hour.length > 0) {
                const total_hour = lodash.map(hour, arr => parseInt(arr.hour));
                return total_hour[0];
            } else {
                return "-";
            }
        },
        get_activity_budget_amount: function(value, obj) {
            const amount = lodash.filter(obj, arr => arr.activity_id === value)
            if (amount.length > 0) {
                const total_amount = lodash.map(amount, arr => parseInt(arr.amount));
                return total_amount[0];
            } else {
                return "-";
            }
        },
        get_activity_budget_hour_indi: function(count, value, obj) {
            const hour = lodash.filter(obj, arr => arr.activity_id === value)
            if (hour.length > 0) {
                const total_hour = lodash.map(hour, arr => parseInt(arr.hour));
                return (total_hour[0] * count).toFixed(2);
            } else {
                return "-";
            }
        },
        get_activity_budget_amount_indi: function(count, value, obj) {
            const amount = lodash.filter(obj, arr => arr.activity_id === value)
            if (amount.length > 0) {
                const total_amount = lodash.map(amount, arr => parseInt(arr.amount));
                return (total_amount[0] * count).toFixed(2);
            } else {
                return "-";
            }
        },
        get_activity_budget_hour_equal: function(count, value, obj) {
            const hour = lodash.filter(obj, arr => arr.activity_id === value)
            if (hour.length > 0) {
                const total_hour = lodash.map(hour, arr => parseInt(arr.hour));
                return (total_hour[0] / count).toFixed(2);
            } else {
                return "-";
            }
        },
        get_activity_budget_amount_equal: function(count, value, obj) {
            const amount = lodash.filter(obj, arr => arr.activity_id === value)
            if (amount.length > 0) {
                const total_amount = lodash.map(amount, arr => parseInt(arr.amount));
                return (total_amount[0] / count).toFixed(2);
            } else {
                return "-";
            }
        },

        get_sub_total_hour: function(array, parent_id, activity_id) {
            var sum = 0;
            var total_hour = 0;
            const parent_details = lodash.filter(array, arr => arr.parent_id === parent_id);
            for (var i = 0; i < parent_details.length; i++) {
                const filter_data = lodash.filter(parent_details[i].budget_display, arr => arr.activity_id === activity_id);
                const total = lodash.map(filter_data, arr => parseInt(sum) + parseInt(arr.hour));
                const temp = total.length > 0 ? parseInt(total[0]) : 0;
                total_hour += parseInt(temp);
            }
            return total_hour
        },
        get_sub_total_hour_activity_goal: function(array, parent_id, goal_id) {
            var sum = 0;
            var total_hour = 0;
            const parent_details = lodash.filter(array, arr => arr.parent_id === parent_id);
            for (var i = 0; i < parent_details.length; i++) {
                const filter_data = lodash.filter(parent_details[i].budget_display, arr => arr.activity_goal_id === goal_id);
                const total = lodash.map(filter_data, arr => parseInt(sum) + parseInt(arr.hour));
                const temp = total.length > 0 ? parseInt(total[0]) : 0;
                total_hour += parseInt(temp);
            }
            return total_hour
        },
        get_sub_total_amount: function(array, parent_id, activity_id) {
            var sum = 0;
            var total_hour = 0;
            const parent_details = lodash.filter(array, arr => arr.parent_id === parent_id);
            for (var i = 0; i < parent_details.length; i++) {

                const filter_data = lodash.filter(parent_details[i].budget_display, arr => arr.activity_id === activity_id);
                const total = lodash.map(filter_data, arr => parseInt(sum) + parseInt(arr.amount));
                const temp = total.length > 0 ? parseInt(total[0]) : 0;
                total_hour += parseInt(temp);
            }
            return total_hour
        },
        get_sub_total_amount_activity_goal: function(array, parent_id, goal_id) {
            var sum = 0;
            var total_hour = 0;
            const parent_details = lodash.filter(array, arr => arr.parent_id === parent_id);
            for (var i = 0; i < parent_details.length; i++) {

                const filter_data = lodash.filter(parent_details[i].budget_display, arr => arr.activity_goal_id === goal_id);
                const total = lodash.map(filter_data, arr => parseInt(sum) + parseInt(arr.amount));
                const temp = total.length > 0 ? parseInt(total[0]) : 0;
                total_hour += parseInt(temp);
            }
            return total_hour
        },
        get_hour_by_goal: function(array, parent_id) {
            var x = 0;
            var total_budget_hour = 0;
            const hours = lodash.filter(array, arr => arr.parent_id === parent_id);
            if (hours.length > 0) {
                const total_hour = lodash.map(hours, arr => (arr.budget_sum.length > 0 ? x + parseInt(arr.budget_sum[0].hour) : 0));
                for (var i = 0; i < total_hour.length; i++) {
                    total_budget_hour += parseInt(total_hour[i]);
                }
                return total_budget_hour;
            } else {
                return "-";
            }
        },
        get_amount_by_goal: function(array, parent_id) {
            var x = 0;
            var total_budget_amount = 0;
            const amounts = lodash.filter(array, arr => arr.parent_id === parent_id);
            if (amounts.length > 0) {
                const total_amount = lodash.map(amounts, arr => (arr.budget_sum.length > 0 ? x + parseInt(arr.budget_sum[0].amount) : 0));
                for (var i = 0; i < total_amount.length; i++) {
                    total_budget_amount += parseInt(total_amount[i]);
                }
                return total_budget_amount;
            } else {
                return "-";
            }
        },
        get_all_total_hour: function(array, activity_id) {
            const tot_hour = lodash.filter(array, arr => arr.activity_id === activity_id);
            if (tot_hour.length > 0) {
                return tot_hour[0].hour;
            } else {
                return "-";
            }
        },
        get_all_total_amount: function(array, activity_id) {
            const tot_amount = lodash.filter(array, arr => arr.activity_id === activity_id);
            if (tot_amount.length > 0) {
                return tot_amount[0].amount;
            } else {
                return "-";
            }
        },
        get_all_total_hour_by_goal: function(array, goal_id) {
            const tot_hours = lodash.filter(array, arr => arr.activity_goal_id === goal_id);
            if (tot_hours.length > 0) {
                return tot_hours[0].hour;
            } else {
                return "-";
            }
        },
        get_all_total_amount_by_goal: function(array, goal_id) {
            const tot_amounts = lodash.filter(array, arr => arr.activity_goal_id === goal_id);
            if (tot_amounts.length > 0) {
                return tot_amounts[0].amount;
            } else {
                return "-";
            }
        },
        marketing_budget_hour: function(hour, length) {
            if (hour > 0) {
                return (hour / length).toFixed(2);
            } else {
                return "-";
            }
        },
        marketing_budget_amount: function(amount, length) {
            if (amount > 0) {
                return (amount / length).toFixed(2);
            } else {
                return "-";
            }
        },
        show_button_add: function(index, opts) {
            if (index == 0)
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        get_activity_goal_amounts: function(array){
            var bdgArr = [];
            for(var w=0; w<array.length; w++)
            {
                bdgArr.push(array[w].amount);
            }
            var sum = bdgArr.reduce((a, b) => a + b, 0);
            return sum;
        },
        get_activity_goal_hours: function (array) {
            var bdghourArr = [];
            for(var w=0; w<array.length; w++)
            {
                bdghourArr.push(array[w].hour);
            }
            var hour = bdghourArr.reduce((a, b) => a + b, 0);
            return hour;
        },
        get_total_activity: function (array) {
            return array.length;
        },
        eq: function (v1, v2) {
          return v1 == v2;
        },
        ne: function(v1, v2) {
            return v1 !== v2;
        },
        lt: function(v1, v2) {
            return v1 < v2;
        },
        gt: function(v1, v2) {
            return v1 > v2;
        },
        lte: function(v1, v2) {
            return v1 <= v2;
        },
        gte: function(v1, v2) {
            return v1 >= v2;
        },
        and: function(v1, v2) {
            return v1 && v2;
        },
        or: function(v1, v2,v3) {
            return v1 || v2;
        },
        or_v1: function(v1, v2,v3) {
            return v1 || v2 || v3;
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
    ttl: (1 * 60 * 60)
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
app.use(attorney);
app.use(budget_report);
app.use(forgot_password);
app.use(activity_approvals);

/********** End **********/
app.listen(port, () => console.log(`Server listening to port ${port}`));