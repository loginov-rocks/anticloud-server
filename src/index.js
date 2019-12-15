const fs = require('fs');
const express = require('express');
const path = require('path');
const uuid = require('uuid/v1');

const app = express();

const configFilePath = path.resolve(__dirname, '../storage/config.json');

const readConfig = () => {
  return JSON.parse(fs.readFileSync(configFilePath));
};

const writeConfig = (config) => {
  return fs.writeFileSync(configFilePath, JSON.stringify(config));
};

const findParent = (arr, id) => {
  let parent = arr.find(dir => dir.id === id);

  if (!parent) {
    for (let dir of arr) {
      const subparent = findParent(dir.directories, id);

      if (subparent) {
        return subparent;
      }
    }
  }

  return parent;
};

app.use(express.json());

app.get('/mount', (req, res) => {
  const { mount } = readConfig();

  res.send(mount);
});

app.post('/mount', (req, res) => {
  const { mount } = req.body;
  const config = readConfig();
  config.mount = mount;
  writeConfig(config);

  res.send();
});

app.post('/directory', (req, res) => {
  const { name, parentId } = req.body;
  const id = uuid();
  const directory = { name, id, directories: [] };
  const config = readConfig();

  let parent = config;

  if (parentId) {
    const testParent = findParent(config.directories, parentId);
    if (testParent) {
      parent = testParent;
    }
  }

  parent.directories.push(directory);
  writeConfig(config);

  res.send(directory);
});

app.get('/directories', (req, res) => {
  const config = readConfig();

  res.send(config.directories);
});

app.use((error, req, res, next) => {
  res.status(400).send(error);
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
