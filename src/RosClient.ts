import { Ros } from 'roslib'
import { TopicOptions, ServiceOptions } from './@types'
import TopicManager from '~/TopicManager'
import ServiceManager from '~/ServiceManager'

export default class RosClient {
  public ros: Ros
  private topicManager: TopicManager
  private serviceManager: ServiceManager
  private robotIP?: string
  private port?: string
  private shouldTryToReconnect: boolean = false
  private connected: boolean = false
  private isLogEnabled: boolean = false

  private constructor() {
    const rosInstance = new Ros({})
    this.ros = rosInstance
    this.topicManager = new TopicManager(rosInstance)
    this.serviceManager = new ServiceManager(rosInstance)
  }

  connect(
    robotIP = 'localhost',
    port = '9090',
    shouldTryToReconnect = false
  ): void {
    this.shouldTryToReconnect = shouldTryToReconnect
    this.robotIP = robotIP
    this.port = port

    const url = `ws://${robotIP}:${port}`

    // if (this.connected) {
    //   this.ros.close()
    //   this.ros = new Ros({})
    //   this.initListeners()
    // }

    this.ros.connect(url)
  }

  enableLogging(): void {
    this.isLogEnabled = true
  }

  disconnect(): void {
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

  callService(options: ServiceOptions, payload?: any): Promise<any> {
    return this.serviceManager.callService(options, payload)
  }

  setListeners(onConnection: Function, onClose: Function, onError: Function) {
    this.ros.on('connection', this.onConnection(onConnection))
    this.ros.on('close', this.onClose(onClose))
    this.ros.on('error', this.onError(onError))
  }

  private onConnection(onConnection: Function): (event: any) => void {
    return () => {
      this.topicManager.reconnectAllDisconnectedHandler()
      this.connected = true
      onConnection()
    }
  }

  private onClose(onClose: Function): (event: any) => void {
    return () => {
      this.topicManager.unsubscribeAllTopics()
      this.connected = false
      onClose()
    }
  }

  private onError(onError: Function): (event: any) => void {
    return error => {
      this.connected = false
      if (process.env.NODE_ENV !== 'production' && this.isLogEnabled) {
        console.error('RosError', error)
      }

      onError(error)

      if (this.shouldTryToReconnect) {
        this.connect(this.robotIP, this.port, true)
      }
    }
  }
}