'use strict';

const { Router } = require('express');
const router = Router();

const User = require('./../models/user');
const bcryptjs = require('bcryptjs');

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Hello World!' });
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
});

router.post('/sign-up', (req, res, next) => {
  const { username, password } = req.body;
  bcryptjs
    .hash(password, 10)
    .then(hash => {
      return User.create({
        username,
        passwordHash: hash
      });
    })
    .then(user => {
      console.log('Created user', user);
      req.session.user = user._id;
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  let userId;
  const { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      if (!user) {
        return Promise.reject(new Error("There's no user with that username."));
      } else {
        userId = user._id;
        return bcryptjs.compare(password, user.passwordHash);
      }
    })
    .then(result => {
      if (result) {
        console.log('Correct password.');
        req.session.user = userId;
        res.redirect('/');
      } else {
        return Promise.reject(new Error('Wrong password.'));
      }
    })
    .catch(error => {
      next(error);
    });
});

router.post('/sign-out', (req, res, next) => {
  req.session.destroy();
  res.redirect('/');
});

const routeGuard = require('./../middleware/route-guard');

router.get('/private', routeGuard, (req, res, next) => {
  res.render('private');
});

router.get('/main', routeGuard, (req, res, next) => {
  res.render('main');
});

router.get('/profile/:usersId', routeGuard, (req, res, next) => {
  const usersId = req.params.usersId;
  User.findById(usersId) 
  .then(user => {
    res.render('profile', {
      userData: user
    });
    console.log(user);
  })
  .catch(error => {
    next(error);
  });
});

router.get('/profile/:usersId/edit', routeGuard, (req, res, next) => {
  const usersId = req.params.usersId;
  User.findById(usersId)
    .then(user => {
      res.render('edit', { user });
    })
    .catch(error => {
      next(error);
    });
});

router.post('/profile/:usersId/edit', routeGuard, (req, res, next) => {
  const usersId = req.params.usersId;
  User.findByIdAndUpdate(usersId, {
    name: req.body.name
    
  })
    .then(user => {
      console.log(user);
      res.redirect(`/profile/${usersId}`);
    })
    .catch(error => {
      next(error);
    });
});




module.exports = router;
