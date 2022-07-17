const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')


beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('Retrieving information from database', () => {

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('There are correct amount of blogs in the database', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('response includes an id field', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })
})

describe('Adding, deleting, and editing blogs', () => {

  test('blog is added to the database', async () => {
      const newBlog = {
        title: "Testiblogi",
        author: "Antti Viljanen",
        url: "http://www.jokinosoite.com/testiblogi.html",
        likes: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      
      const response = await api.get('/api/blogs')

      const contents = response.body.map(r => r.title)

      expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
      expect(contents).toContain('Testiblogi')
  })


  test('Likes-property gets value 0 if not set', async () => {

    const newBlog = {
      title: "Testijuttu",
      author: "Antti Viljanen",
      url: "https://www.jotakiiinz.fi/testi",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')

    const likes = response.body.map(r => r.likes)

    expect(likes).not.toContain(undefined)
  })

  test('Returns 400 bad request if request does not include title and url', async () => {
    const newBlog = {
      url: "http://www.jokinosoite.com/testiblogi.html",
      likes: 1
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

  })

  describe('blog deletion', () => {
    test('succeeds with status 204 if deleted', async () => {
      const blogsInDb = await helper.blogsInDb()
      const blogToDelete = blogsInDb[0]
      await api.delete(`/api/blogs/${blogToDelete.id}`)
      expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      expect(blogsAtEnd).toHaveLength(
        helper.initialBlogs.length - 1
      )

      const titles = blogsAtEnd.map(r => r.title)

      expect(titles).not.toContain(blogToDelete.title)
    })
  })


  describe('blog edit', () => {
    test('succeeds with status 204 if edited', async () => {
      const blogsBeforeChanges = await helper.blogsInDb()
      const blogToEdit = blogsBeforeChanges[0]
      const changes = {
        title: 'Some new title',
        author: 'Another author',
        likes: 99
      }
      await api.put(`/api/blogs/${blogToEdit.id}`).send(changes)
      expect(204)

      const blogsAfterChanges = await helper.blogsInDb()

      expect(blogsAfterChanges).toHaveLength(helper.initialBlogs.length)

      const titlesAfter = blogsAfterChanges.map(r => r.title)

      expect(titlesAfter).toContain(changes.title)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})