#!/usr/bin/env node
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8004;

// paths
app.use("/dist", express.static(path.join(__dirname, 'dist')));
app.use("/img", express.static(path.join(__dirname, 'img')));
app.use("/js", express.static(path.join(__dirname, 'js')));

// default
app.get('/*', (req, res) => {
	res.sendfile("./html/index.html");
});

console.log("Server running on the port " + port);
app.listen(port);
