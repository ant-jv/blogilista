const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)
})


blogsRouter.post('/', async (request, response) => {

    if (request.body.likes === undefined) {
        request.body.likes = 0
    }


    if (request.body.hasOwnProperty('title') && request.body.hasOwnProperty('url')) {
        
        const blog = new Blog(request.body)

        const savedBlog = await blog.save()
        response.status(201).json(savedBlog)

    } else {
        response.status(400).json({ error: 'title or/and url missing' })
    }
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
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