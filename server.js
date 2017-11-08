var express = require("express");
var app = express();
var request = require("request");
app.use(express.static("public"));
app.set("view engine", "ejs");
var mongoose = require("mongoose");

var options = { server: { socketOptions: { connectTimeoutMS: 30000 } } };

mongoose.connect(
	"mongodb://ines:doudou2003@ds249355.mlab.com:49355/moviesrepertory",
	options,
	function(err) {},
);

var movieSchema = mongoose.Schema({
	idmoviedb: Number,
	title: String,
	poster_path: String,
	overview: String,
	vote_count: Number,
	vote_average: Number,
	position: Number,
});

var movieModel = mongoose.model("moviesrepertory", movieSchema);

//Homepage: most popular movies
app.get("/", function(req, res) {
	request(
		"https://api.themoviedb.org/3/discover/movie?api_key=ef8a5de4013f25425a8d4b9fd49460df&language=fr-FR&region=FR&sort_by=popularity.desc&include_adult=false&include_video=false&page=1",
		function(error, response, body) {
			var body = JSON.parse(body);
			movieModel
				.find()
				.sort({ position: 1 })
				.exec(function(err, mymoviesList) {
					res.render("home", { list: body, mylist: mymoviesList });
				});
		},
	);
});

//My movies:  my selected movies
app.get("/review", function(req, res) {
	movieModel
		.find()
		.sort({ position: 1 })
		.exec(function(err, mylist) {
			res.render("review", { mylist });
		});
});

// Add to Mymovies
app.get("/add", function(req, res) {
	movieModel
		.find()
		.sort({ position: 1 })
		.exec(function(err, list) {
			var ind = 1;
			if (list.length > 0) {
				var ind = list[list.length - 1].position + 1;
			}
			request(
				"https://api.themoviedb.org/3/movie/" +
					req.query.id +
					"?api_key=ef8a5de4013f25425a8d4b9fd49460df&language=fr-FR",
				function(error, response, body) {
					var body = JSON.parse(body);
					new movieModel({
						idmoviedb: body.id,
						title: body.title,
						poster_path: body.poster_path,
						overview: body.overview,
						vote_count: body.vote_count,
						vote_average: body.vote_average,
						position: ind,
					}).save(function(error, city) {
						movieModel
							.find()
							.sort({ position: 1 })
							.exec(function(err, mylist) {
								res.render("review", { mylist });
							});
					});
				},
			);
		});
});

//movie:  single form
app.get("/single", function(req, res) {
	request(
		"https://api.themoviedb.org/3/movie/" +
			req.query.id +
			"?api_key=ef8a5de4013f25425a8d4b9fd49460df&language=fr-FR",
		function(error, response, body) {
			var body = JSON.parse(body);
			res.render("single", { onemovie: body });
		},
	);
});

//contact:  contact form
app.get("/contact", function(req, res) {
	res.render("contact", {});
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
	console.log("Server listening on port");
});
