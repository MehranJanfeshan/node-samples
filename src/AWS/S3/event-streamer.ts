import * as AWS from 'aws-sdk'
import * as JSONStream from 'jsonstream'
import * as Stream from 'stream'
import * as Zlib from 'zlib'
import { observableJSONStream } from './observable-stream'
import { filter, map } from 'rxjs/operators'

export interface EventArchiveRepository {
  getObjectStream(key: string)
}

interface SingleEvent {
  property: {
    random: number
    bool: boolean,
    date: string
    regEx: string
    enum: string
    firstname: string
    lastname: string
    city: string
    country: string
    countryCode: string
    email: string
    expression: string
  }
}


export default function client(bucketName: string, region = 'ap-southeast-1'): EventArchiveRepository {
  const s3Client = new AWS.S3({
    region
  })

  async function getObjectStream(key: string) {
    const decodedUrl = decodeURIComponent(key)

    const onError = (error: Error) => {
      console.error('Failed to stream event archive from s3', error, { bucketName, key })
      cleanup()
      stream.destroy(error)
    }
    const onEnd = () => {
      cleanup()
    }
    const cleanup = () => {
      stream.removeListener('error', onError)
      stream.removeListener('end', onEnd)
    }

    // @ts-ignore
    const stream: Stream.Readable = s3Client.getObject({
      Bucket: bucketName,
      Key: decodedUrl
    }).createReadStream()
      .addListener('error', onError)
      .addListener('end', onEnd)
      .pipe(Zlib.createGunzip())
      .pipe(JSONStream.parse('propertyArray.*'))
    // const tete = []
    observableJSONStream<SingleEvent>(stream).pipe(
      filter(x => {
        return x.property.random > 2
      }),
      map(x => new Promise((resolve, _) => {
        console.log('This a random number: ', x.property.random)
        return setTimeout(() => {
          resolve(x.property.random)
        }, x.property.random * 2000)
      }))
    ).subscribe(async (item) => {
      const test = await item
      console.log(test)
    })
  }

  return { getObjectStream }
}
