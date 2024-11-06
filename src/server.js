const express = require('express');
const session = require('express-session');
const { collection, adminCollection } = require('./config');
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'week06secretkey',
    resave: false,
    saveUninitialized: true
}));

function admindashCahce(req, res, next) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  
    if (req.session.adminCache) {
      return res.redirect("/admin-dashboard");
    } else {
      return next();
    }
  }

  function userLoginCahce(req, res, next) {
    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  
    if (req.session.userCache) {
      return res.redirect("/home");
    } else {
      return next();
    }
  }

function checkAuth(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function checkAdmin(req, res, next) {
    if (req.session.admin) {
        return next();
    } else {
        res.redirect('/admin');
    }
}

function noCache(req, res, next) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
}


// Home route 
app.get('/', noCache, admindashCahce, userLoginCahce, (req, res) => {
    res.render('index');
});

// User login page
app.get('/login', noCache, admindashCahce, userLoginCahce, (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('login');
    }
});

// Admin login page
app.get('/admin', noCache, admindashCahce, (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin-dashboard');
    } else {
        res.render('admin');
    }
});

app.get('/home', checkAuth, noCache, (req, res) => {
    req.session.userCache = true;
    res.render('home', { username: req.session.user });
});

app.get('/admin-dashboard', checkAdmin, noCache, async (req, res) => {
    try {
        const users = await collection.find({}).exec();
        req.session.adminCache = true;
        res.render('admin-dashboard', { users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.send('Error fetching users');
    }
});

app.get('/signup',admindashCahce, userLoginCahce, (req, res) => {
    res.render('signup', { error: null, data: {} }); 
});

app.post('/signup', async (req, res) => {

    try {
        const { username, password, email } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const data = {
            name: username,
            password: hashedPassword, 
            email: email
        };

        const hasSymbol = /[^a-zA-Z0-9]/;
        const hasNumber = /\d/; 
        if (hasSymbol.test(data.name) || hasNumber.test(data.name)){
            return res.render('signup', {error: 'Username contains Symbols', data});
        }

        const existingUserByEmail = await collection.findOne({ email: data.email });
        if (existingUserByEmail) {
            return res.render('signup', { error: 'Email already exists', data });
        }

        const existingUserByUsername = await collection.findOne({ name: data.name });
        if (existingUserByUsername) {
            return res.render('signup', { error: 'Username already exists', data });
        }

        await collection.create(data); 
        res.redirect('/login');
    } catch (error) {
        console.error('Error signing up:', error);
        res.render('signup', { error: 'Error signing up', data: req.body });
    }
});


// User login route
app.post('/login', async (req, res) => {
    try {
        const user = await collection.findOne({ name: req.body.username });

        if (!user) {
            return res.render('login', { error: 'Username does not exist', username: req.body.username });
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password); 
        
        if (isPasswordValid) {
            req.session.user = user.name;
            return res.redirect('/home');
        } else {
            return res.render('login', { error: 'Incorrect password', username: req.body.username });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        return res.render('login', { error: 'Error logging in', username: req.body.username });
    }
});


// Admin login route
app.post('/admin', async (req, res) => {
    try {
        const admin = await adminCollection.findOne({ name: req.body.adminName });
        if (!admin) {
            return res.send('Admin not found');
        }

        const isPassword = req.body.password === admin.password;
        if (isPassword) {
            req.session.admin = admin.name;
            res.redirect('/admin-dashboard');
        } else {
            res.send('Wrong password');
        }
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.send('Error logging in admin');
    }
});

// Edit user route
app.get('/edit-user/:id', checkAdmin, async (req, res) => {
    try {
        const user = await collection.findById(req.params.id).exec();
        if (!user) {
            return res.send('User not found');
        }
        res.render('edit-user', { user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.send('Error fetching user');
    }
});

app.post('/edit-user/:id', checkAdmin, async (req, res) => {
    try {
        const { username, password, email } = req.body;

        let updateData = { name: username, email: email };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.password = hashedPassword;
        }

        await collection.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        res.redirect('/admin-dashboard');
    } catch (error) {
        console.error('Error updating user:', error);
        res.send('Error updating user');
    }
});


app.post('/delete-user/:id', checkAdmin, async (req, res) => {
    try {
        await collection.findByIdAndDelete(req.params.id);
        res.redirect('/admin-dashboard');
    } catch (error) {
        console.error('Error deleting user:', error);
        res.send('Error deleting user');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.set('Cache-Control', 'no-store');
        res.redirect('/');
    });
});

app.get('/admin-logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out');
        }
        res.set('Cache-Control', 'no-store');
        res.redirect('/admin');
    });
});

app.get('*', (req, res) => {
    res.status(404).send('404: Page Not Found');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
