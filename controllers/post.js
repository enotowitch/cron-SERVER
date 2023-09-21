import post from "../models/post.js"

export const create = async (req, res) => {
	const doc = await new post({ img: `http://localhost:5000/uploads/${req.file.originalname}` })
	await doc.save()
	res.json()
}

export const posts = async (req, res) => {
	const posts = await post.find()
	res.json(posts)
}