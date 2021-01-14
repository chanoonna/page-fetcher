const fs = require('fs');
const request = require('request');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let path = process.argv[2];

request('http://www.example.edu/', (error, response, body) => {
  if (error) {
    console.log(`Error:`, error);
    process.exit();
  }
  console.log('statusCode:', response && response.statusCode);
  downloadFile(body, "wx");
});

const getInput = function(text, data, callback) {
  rl.question(text, (answer) => {
    callback(answer, data);
  });
};

const fileExist = function(answer, data) {
  if (answer === 'y') {
    downloadFile(data, "w");
  } else {
    console.log('Terminating process');
    process.exit();
  }
};

const invalidPath = function(answer, data) {
  if (answer === '.exit') {
    console.log("Canceling download.");
    process.exit();
  } else {
    path = answer;
    downloadFile(data, 'wx');
  }
};

const downloadFile = function(data, filemode) {
  fs.open(path, filemode, (err, fd) => {
    
    if (err) {
      if (err.code === "EEXIST") {
        console.log("File already exsit.");
        getInput("Do you want to overwrite it? (y/n): ", data, fileExist);
      } else if (err.code === "ENOENT") {
        console.log("File path is invalid");
        getInput("New path (.exit to quite): ", data, invalidPath);
      } else {
        console.log(err);
        process.exit();
      }
    } else {
      console.log("Beginning download...");
      beginDownload(path, data, fd);
    }
  });
};

const printSize = function(path, fd) {
  let stats = fs.statSync(path);
  console.log(`File sizes: ${stats.size}`);
  fs.close(fd, () => process.exit());
};

const beginDownload = function(path, data, fd) {
  fs.writeFile(path, data, (err) => {
    if (err) {
      console.log(err);
      fs.close(fd, () => console.log("Ending download process."));
      process.exit();
    }
    console.log("Download complete.");
    printSize(path, fd);
  });
};

