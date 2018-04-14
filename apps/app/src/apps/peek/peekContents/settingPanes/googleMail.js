import * as React from 'react'
import * as UI from '@mcro/ui'
import { view } from '@mcro/black'
import OrbitIcon from '~/apps/orbit/orbitIcon'

@view({
  store: class GmailStore {
    max = ''

    willMount() {
      const settings = this.props.setting.values.syncSettings || { max: 50 }
      this.max = settings.max
    }
  },
})
export default class GoogleMailSetting {
  render({ store, setting, update }) {
    const { syncSettings = { max: 50 } } = setting.values
    return (
      <gmailSetting>
        <OrbitIcon icon="gmail" />
        <UI.Field
          row
          label="Max"
          value={store.max}
          onChange={async e => {
            store.max = e.target.value
            setting.values.syncSettings = {
              ...syncSettings,
              max: store.max,
            }
            await setting.save()
            update()
          }}
        />
      </gmailSetting>
    )
  }
}
