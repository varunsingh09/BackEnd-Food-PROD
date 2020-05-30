var events = require('events');
var fs = require('fs');
var path = require('path');
var fileName = path.resolve('./utills/JournalDEV.txt');

var eventsEmitter = new events.EventEmitter();

eventsEmitter.on('read', readFileContent);
eventsEmitter.on('display', displayFileContent);
eventsEmitter.on('finished', finished);
eventsEmitter.emit('read', fileName);

async function readFileContent(fileName) {
  console.log('Reading ' + fileName + ' file started:\n');
  let content = await fs.readFile(fileName, 'utf8', readFile);
}

function displayFileContent(data) {
  console.log('File Data:');
  console.log(data);
  eventsEmitter.emit('finished');
}

function finished() {
  console.log(
    'Finished \nReading and Printing File content job is done successfully.\n'
  );
}

function readFile(err, data, fileName) {
  console.log('Reading ' + fileName + ' file done successfully.\n');
  eventsEmitter.emit('display', data);
}
