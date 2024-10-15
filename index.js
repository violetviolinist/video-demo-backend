const express = require("express")
const cors = require("cors")
const app = express()
const fs = require("fs")
const path = require("path")
const { printValue, generateDashPlaylist } = require("./utils")

const publicAssetsPath = __dirname + "/public"
const videoPath = path.join(publicAssetsPath, "sample.mp4")
const videoSize = fs.statSync(videoPath).size
const CHUNK_SIZE = 1_000_000

app.use(cors())

// app.use((_, res, next) => {
//   res.removeHeader("Accept-Ranges")
//   next()
// })

app.get("/", (req, res) => {
    res.sendFile(path.join(publicAssetsPath, "index.html"))
})

app.get("/sample-in-chunks", (req, res) => {
  const range = req.range(videoSize)[0]

  if (range === -1)  {
    res.status(416).send("Requested range not satisfiable")
  }

  let { start: rangeStart, end: rangeEnd } = range

  rangeEnd = Math.min(rangeEnd, rangeStart + CHUNK_SIZE - 1)
  rangeEnd = Math.min(rangeEnd, videoSize - 1)

  printValue("Range requested", `${rangeStart} - ${rangeEnd}`)

  const headers = {
    "Content-Range": `bytes ${rangeStart}-${rangeEnd}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": rangeEnd - rangeStart + 1,
    "Content-Type": "video/mp4",
  }

  res.writeHead(206, headers)

  const videoStream = fs.createReadStream(videoPath, { start: rangeStart, end: rangeEnd })
  videoStream.pipe(res)
})

app.get("/stream.mpd", (req, res) => {
  res.setHeader("Content-Type", "application/dash+xml")
  res.sendFile(path.join(publicAssetsPath, "stream.mpd"))
})

app.use(express.static('public', { acceptRanges: false }))

app.listen(3005, async () => {
    console.log("Listening on port 3005!")
})
