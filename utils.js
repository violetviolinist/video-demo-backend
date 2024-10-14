const ffmpeg = require('fluent-ffmpeg')
const { existsSync } = require('fs')

ffmpeg.setFfmpegPath("/usr/local/bin/ffmpeg")

exports.printValue = (name, value) => {
  console.log(`${name}: ${value}`)
}

exports.generateDashPlaylist = async ({
  videoPath,
  outputPath,
}) => {
  return new Promise((resolve, reject) => {
    try {
      if (existsSync(outputPath)) {
        return reject(new Error("File already exists at output path"))
      }
    
      ffmpeg(videoPath)
      .outputOptions([
        '-f dash',
        '-init_seg_name init_$RepresentationID$.m4s',
        '-media_seg_name chunk_$RepresentationID$_$Number%05d$.m4s',
        '-use_timeline 1',
        '-use_template 1',
        '-window_size 5',
        '-adaptation_sets "id=0,streams=v id=1,streams=a"',
    
        // Video options
        '-map 0:v:0',
        '-c:v:0 libx264',
        '-b:v:0 500k',
        '-s:v:0 640x360',
    
        // Audio options
        '-map 0:a:0',
        '-c:a:0 aac',
        '-b:a:0 128k',
      ])
      .output(outputPath)
      .on("start", () => {
        console.log("Started DASH transcoding")
      })
      .on("progress", (progress) => {
        console.log(`Progress: ${progress.percent.toFixed(2)}%`)
      })
      .on("end", () => {
        console.log("DASH transcoding finished")
        resolve()
      })
      .on("error", (err, stdout, stderr) => {
        return reject(err)
      })
      .run()
    } catch (err) {
      console.log(err)
      return reject(err)
    }
  })
}
