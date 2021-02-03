import S3Streamer from './event-streamer'
const s3Streamer = S3Streamer("testglueupload")
s3Streamer.getObjectStream("sample.json.gz")
