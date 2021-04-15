import asyncHandler from 'express-async-handler';
import generateToken from '../utils/generate-token.js';
import User from '../models/user-model.js';


const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		});
	} else {
		res.status(401);
		throw new Error('Invalid email or password');
	}
});



const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error('User already exists');
	}

	const user = await User.create({
		name,
		email,
		password,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error('Invalid user data');
	}
});



const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
		});
	} else {
		res.send(404);
		throw new Error('User not found');
	}
});


const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;

		if (req.body.password) {
			user.password = req.body.password;
		}

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
			token: generateToken(updatedUser._id),
		});
	} else {
		res.send(404);
		throw new Error('User not found');
	}
});


const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find({});
	res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);

	if (user) {
		await user.remove();
		res.json({ message: 'User removed' });
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});


const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password');

	if (user) {
		res.json(user);
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});


const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);

	if (user) {
		user.name = req.body.name || user.name;
		user.email = req.body.email || user.email;
		user.isAdmin =
			req.body.isAdmin === undefined || req.body.isAdmin === null
				? user.isAdmin
				: req.body.isAdmin;

		const updatedUser = await user.save();

		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: updatedUser.isAdmin,
		});
	} else {
		res.send(404);
		throw new Error('User not found');
	}
});


const addFavoriteProduct = asyncHandler(async (req, res) => {
	const { productId, name, image, price, numReviews, rating } = req.body;
	const user = await User.findById(req.params.id);

	if (user) {
		const favorite = {
			name,
			image,
			price,
			numReviews,
			rating,
			product: productId,
		};

		user.favorites.push(favorite);
		await user.save();
		res.status(201).json({
			favorites: user.favorites,
			message: 'Product is added to favorites',
		});
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});


const removeFavoriteProduct = asyncHandler(async (req, res) => {
	const productId = req.params.productId;
	const user = await User.findById(req.params.id);

	const isExists = user.favorites.some(
		(x) => x.product.toString() == productId.toString()
	);

	if (isExists) {
		user.favorites = user.favorites.filter(
			(favorite) => favorite.product.toString() !== productId.toString()
		);
		await user.save();
		res.status(202).json({
			message: 'Product is removed from favorites',
		});
	} else {
		res.status(404);
		throw new Error('Product not found');
	}
});


const getFavoriteProducts = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id);

	if (user) {
		res.status(200).json({ favorites: user.favorites });
	} else {
		res.status(404);
		throw new Error('User not found');
	}
});

export {
	authUser,
	getUserProfile,
	registerUser,
	updateUserProfile,
	getUsers,
	deleteUser,
	getUserById,
	updateUser,
	addFavoriteProduct,
	removeFavoriteProduct,
	getFavoriteProducts,
};
