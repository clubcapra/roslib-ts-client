import { TopicOptions, ServiceOptions } from '~/@types'

const getSignature = (name: string, type: string): string => {
  return `${name}/${type}`
}

export const getTopicSignature = ({
  name,
  messageType,
}: TopicOptions): string => {
  return getSignature(name, messageType)
}

export const getServiceSignature = ({
  name,
  serviceType,
}: ServiceOptions): string => {
  return getSignature(name, serviceType)
}
