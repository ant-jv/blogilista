const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {

    if (request.body.likes === undefined) {
        request.body.likes = 0
    }

    if (request.body.hasOwnProperty('title') && request.body.hasOwnProperty('url')) {

        const body = request.body

        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        if (!request.token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid'})
        }
        
        const user = await User.findById(body.user)

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })

        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()

    } else {
        response.status(400).json({ error: 'title or/and url missing' })
    }
})

blogsRouter.delete('/:id', async (request, response) => {

    blog = await Blog.findById(request.params.id)
    if (!blog) {
        return response.status(401).json({ error: 'blog not found'})
    }
    if (!request.token || !request.user.id.toString()) {
        return response.status(401).json({ error: 'token missing or invalid'})
    }
    if (blog.user.toString() === request.user.id.toString()) {
        await Blog.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } else {
        return response.status(401).json({ error: 'access denied'})
    }
})

blogsRouter.put('/:id', async (request, response) => {

    body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.status(204).end()
})

module.exports = blogsRouter