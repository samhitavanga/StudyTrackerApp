'use strict';

/**
 * daily-grade controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::daily-grade.daily-grade', ({ strapi }) => ({
  async create(ctx) {
    // Set the user ID to the authenticated user
    ctx.request.body.data.user = ctx.state.user.id;
    
    // Create the daily grade record
    const response = await super.create(ctx);
    return response;
  },

  async find(ctx) {
    // Only find records that belong to the authenticated user
    ctx.query.filters = {
      ...(ctx.query.filters || {}),
      user: ctx.state.user.id,
    };
    
    return await super.find(ctx);
  },

  async findOne(ctx) {
    // Ensure the record belongs to the authenticated user
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::daily-grade.daily-grade').findOne({
      where: { id, user: ctx.state.user.id },
    });

    if (!entity) {
      return ctx.notFound();
    }

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  async update(ctx) {
    // Ensure the record belongs to the authenticated user
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::daily-grade.daily-grade').findOne({
      where: { id, user: ctx.state.user.id },
    });

    if (!entity) {
      return ctx.notFound();
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    // Ensure the record belongs to the authenticated user
    const { id } = ctx.params;
    const entity = await strapi.db.query('api::daily-grade.daily-grade').findOne({
      where: { id, user: ctx.state.user.id },
    });

    if (!entity) {
      return ctx.notFound();
    }

    return await super.delete(ctx);
  }
}));
