const User = require('../models/User');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_URI || process.env.MONGOLAB_URI;
var ObjectId = require('mongodb').ObjectID;

/**
 * GET /blog
 * Home page
 */
exports.homePage = (req, res) => {
  User.findById(req.user._id, (err, user) => {
    if (err) return res.redirect('/');
    if (user.admin) {
      MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("users").find({}, {_id:true, username:true, email:true, updatedAt:true, posts:true}).toArray(function(err, result) {
          let users = result;
          if (err) throw err;
          
          res.render('admin', {
            title: 'Admin',
            users: users
          });
        }); 
      });
    } else {
      res.render('blog/homepage', {
        title: 'Mapster'
      });
    } 

});
};


exports.changeStatus = (req, res) => {
  
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
  
      let postId = req.query.id;
  
      let userID = req.query.userID;
  
      let postStatus = req.query.postStatus;
  
      if(postStatus === 'true') {
        db.collection("users").update({"posts._id":new ObjectId(postId)},{$set:{"posts.$.active": false}});
      }
      else {
        db.collection("users").update({_id:ObjectId(userID), "posts._id":ObjectId(postId)},{$set:{"posts.$.active": true}});
      }
  });
  };

exports.posts = (req, res) => {
  const userId = req.user._id;
  User.findOne(userId, (err, user) => {
    if (err) {
      return res.redirect('/blog');
    }
    const userPosts = user.posts || [];
    res.render('blog/posts', {
      title: 'Mapster',
      posts: userPosts
    });
  });
};

exports.updatePost = (req, res) => {
  req.assert('title', 'Title is not valid').notEmpty();
  req.assert('body', 'Body cannot be blank').notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/blog');
  }

  const postId = req.body.postID;
  const newTitle = req.body.title;
  const newBody = req.body.body;

  User.update(
    { 'posts._id': postId },
    { $set: { 
      'posts.$.title': newTitle,
      'posts.$.body': newBody
      }
    },
    (err, result) => {
      if (err) return err;
      req.flash('success', { msg: 'Story has been updated successfully!' });
      return res.redirect('/posts');
    }
  );
};

exports.sendPosition = (req, res) => {
  let posts = [];
  User.find({},(err, users) => {
    if (err) return res.redirect('/blog');

    for (let i = 0; i < users.length; i++) {
      users[i].posts.forEach(function(post) {
        if (post.active)
          posts.push({
            title: post.title,
            body: post.body,
            location: post.location,
            username: users[i].username
          });
      });
    }
    res.send(posts);
  });

};

exports.addPost = (req, res) => {
  req.assert('title', 'Title is not valid').notEmpty();
  req.assert('body', 'Body cannot be blank').notEmpty();
  req.assert('location', 'Location is not defined').notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/blog');
  }

  const userId = req.user._id;
  const location = JSON.parse(req.body.location);
  User.findByIdAndUpdate(userId,
  {
    $push: {
      'posts': {
        title: req.body.title,
        body: req.body.body,
        postedBy: Date.now,
        location: location || { lat: 1, lng: 1 }
      }
    }
  }, {
      safe: true,
      upsert: true,
      new : true
  }, (err, data) => {
    if (err) return err;
    req.flash('success', { msg: 'Story has been posted successfully!' });
    res.redirect('/blog');
  });
};

