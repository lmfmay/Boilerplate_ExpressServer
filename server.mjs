//Imports
import express from "express";

//Router export
import userRoutes from "./routes/userRoutes.mjs"
import postRoutes from "./routes/postRoutes.mjs"


//import body parser that is included as part of node.js so server can read data from client
// In modern versions of Express, bodyParser is already included, and you can use express.urlencoded() and express.json() directly without importing body-parser.
import bodyParser from "body-parser"

//import error handling function
import { error } from "./utilities/error.mjs";

const app = express();
let PORT = 3000;

//Middleware
// We use the body-parser middleware FIRST so that
// we have access to the parsed data within our routes.
// The parsed data will be located in "req.body".

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true })); //when we receive a post/put request, server will be able to read it.

// New logging middleware to help us keep track of
// requests during testing!
app.use((req, res, next) => {
    const time = new Date();
  
    console.log(
      `-----
  ${time.toLocaleTimeString()}: Received a ${req.method} request to ${req.url}.`
    );
    if (Object.keys(req.body).length > 0) {
      console.log("Containing the data:");
      console.log(`${JSON.stringify(req.body)}`);//stringiy turns json object to string.
    }
    next();
  });

// Valid API Keys.
let apiKeys = ["perscholas", "ps-example", "hJAsknw-L198sAJD-l3kasx"];

// New middleware to check for API keys!
// Note that if the key is not verified,
// we do not call next(); this is the end.
// This is why we attached the /api/ prefix
// to our routing at the beginning!
app.use("/api", function (req, res, next) {
  var key = req.query["api-key"];

  // Check for the absence of a key.
  if (!key) {
    next(error(400, "API Key Required"));
  }

  // Check for key validity.
  if (apiKeys.indexOf(key) === -1) {
    next(error(401, "Invalid API Key"));
  }

  // Valid key! Store it in req.key for route access.
  req.key = key;
  next();
});

//Routes


app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);


// Adding some HATEOAS links.
app.get("/", (req, res) => {
    res.json({
      links: [
        {
          href: "/api",
          rel: "api",
          type: "GET",
        },
      ],
    });
  });
  
  // Adding some HATEOAS links.
  app.get("/api", (req, res) => {
    res.json({
      links: [
        {
          href: "api/users",
          rel: "users",
          type: "GET",
        },
        {
          href: "api/users",
          rel: "users",
          type: "POST",
        },
        {
          href: "api/posts",
          rel: "posts",
          type: "GET",
        },
        {
          href: "api/posts",
          rel: "posts",
          type: "POST",
        },
      ],
    });
  });


//More middleware for error handling and 404 not found.

// 404 Middleware
app.use((req, res, next) => {
    next(error(404, "Resource Not Found"));
  });
  
  // Error-handling middleware.
  // Any call to next() that includes an
  // Error() will skip regular middleware and
  // only be processed by error-handling middleware.
  // This changes our error handling throughout the application,
  // but allows us to change the processing of ALL errors
  // at once in a single location, which is important for
  // scalability and maintainability.
  
  app.use((err, req, res, next) => {//err here is returned from previous error handling middleware
    res.status(err.status || 500);
    res.json({ error: err.message });
  });

//catch all route. last route because order matters
// app.get(`*`,(req,res)=>{
//     res.status(404).send(`404 Page not found.`)
// })

//doesn't need next() because it's the last stop along req-res cycle. must be last in order
// app.use((req, res) => {
//     res.status(404);
//     res.json({ error: "Resource Not Found" });
//   });

//Listen
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}.`)
})