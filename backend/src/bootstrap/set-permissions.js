'use strict';

/**
 * Set up the default permissions when Strapi bootstraps
 */

module.exports = async ({ strapi }) => {
  // Find the ID of the public role
  const publicRole = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'authenticated' } });

  if (!publicRole) {
    return;
  }

  // Get all existing permissions
  const permissions = await strapi
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: publicRole.id } });

  // Create a map of the current permissions
  const permissionsMap = permissions.reduce((acc, permission) => {
    acc[`${permission.action}`] = permission.id;
    return acc;
  }, {});

  // Define the permissions you want to set
  const permissionsToSet = [
    // Users permissions
    { action: 'plugin::users-permissions.user.me', enabled: true },
    { action: 'plugin::users-permissions.user.find', enabled: true },
    { action: 'plugin::users-permissions.user.findOne', enabled: true },
    
    // Daily grade permissions
    { action: 'api::daily-grade.daily-grade.find', enabled: true },
    { action: 'api::daily-grade.daily-grade.findOne', enabled: true },
    { action: 'api::daily-grade.daily-grade.create', enabled: true },
    { action: 'api::daily-grade.daily-grade.update', enabled: true },
    { action: 'api::daily-grade.daily-grade.delete', enabled: true },
    
    // Subject entry permissions
    { action: 'api::subject-entry.subject-entry.find', enabled: true },
    { action: 'api::subject-entry.subject-entry.findOne', enabled: true },
    { action: 'api::subject-entry.subject-entry.create', enabled: true },
    { action: 'api::subject-entry.subject-entry.update', enabled: true },
    { action: 'api::subject-entry.subject-entry.delete', enabled: true }
  ];

  // Update the permissions
  for (const permission of permissionsToSet) {
    if (permissionsMap[permission.action]) {
      // Update existing permission
      await strapi.query('plugin::users-permissions.permission').update({
        where: { id: permissionsMap[permission.action] },
        data: { enabled: permission.enabled }
      });
      console.log(`Updated permission for ${permission.action} to ${permission.enabled}`);
    } else {
      console.log(`Permission ${permission.action} not found. Please check action names.`);
    }
  }

  console.log('Permissions setup completed');
};
