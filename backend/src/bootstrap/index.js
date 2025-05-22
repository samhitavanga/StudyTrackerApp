'use strict';

const setPermissions = require('./set-permissions');

module.exports = async ({ strapi }) => {
  // Set up permissions after bootstrap
  await setPermissions({ strapi });
};
