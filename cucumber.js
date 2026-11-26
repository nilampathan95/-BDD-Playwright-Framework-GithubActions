module.exports = {
  default: {
    paths: ['features/login.feature'],
    requireModule: ['ts-node/register'],
    require: ['hooks/**/*.ts', 'step-definitions/**/*.ts'],
    parallel: 1
  }
};
