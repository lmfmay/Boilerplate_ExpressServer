import express from "express";
import { posts } from "../data/posts.mjs";
import { error } from "../utilities/error.mjs";

let router = express.Router()

router.get('/', (req, res) =>{
    const links = [
        {
          href: "posts/:id",
          rel: ":id",
          type: "GET",
        }
      ];
    res.json({posts,links});
})

router.post('/',(req, res) => {
    // Within the POST request route, we create a new
    // post with the data given by the client.
    if (req.body.userId && req.body.title && req.body.content) {
      const post = {
        id: posts[posts.length - 1].id + 1,
        userId: req.body.userId,
        title: req.body.title,
        content: req.body.content,
      };

      posts.push(post);
      res.json(posts[posts.length - 1]);
    } else next(error(400, "Insufficient Data"));
  });

router.get('/:id', (req, res, next) =>{
    let post = posts.find((p) => p.id == req.params.id);
    const links = [
        {
          href: `/${req.params.id}`,
          rel: "",
          type: "PATCH",
        },
        {
          href: `/${req.params.id}`,
          rel: "",
          type: "DELETE",
        },
      ];
    if (post) res.json({post,links});
    else next()
})

router.patch('/:id',(req, res, next) => {
    // Within the PATCH request route, we allow the client
    // to make changes to an existing post in the database.
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        for (const key in req.body) {
          posts[i][key] = req.body[key];
        }
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  })
router.delete('/:id',(req, res, next) => {
    // The DELETE request route simply removes a resource.
    const post = posts.find((p, i) => {
      if (p.id == req.params.id) {
        posts.splice(i, 1);
        return true;
      }
    });

    if (post) res.json(post);
    else next();
  });


//TRY THIS
//@route: GET api/posts/user/:userid
//@desc: get all user posts
//@access: public
router.get('/user/:userID',(req, res, next)=>{
    let all = [];
    posts.forEach(p => {
        if (p.userId == req.params.userID) {
            let copy = p;
            all.push(copy);
        }
    });
    if (all.length>0){res.json({all})}
    else next(error(400,"User doesn't exist or did not make any post"))
})


export default router;