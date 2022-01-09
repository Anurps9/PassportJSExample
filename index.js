const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const session  = require('express-session')
const mongoose = require('mongoose')

const app = express()


app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, '/pages')));
app.use(passport.initialize());
app.use(session({secret: 'this is the secret key'}))
app.use(passport.session());

//database
const uri = 'mongodb+srv://anurps9:test123@cluster0.gn58w.mongodb.net/exp?retryWrites=true&w=majority';
main().then(() => console.log('database connected')).catch(err => console.log(err))
async function main(){
    await mongoose.connect(uri);
}

const userSchema = new mongoose.Schema({
    username: 'String',
    password: 'String'
})

const User = mongoose.model('User', userSchema);

//set verify callback form LocalStrategy
passport.use(new LocalStrategy(function verify(username, password, done){
    User.findOne({username: username}, function(err, user){
        if(err) {return done(err)}
        if(!user) {
            return done(null, false, {message: 'Incorrect username'})
        }
        if(user.password !== password){
            return done(null, false, {message: 'Incorrect password'})
        }
        return done(null, user)
    })
}))

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/index.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/login.html'));
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
}), function(req, res){
    res.redirect(`/users/${req.body.username}`);
})

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/signup.html'))
})

app.post('/signup', (req, res) =>{
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    })
    newUser.save((err) => {
        if(err) console.log(err);
        else console.log("User added successfully");
    })
    res.redirect(`/users/${req.body.username}`);
})

app.get('/users/:username', (req, res) =>{
    res.send(`Hello ${req.params.username}.`);
})

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})