import { uniq, capitalize } from 'lodash'
import rawTasks from './tasks'
import rawConvos from './conversations'
import rawDocs from './docs'

const tasks = rawTasks.map(title => ({
  title,
  body: '# ' + title,
  integration: 'github',
  type: 'task',
}))

const mdToTitle = md => md.split('\n')[0].slice(2)
const docs = rawDocs.map(body => ({
  title: mdToTitle(body),
  integration: 'google-docs',
  type: 'document',
  body,
  // url: `http://docs.google.com?id=${Math.random()}`,
}))

const convos = rawConvos.map(convo => {
  const title = uniq(
    convo.messages.map(({ author }) => capitalize(author)),
  ).join(', ')

  return {
    title,
    // integration: convo.type,
    integration: 'slack',
    data: { channel: 'status', messages: convo.messages },
    type: 'conversation',
    // type: 'conversation',
    body: `# ${title}
  ${convo.body}`,
  }
})

const deliverx = [
  {
    title: 'Anchit',
    type: 'website',
    integration: 'pin-site',
    url: 'http://deliverx.com/user',
  },
  {
    title: 'Late deliveries map',
    type: 'website',
    integration: 'pin-site',
    url: 'http://deliverx.com/map',
  },
  {
    title: 'Drivers',
    type: 'website',
    integration: 'pin-site',
    url: 'http://deliverx.com/drivers',
  },
]

const randUrl = () => `http://example.com?id=${Math.random()}`
export default [...convos, ...tasks, ...docs].map(item => ({
  ...item,
  url: item.url || randUrl(),
}))