const listHelper = require('../utils/list_helper')

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

describe('dummyTest', () => {
  test('dummy returns one', async () => {
    const result = await listHelper.dummy(blogs)
    expect(result).toBe(1)
  })
})

describe('likesTest', () => {
  test('returns 36 likes', async () => {
    const result = await listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})

describe('favoriteTest', () => {
  
  test('Returns the blog with most likes.', () => {
    expectedResult = {"__v": 0, "_id": "5a422b3a1b54a676234d17f9", "author": "Edsger W. Dijkstra", "likes": 12, "title": "Canonical string reduction", "url": "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"}
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(expectedResult)
  })
})

describe('mostBlogsTest', () => {
  
  test('Returns the author with most blog articles.', async () => {
    expectedResult = {author: "Robert C. Martin", "blogs": 3}
    const result = await listHelper.mostBlogs(blogs)
    expect(result).toEqual(expectedResult)
  })
})

describe('mostLikesTest', () => {
  
  test('Returns the author with most likes.', async () => {
    expectedResult = { author: 'Edsger W. Dijkstra', likes: 17 }
    const result = await listHelper.mostLikes(blogs)
    expect(result).toEqual(expectedResult)
  })
})