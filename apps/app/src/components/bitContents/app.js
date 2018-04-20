export default ({ result, children }) =>
  children({
    title: result.title,
    icon: `/icons/${result.icon}`,
    subtitle: result.integration,
    content: result.body,
  })