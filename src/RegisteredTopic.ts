import { Topic } from 'roslib'
import { TopicOptions } from './@types'

export default class RegisteredTopic {
  public handlers: Function[] = []
  public topic: Topic | undefined | null
  public options: TopicOptions

  constructor(options: TopicOptions, handler: Function) {
    this.handlers = [handler]
    this.topic = undefined
    this.options = options
  }
}
