const express          = require("express"),
      app              = express(),
      bodyParser       = require("body-parser"),
      mongoose         = require("mongoose"),
	  methodOverride   = require("method-override"),
	  expressSanitizer = require("express-sanitizer"),
	  nodemailer       = require("nodemailer");

//APP CONFIG
// const url = process.env.DATABASEURL || "mongodb://localhost:27017/restful_blog_app"; 
const url = process.env.DATABASEURL || "mongodb+srv://docm:z1s6FPzZxmQOVWUW@cluster0-q98om.mongodb.net/test?retryWrites=true&w=majority"; 
mongoose.connect(url, {useNewUrlParser: true});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer()); //must go after body-parser
app.use(methodOverride("_method")); // tell it to look for _method in the url

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now},
	ingredients: String,
	directions: String,
	yields: String,
	cook: String
});
var Blog = mongoose.model("Blog", blogSchema);

var contactSchema = new mongoose.Schema({
	name: String,
	email: String,
	message: String
});
var Contact = mongoose.model("Contact", contactSchema);


//RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});
//INDEX ROUTE- show all
app.get("/blogs", function(req, res){
	//retrieve all blogs from db
	Blog.find({}, function(err, blogs){
		if(err){
			console.log("ERROR");
		}
		else{
			res.render("index", {blogs: blogs});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req,res){
	//show the form
	res.render("new");
});
//CREATE ROUTE- send data from the form
app.post("/blogs", function(req,res){
	//sanitize
	req.body.blog.body = req.sanitize(req.body.blog.body);
	req.body.blog.ingredients = req.sanitize(req.body.blog.ingredients);
	req.body.blog.directions = req.sanitize(req.body.blog.directions);
	req.body.blog.yields = req.sanitize(req.body.blog.yields);
	req.body.blog.cook = req.sanitize(req.body.blog.cook);
	//create blog
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			console.log(err);
			res.render("new");
		}
		else{
			//then redirect to the index
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show", {blog: foundBlog})
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit", {blog: foundBlog})
		}
	});
});
//UPDATE ROUTE- utilizes method-override
app.put("/blogs/:id", function(req, res){
	//sanitize
	req.body.blog.body = req.sanitize(req.body.blog.body);
	req.body.blog.ingredients = req.sanitize(req.body.blog.ingredients);
	req.body.blog.directions = req.sanitize(req.body.blog.directions);
	req.body.blog.yields = req.sanitize(req.body.blog.yields);
	req.body.blog.cook = req.sanitize(req.body.blog.cook);
	//find the blog by id, catch the all data
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			//redirect to the page with that blog
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DESTROY ROUTE- utilizes method-override
app.delete("/blogs/:id", function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

//CONTACT ME ROUTES
app.get("/contact", (req, res) =>{
	res.render("contact");
});
app.post("/send", (req, res) => {
	req.body.contact.name = req.sanitize(req.body.contact.name);
	req.body.contact.email = req.sanitize(req.body.contact.email);
	req.body.contact.message = req.sanitize(req.body.contact.message);
	Contact.create(req.body.contact, function(err, newContact){
		if(err){
			console.log(err);
			res.render("contact");
		}
		else{
			//then redirect to the index
			res.redirect("/blogs");
			console.log(req.body.contact);
		}
	});
	
	// the message to send through nodemailer
	const output = `
		<h3>Name</h3>
		<p>${req.body.contact.name}</p>
        <h3>Email</h3>
		<p>${req.body.contact.email}</p>
		<h3>Message</h3>
		<p>${req.body.contact.message}</p>
  `;
	
  // the auth credentials below is a test account
  // Create a new account to test nodemailer funtionality
  // Generate test SMTP service account from ethereal.email
	
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'creola.abernathy29@ethereal.email', // generated ethereal user
        pass: 'jqmSbhbBQ13FvwZAEz'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Nodemailer Contact" <creola.abernathy29@ethereal.email>', // sender address
      to: 'ctintin123@gmail.com', // list of receivers
      subject: 'Node Contact Request', // Subject line
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });	
	
  
});

app.listen(process.env.PORT || 3000, process.env.IP, (req, res) => {
	console.log("server listening")
});