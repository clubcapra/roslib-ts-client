import { Ros } from 'roslib'
import { TopicOptions, ServiceOptions } from '@/@types'
import TopicManager from '@/TopicManager'
import ServiceManager from '@/ServiceManager'

interface RosClientOptions {
  shouldTryToReconnect: boolean
  enableLogging: boolean
  enableSsl: boolean
}

const defaultOptions: RosClientOptions = {
  shouldTryToReconnect: false,
  enableLogging: false,
  enableSsl: false,
}

export default class RosClient {
  ros: Ros
  private topicManager: TopicManager
  private serviceManager: ServiceManager
  private robotIP?: string
  private port?: string
  private connected = false
  private options: RosClientOptions

  constructor(
    robotIP = 'localhost',
    port = '9090',
    options: RosClientOptions = defaultOptions
  ) {
    const rosInstance = new Ros({})
    this.ros = rosInstance
    this.topicManager = new TopicManager(rosInstance)
    this.serviceManager = new ServiceManager(rosInstance)

    this.robotIP = robotIP
    this.port = port
    this.options = options
  }

  setOptions(options: RosClientOptions) {
    this.options = options
  }

  connect(robotIP = this.robotIP, port = this.port) {
    this.robotIP = robotIP
    this.port = port

    const protocol = this.options.enableSsl ? 'wss' : 'ws'
    const url = `${protocol}://${robotIP}:${port}`

    this.ros.connect(url)
  }

  disconnect() {
    this.ros.close()
  }

  subscribe(options: TopicOptions, handler: Function) {
    this.topicManager.subscribe(options, handler)
  }

  unsubscribe(options: TopicOptions) {
    this.topicManager.unsubscribe(options)
  }

  publish(options: TopicOptions, payload: any) {
    this.topicManager.publish(options, payload)
  }

  callService(options: ServiceOptions, payload?: any) {
    return this.serviceManager.callService(options, payload)
  }

  setListeners({
    onConnection,
    onClose,
    onError,
  }: {
    onConnection: () => void
    onClose: () => void
    onError: (error: unknown) => void
  }) {
    this.ros.on('connection', this.onConnection(onConnection))
    this.ros.on('close', this.onClose(onClose))
    this.ros.on('error', this.onError(onError))
  }

  private onConnection(onConnection: Function) {
    return () => {
      this.topicManager.reconnectAllDisconnectedHandler()
      this.connected = true
      onConnection()
    }
  }

  private onClose(onClose: Function) {
    return () => {
      this.topicManager.unsubscribeAllTopics()
      this.connected = false
      onClose()
    }
  }

  private onError(onError: (error: unknown) => void): (event: any) => void {
    return error => {
      this.connected = false
      if (process.env.NODE_ENV !== 'production' && this.options.enableLogging) {
        console.error('RosError', error)
      }

      onError(error)

      if (this.options.shouldTryToReconnect) {
        this.connect(this.robotIP, this.port)
      }
    }
  }
}
