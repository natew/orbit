import iconGCalendar from '~/../public/icons/gcalendar.svg'
import iconGDocs from '~/../public/icons/gdocs.svg'
import iconGDrive from '~/../public/icons/gdrive.svg'
import iconGMail from '~/../public/icons/gmail.svg'
import iconGSheets from '~/../public/icons/gsheets.svg'
import iconSlack from '~/../public/icons/slack.svg'
import iconGithub from '~/../public/icons/github.svg'

const icons = {
  gcalendar: iconGCalendar,
  gdocs: iconGDocs,
  gdrive: iconGDrive,
  gmail: iconGMail,
  gsheets: iconGSheets,
  slack: iconSlack,
  github: iconGithub,
}

export default ({ name, ...props }) => <img src={icons[name]} {...props} />