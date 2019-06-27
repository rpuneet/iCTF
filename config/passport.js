const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Team = require('../models/Team');

const keys = require('./keys');
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secretOrKey
}

module.exports = passport => {
    passport.use(
        new JwtStrategy(
            opts,
            (jwtPayload , done) => {
                Team.findById(jwtPayload.id)
                    .then(team => {
                        if(team) {
                            return done(null , team);
                        }
                        return done(null , false);
                    })
                    .catch(err => console.log(err));
            }
        )
    );
};
