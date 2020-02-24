var express        = require("express"),
    app            = express(),
    bodyParser     = require("body-parser"),
    mongoose       = require("mongoose"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer");

//APP CONFIG
//connect to a db called restful_blog_app
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true });
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
	created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs");
});

//INDEX ROUTE- show all
app.get("/blogs", function(req, res){
	//retrieve all campgrounds from db
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
	req.body.blog.body = req.sanitize();
	//create blog
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
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
	req.body.blog.body = req.sanitize();
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


//tell express to listen for requests(start server)
app.listen(3000, function() { 
  console.log('Blog server started'); 
});