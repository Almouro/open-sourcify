#! /usr/bin/env node

const spawn = require('cross-spawn');
const fs = require('fs');
const merge = require('lodash').merge;
const get = require('lodash').get;
const chalk = require('chalk');

const readJSON = filePath => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const writeJSON = (filePath, jsonContent) =>
  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2) + '\n');

const executeCommand = command => {
  const commandParts = command.split(' ');
  return spawn.sync(commandParts[0], commandParts.slice(1), { stdio: 'inherit' });
};

const extendPackageJson = (newProperties) => {
  const packageJsonContents = readJSON('package.json');
  writeJSON('package.json', merge({}, packageJsonContents, newProperties));
}

const setupSemanticRelease = () => {
  console.log('Setting up Semantic Release for automatic publishing...');

  const packageJsonContents = readJSON('package.json');
  if (get(packageJsonContents, 'scripts.semantic-release')) {
    console.log(chalk.green('Semantic Release already setup!'));
    return;
  };

  executeCommand('yarn global add semantic-release-cli');
  executeCommand('semantic-release-cli setup');
  extendPackageJson({
    version: '0.0.0-managed-by-semantic-release',
  });

  console.log(chalk.green('Semantic Release set up!'));
};

const setupCommitMessageValidation = () => {
  console.log('Setting up Commit messages validation...');

  const packageJsonContents = readJSON('package.json');
  if (get(packageJsonContents, 'scripts.commitmsg')) {
    console.log(chalk.green('Commit messages validation already setup!'));
    return;
  };

  executeCommand(
    'yarn add --dev husky validate-commit-msg'
  );
  extendPackageJson({
    scripts: {
      commitmsg: 'validate-commit-msg',
    },
  });

  console.log(chalk.green('Commit messages validation set up!'));
};

const setupCommitizen = () => {
  console.log('Setting up Commitizen...');

  const packageJsonContents = readJSON('package.json');
  if (get(packageJsonContents, 'config.commitizen')) {
    console.log(chalk.green('Commitizen already setup!'));
    return;
  };

  executeCommand(
    'yarn add --dev commitizen cz-conventional-changelog'
  );
  extendPackageJson({
    config: {
      commitizen: {
        path: './node_modules/cz-conventional-changelog',
      },
    },
    scripts: {
      commit: 'git-cz',
    },
  });

  console.log(chalk.green('Commitizen set up!'));
}

setupSemanticRelease();
setupCommitMessageValidation();
setupCommitizen();
