const { exec } = require('child_process');

export const openUrlInBrowser = (url: string) => {
  function escapeCmdString(input: string): string {
    return input.replace(/([\^&<>\|"\(\)%!])/g, '^$1');
  }
  const platform = process.platform;
  const url1 = escapeCmdString(url)

  let command;
  if (platform === 'win32') {
    command = `start ${url1}`; // Windows
  } else if (platform === 'darwin') {
    command = `open ${url}`; // macOS
  } else {
    command = `xdg-open ${url}`; // Linux
  }

  exec(command, (error: Error) => {
    if (error) {
      console.error('Failed to open URL:', error);
    }
  });
};