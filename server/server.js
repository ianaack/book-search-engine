const express = require("express");
// Implement the Apollo Server
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

// Import our schemas
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Create a new Apollo server and pass in our schemas
const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: authMiddleware,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create a new Apollo server with the GraphQL schemas
const startApolloServer = async (typeDefs, resolvers) => {
	await server.start();
	// Integrate our Apollo server with the Express application as middleware
	server.applyMiddleware({ app });

	// If we're in production, serve client/build as static assets
	if (process.env.NODE_ENV === "production") {
		app.use(express.static(path.join(__dirname, "../client/build")));
	}

	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../client/build/index.html"));
	});

	db.once("open", () => {
		app.listen(PORT, () => {
			console.log(`🌍 Now listening on localhost:${PORT}`);
			console.log(
				`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
			);
		});
	});
};

// Call the function to start the server
startApolloServer(typeDefs, resolvers);
