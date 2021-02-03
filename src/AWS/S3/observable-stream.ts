import * as RX from 'rxjs'
import * as Stream from 'stream'

export const observableJSONStream = <T>(stream: Stream.Readable) => new RX.Observable<T>(subscriber => {

  Stream.finished(stream, (err) => {
    if (err) {
      subscriber.error(err)
    }
  })
  const endHandler = () => subscriber.complete()
  const errorHandler = (e: Error) => subscriber.error(e)
  const dataHandler = (data: T) => subscriber.next(data)

  stream.addListener('end', endHandler)
  stream.addListener('error', errorHandler)
  stream.addListener('data', dataHandler)

  return () => {
    stream.removeListener('end', endHandler)
    stream.removeListener('error', errorHandler)
    stream.removeListener('data', dataHandler)
  }
})
