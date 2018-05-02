export default ({ bit, children }) =>
  children({
    title: bit.title,
    icon: `/icons/${bit.icon}`,
    subtitle: bit.integration,
    content: bit.body,
  })
