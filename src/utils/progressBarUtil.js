const ProgressBar = require('progress');

function createProgressBar(title, total) {
  return new ProgressBar(`  downloading ${title} [:bar] :rate/bps :percent :etas`, {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total,
  });
}

function updateProgressBar(bar, progressEvent) {
  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  bar.update(percentCompleted / 100);
}

function terminateProgressBar(bar) {
  bar.terminate();
}

module.exports = {
  createProgressBar,
  updateProgressBar,
  terminateProgressBar,
};