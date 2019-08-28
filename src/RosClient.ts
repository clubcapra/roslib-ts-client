import { Ros } from 'roslib'
import { TopicOptions, ServiceOptions } from '@/@types'
import TopicManager from '@/TopicManager'
import ServiceManager from '@/ServiceManager'

export default class RosClient {
  ros: Ros
  private topicManager: TopicManager
  private serviceManager: ServiceManager
  private robotIP?: string
  private port?: string
  private shouldTryToReconnect = false
  private connected = false
  private isLogEnabled = false

  constructor(
    robotIP = 'localhost',
    port = '9090',
    shouldTryToReconnect = false
  ) {
    const rosInstance = new Ros({})
    this.ros = rosInstance
    this.topicManager = new TopicManager(rosInstance)
    this.serviceManager = new ServiceManager(rosInstance)

    this.robotIP = robotIP
    this.port = port
    this.shouldTryToReconnect = shouldTryToReconnect
  }

  connect(
    robotIP = this.robotIP,
    port = this.port,
    shouldTryToReconnect = this.shouldTryToReconnect
  ) {
    this.shouldTryToReconnect = shouldTryToReconnect
    this.robotIP = robotIP
    this.port = port

    const url = `wss://${robotIP}:${port}`

    // if (this.connected) {
    //   this.ros.close()
    //   this.ros = new Ros({})
    //   this.initListeners()
    // }

    this.ros.connect(url)
  }

  enableLogging() {
    this.isLogEnabled = true
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

  setListeners(
    onConnection: Function,
    onClose: Function,
    onError: (error: unknown) => void
  ) {
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
      if (process.env.NODE_ENV !== 'production' && this.isLogEnabled) {
        console.error('RosError', error)
      }

      onError(error)

      if (this.shouldTryToReconnect) {
        this.connect(this.robotIP, this.port, this.shouldTryToReconnect)
      }
    }
  }
}
