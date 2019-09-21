const fetch = require("node-fetch")
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const app = express()
const port = 5000

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.get("/", (req, res) => {
  res.send("api running")
})

app.get("/instagram", (req, res) => {
  let instagram_data

  const fetchUser = async () => {
    const url = `https://www.instagram.com/${req.query.username}/?__a=1`
    try {
      const data = await fetch(url)
      const json = await data.json()
      const user = json.graphql.user
      const feed = json.graphql.user.edge_owner_to_timeline_media.edges

      let likes = 0,
        comments = 0

      feed.forEach(post => {
        const l = post.node.edge_liked_by.count
        const c = post.node.edge_media_to_comment.count
        likes += l
        comments += c
      })

      const averageLikes = (likes / feed.length).toFixed(0),
        averageComments = (comments / feed.length).toFixed(0),
        totalEngagement = (
          ((Number(averageLikes) + Number(averageComments)) /
            user.edge_followed_by.count) *
          100
        ).toFixed(2)

      instagram_data = {
        user: {
          full_name: user.full_name,
          username: user.username,
          id: user.id,
          profile_picture: user.profile_pic_url_hd,
          link: user.external_url,
          bio: user.biography,
          followed_by: user.edge_followed_by.count,
          following: user.edge_follow.count,
          likes_avg: averageLikes,
          comments_avg: averageComments,
          totalEngagementRate: totalEngagement,
          posts: feed
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (req.query.username) {
    fetchUser().then(() => res.send(JSON.stringify(instagram_data)))
  } else {
    instagram_data = {
      message: "You must pass a username query into the URL."
    }
    res.send(JSON.stringify(instagram_data))
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
