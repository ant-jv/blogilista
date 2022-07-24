const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()

  const users = await User.find({})

  blogUserId = users[0]._id.toString()

  await Blog.deleteMany({})

  const initialBlogsWithUser = helper.initialBlogs.map(obj => ({ ...obj, user: blogUserId }))

  await Blog.insertMany(initialBlogsWithUser)

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

  beforeEach(async () => {
    const loggedUser = await api
      .post('/api/login')
      .send({ "username": "root", "password": "sekret" })
    
    authHeader = "bearer " + loggedUser._body.token

    const userlist = await helper.usersInDb()
    user_id = userlist[0].id
  })

  test('blog is added to the database', async () => {

      const newBlog = {
        title: "Testiblogi",
        author: "Antti Viljanen",
        url: "http://www.jokinosoite.com/testiblogi.html",
        likes: 0,
        user: user_id
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', authHeader)
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
      user: user_id
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', authHeader)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')

    const likes = response.body.map(r => r.likes)

    expect(likes).not.toContain(undefined)
  })

  test('Returns 400 bad request if request does not include title and url', async () => {
    const newBlog = {
      url: "http://www.jokinosoite.com/testiblogi.html",
      likes: 1,
      user: user_id
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', authHeader)
      .expect(400)
      .expect('Content-Type', /application\/json/)

  })

  describe('blog deletion', () => {
    test('succeeds with status 204 if deleted', async () => {
      const blogsInDb = await helper.blogsInDb()
      const blogToDelete = blogsInDb[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', authHeader)
        .expect(204)

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


//User tests

describe('when there is initially one user at db', () => {

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'aviljanen',
      name: 'Antti Viljanen',
      password: 'salane',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if no password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if no username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      password: '12345',
      name: 'Superuser',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username missing')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if password shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: '12',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password must be at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails if username shorter than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: '12',
      name: 'Superuser',
      password: '12345',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Username must be at least 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

})


afterAll(() => {
  mongoose.connection.close()
})