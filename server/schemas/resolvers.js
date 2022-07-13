const { AuthenticationError } = require("apollo-server-express");
// import models
const { User, Book } = require("../models");
// import sign token function from auth
const { signToken } = require("../utils/auth");

const resolvers = {
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				const userData = await User.findOne({ _id: context.user._id })
					.select("-__v -password")
					.populate("savedBooks");

				return userData;
			}

			throw new AuthenticationError("Not Logged In!");
		},
	},

	Mutation: {
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError("Incorrect Credentials");
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError("Incorrect Credentials");
			}

			const token = signToken(user);
			return { token, user };
		},

		addUser: async (parent, args) => {
			const user = await User.create(args);
			const token = signToken(user);

			return { token, user };
		},

		saveBook: async (parent, { bookToSave }, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $addToSet: { savedBooks: bookToSave } },
					{ new: true }
				).populate("savedBooks");

				return updatedUser;
			}
			
      throw new AuthenticationError("You must be logged in!");
		},

		removeBook: async (parent, {bookId}, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { bookId } } },
					{ new: true }
				);
        
				return updatedUser;
			}
		},
	},
};

module.exports = resolvers;
