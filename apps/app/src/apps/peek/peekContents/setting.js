import * as React from 'react'
import { view } from '@mcro/black'
import { App } from '@mcro/all'
import { Bit, Job } from '@mcro/models'
import PeekHeader from '../peekHeader'
import { capitalize } from 'lodash'
import * as UI from '@mcro/ui'
import * as SettingPanes from './settingPanes'

const EmptyPane = () => <div>no setting pane</div>

@view({
  store: class SettingStore {
    version = 0
    job = null
    bitsCount = null

    get setting() {
      return this.props.appStore.settings[this.selectedItem.integration]
    }

    get selectedItem() {
      return App.state.selectedItem
    }

    async willMount() {
      this.setInterval(this.update, 1000)
      this.update()
    }

    update = async () => {
      const { integration } = this.selectedItem
      this.job = await Job.findOne({
        where: { type: integration },
        order: { createdAt: 'DESC' },
      })
      this.bitsCount = await Bit.createQueryBuilder()
        .where({ integration })
        .getCount()
      this.version += 1
    }
  },
})
export class SettingView {
  render({ appStore, store }) {
    if (!store.setting || !store.setting.token) {
      console.log('no setting or token', store.setting)
      return null
    }
    store.version
    const { setting, selectedItem } = store
    const { integration, type } = selectedItem
    // tries googleMail
    // falls back to google
    const SettingPane =
      SettingPanes[`${integration}${capitalize(type)}`] ||
      SettingPanes[integration] ||
      EmptyPane
    return (
      <React.Fragment>
        <PeekHeader
          title={capitalize(integration)}
          subtitle={
            <div $$row if={store.job}>
              {store.bitsCount} total{' '}
              <UI.Text>&nbsp;| {store.job.status}</UI.Text>
              <UI.Text>
                &nbsp;| <UI.Date>{store.job.updatedAt}</UI.Date>
              </UI.Text>
            </div>
          }
          after={
            <UI.Row $$flex css={{ opacity: 0.2 }}>
              <UI.Button
                icon="refresh"
                tooltip="Refresh"
                onClick={async () => {
                  const job = new Job()
                  job.type = integration
                  job.action = 'mail'
                  job.status = Job.statuses.PENDING
                  await job.save()
                  console.log('created new job', job)
                  store.update()
                  appStore.getSettings()
                }}
              />
              <UI.Popover
                openOnHover
                openOnClick
                target={<UI.Button icon="gear" />}
              >
                <UI.List background>
                  <UI.ListItem primary="hello2" />
                  <UI.ListItem primary="hello3" />
                  <UI.ListItem
                    primary="remove integration"
                    onClick={async () => {
                      store.setting.values = {}
                      store.setting.token = ''
                      await store.setting.save()
                      store.update()
                    }}
                  />
                </UI.List>
              </UI.Popover>
            </UI.Row>
          }
        />
        <body>
          <SettingPane
            appStore={appStore}
            setting={setting}
            update={store.update}
          />
          <pre if={false} css={{ opacity: 0.5 }}>
            {JSON.stringify(store.setting.values.oauth || null, 0, 2)}
          </pre>
        </body>
      </React.Fragment>
    )
  }

  static style = {
    body: {
      padding: 20,
      flex: 1,
    },
  }
}