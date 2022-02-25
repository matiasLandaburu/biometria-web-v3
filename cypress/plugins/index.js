module.exports = (on, config) => {
  on('before:browser:launch', (browser, launchOptions) => {
    launchOptions.args = launchOptions.args.filter((arg) => {
          return arg !== "--use-fake-ui-for-media-stream" && arg !== "--use-fake-device-for-media-stream"
        })
    launchOptions.args.push('--allow-file-access-from-files')
   
    return launchOptions
  })
}
