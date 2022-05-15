const User = require('./models/usermodel')
const JwtStrategy = require('passport-jwt').Strategy    

const configPassport = function(passport){
  const opts = {}
  const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwtToken'];
    }
    return token;
};
  opts.jwtFromRequest = cookieExtractor
  opts.secretOrKey = process.env.jwtSecret;
  opts.usernameField= 'email',
  opts.passwordField= 'psw',
  opts.session= false
    passport.use(new JwtStrategy(opts,
        function(jwt_payload, done) {
          User.findOne({_id: jwt_payload.id}, function (err, user) {
            if (user) {
              return done(null, user);
          } else if (err){
            console.log(err)
            return done(err, false);
          }
          else {
              return done(null, false);
              // or you could create a new account
          }
          });
        }
      ));
}
module.exports = configPassport