const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let likes = blogs.reduce( (previousValue, currentValue) => {
        return previousValue + currentValue.likes
    }, 0)
    return likes
}

const favoriteBlog = (blogs) => {
    let max = {}
    let favorite = blogs.reduce((prev, current) => {
        if (prev.likes > current.likes) {
            max = prev
        } else {
            max = current
        }
        return max
    }, 0)
    return favorite
}

const mostBlogs = (blogs) => {
    tulos = Object.entries(_.countBy(blogs, "author")).reduce((prev, current) => (prev[1] > current[1]) ? prev : current )
    return { "author": tulos[0], "blogs": tulos[1] }
}

const mostLikes = (blogs) => {
    let merged = _.uniqWith(blogs, (previous, current) => {
        if (previous.author === current.author) {
            current.likes += previous.likes
            return true
        }
        return false
    })
    
    return _.maxBy(_.map(merged, item =>_.pick(item, ['author', 'likes'])), 'likes')
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}