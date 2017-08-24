import { User, Setting } from '@mcro/models'
import { store } from '@mcro/black/store'

@store
export default class Models {
  users = null

  start() {
    this.subscriptions.add(
      User.find().$.subscribe(users => {
        this.users = users

        if (this.users) {
          this.processUsers()
        }
      }).unsubscribe
    )
  }

  processUsers = () => {
    for (const user of this.users) {
      if (user.github) {
        this.ensureGithubSetting(user)
      }
    }
  }

  ensureGithubSetting = async user => {
    await Setting.findOrCreate({
      type: 'github',
      userId: user.id,
    })
  }

  dispose() {
    this.subscriptions.dispose()
  }
}
