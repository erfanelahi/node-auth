var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var OAuth2Strategy = require("passport-oauth2").Strategy;
var User = require("../models/user");

const webOrLocalURL = "http://erfanapp.herokuapp.com";
//const webOrLocalURL = "http://localhost:3000";

var facebookConfig = {
	clientID: "168849686939042",
	clientSecret: "3e4ced1212254e371f07e2f98caf594f",
	callbackURL: webOrLocalURL + "/facebook/callback",
	passReqToCallback: true
};

var demoAppConfig = {
	authorizationURL: "http://brentertainment.com/oauth2/lockdin/authorize",
	tokenURL: "http://brentertainment.com/oauth2/lockdin/token",
	clientID: "demoapp",
	clientSecret: "demopass",
	callbackURL: webOrLocalURL + "/demo/callback"
};

var localRegisterInit = function (req, email, password, callback) {
	User.findOne({ "local.email": email }, function (err, existingUser) {
		if (err) {
			return callback(err);
		}

		if (existingUser) {
			// TODO: supply message
			return callback(null, false);
		}

		var user = (req.user) ? req.user : new User();

		user.local.email = email;
		user.local.password = user.hashPassword(password);

		user.save(function (err) {
			if (err) {
				throw err;
			}

			return callback(null, user);
		});
	});
};

var localLoginInit = function (req, email, password, callback) {
	User.findOne({ "local.email": email }, function (err, user) {
		if (err) {
			return callback(err);
		}

		if (!user || !user.validatePassword(password)) {
			// TODO: supply generic message
			return callback(null, false);
		}

		return callback(null, user);
	});
};

var localOptions = {
	usernameField: "emailAddress",
	passReqToCallback: true
};

var facebookInit = function (req, token, refreshToken, profile, callback) {
	User.findOne({ "facebook.id": profile.id }, function (err, existingUser) {
		if (err) {
			return callback(err);
		}

		if (existingUser) {
			return callback(null, existingUser);
		}

		var user = (req.user) ? req.user : new User();

		user.facebook.id = profile.id;
		user.facebook.token = token;
		user.facebook.displayName = profile.displayName;
		user.facebook.email = profile.emails ? profile.emails[0].value : "N/A";
		
		user.save(function (err) {
			if (err) {
				throw err;
			}

			return callback(null, user);
		});
	});
};

var demoAppInit = function (token, refreshToken, profile, callback) {
	return callback(null, false);
};

passport.use("local-register", new LocalStrategy(localOptions, localRegisterInit));
passport.use("local-login", new LocalStrategy(localOptions, localLoginInit));
passport.use(new FacebookStrategy(facebookConfig, facebookInit));
passport.use(new OAuth2Strategy(demoAppConfig, demoAppInit));

passport.serializeUser(function (user, callback) {
	callback(null, user.id);
});

passport.deserializeUser(function (id, callback) {
	User.findById(id, function (err, user) {
		callback(err, user);
	});
});

module.exports = {
	local: {
		register: passport.authenticate("local-register", {
			successRedirect: "/profile",
			failureRedirect: "/register"
		}),
		connect: passport.authenticate("local-register", {
			successRedirect: "/profile",
			failureRedirect: "/connect/local"
		}),
		login: passport.authenticate("local-login", {
			successRedirect: "/profile",
			failureRedirect: "/login"
		}),
		disconnect: function (req, res, next) {
			var user = req.user;

			user.local.email = undefined;
			user.local.password = undefined;

			user.save(function (err) {
				next();
			});
		}
	},
	facebook: {
		login: passport.authenticate("facebook", { scope: "email" }),
		callback: passport.authenticate("facebook", {
			successRedirect: "/profile",
			failureRedirect: "/"
		}),
		connect: passport.authorize("facebook", { scope: "email" }),
		connectCallback: passport.authorize("facebook", {
			successRedirect: "/profile",
			failureRedirect: "/profile"
		}),
		disconnect: function (req, res, next) {
			var user = req.user;

			user.facebook.id = undefined;
			user.facebook.email = undefined;
			user.facebook.token = undefined;
			user.facebook.displayName = undefined;

			user.save(function (err) {
				next();
			});
		}
	},
	demo: {
		login: passport.authenticate("oauth2", { state: "6c145932231bb6c5c5b9a8d27600fdd7" }),
		callback: passport.authenticate("oauth2", {
			successRedirect: "/profile",
			failureRedirect: "/"
		}),
	}
};