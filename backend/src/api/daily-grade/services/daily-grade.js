'use strict';

/**
 * daily-grade service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::daily-grade.daily-grade');
