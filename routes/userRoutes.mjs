import express from "express";
import { users } from "../data/users.mjs";
import { error } from "../utilities/error.mjs";

let router = express.Router()

//@route: GET api/users
//@desc: Gets all users
//@access: public
//Public means no authentication needed. other access levels = private, admin which needs additional auth arg in get
router.get('/', (req, res) =>{
    const links = [
        {
          href: "users/:id",
          rel: ":id",
          type: "GET",
        },
      ];
    res.json({users,links});
})

//@route: GET api/users/:id
//@desc: Gets one user
//@access: public
//next is calling next middleware which is the error handling function in the server pg. it works because that function is after all routes.
router.get('/:id', (req, res, next) =>{
    let user = users.find((u) => u.id == req.params.id);
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
    if (user) res.json({user,links});
    else next()
})

//@route: POST api/users/:id
//@desc: add new user to db
//@access: public
router.post('/',(req, res,next) => {
    // Within the POST request route, we create a new
    // user with the data given by the client.
    // We should also do some more robust validation here,
    // but this is just an example for now.
    if (req.body.name && req.body.username && req.body.email) { //if body has name, email, username, continue
      if (users.find((u) => u.username == req.body.username)) { //if user already exists, send error
        next(error(409, "Username Already Taken"));
      } else {
        const user = { //if user doesn't exist, create new user
            id: users[users.length - 1].id + 1,
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
          };
    
          users.push(user);
          res.json(users[users.length - 1]);
      }     
    } else next(error(400, "Insufficient Data")); //if missing data field, send error
  });

//@route: PATCH api/users/:id
//@desc: update specific user
//@access: public
router.patch('/:id',(req,res,next)=>{
      // Within the PATCH request route, we allow the client
    // to make changes to an existing user in the database.
    const user = users.find((u, i) => {
        if (u.id == req.params.id) {
          for (const key in req.body) {
            users[i][key] = req.body[key];
          }
          return true;
        }
      });
  
      if (user) res.json(user);
      else next();
    })

//@route: DELETE api/users/:id
//@desc: delete specific user
//@access: public
router.delete('/:id',(req,res,next)=>{
    // The DELETE request route simply removes a resource.
    const user = users.find((u, i) => {
        if (u.id == req.params.id) {
          users.splice(i, 1);
          return true;
        }
      });
  
      if (user) res.json(user);
      else next();
    });

export default router;