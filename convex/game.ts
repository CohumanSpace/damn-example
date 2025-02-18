import { v } from 'convex/values';
import { query, internalMutation, action } from './_generated/server';
import { api, internal } from './_generated/api';
import { getApiClient } from './util';

export const getGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await ctx.db.query('games').first();
    return game;
  },
});

export const createAgent = action({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.runQuery(api.game.getGame);
    if (!game) {
      throw new Error('Game not found');
    }
    const oldAgent = await ctx.runQuery(api.game.getAgentByName, {
      name: args.name,
    });
    if (oldAgent) {
      throw new Error('Agent already exists');
    }
    const agent = await getApiClient().createAgent({
      name: args.name,
      avatarStorageId: game.agentResources[0].agentAvatarStorageId,
      spriteStorageId: game.agentResources[0].agentAvatarStorageId,
      prompt: game.agentResources[0].agentConfig.description,
      description: game.agentResources[0].agentConfig.description,
      status: game.agentResources[0].agentConfig.status,
      visibility: game.agentResources[0].agentConfig.visibility,
    });

    await ctx.runAction(api.game.syncGame, {
      gameId: game.gameId,
    });

    const id = (await ctx.runMutation(internal.game.saveAgent, {
      name: args.name,
      agentId: agent.id,
      level: game.agentResources[0].level,
    })) as string;
    return id;
  },
});

export const getAgentById = query({
  args: {
    id: v.id('agents'),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.id);
    return agent;
  },
});

export const getAgentByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query('agents')
      .filter((q) => q.eq(q.field('name'), args.name))
      .first();
    return agent;
  },
});

export const upgradeAgent = action({
  args: {
    id: v.id('agents'),
  },
  handler: async (ctx, args) => {
    const game = await ctx.runQuery(api.game.getGame);
    if (!game) {
      throw new Error('Game not found');
    }
    const agent = await ctx.runQuery(api.game.getAgentById, {
      id: args.id,
    });
    if (!agent) {
      throw new Error('Agent not found');
    }
    const nextLevel = agent.level + 1;
    const nextAgent = game.agentResources.find((o) => o.level === nextLevel);
    if (!nextAgent) {
      throw new Error('Next agent not found');
    }
    await getApiClient().updateAgent({
      id: agent.agentId,
      updates: {
        ...nextAgent.agentConfig,
      },
    });
    await ctx.runAction(api.game.syncGame, {
      gameId: game.gameId,
    });
  },
});

export const syncGame = action({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const remoteGames = await getApiClient().getGameList();
    const remoteGame = remoteGames.find((o) => o._id === args.gameId);
    if (!remoteGame) {
      throw new Error('Remote game not found');
    }
    await getApiClient().updateGame({
      id: remoteGame._id,
      updates: {
        ...remoteGame,
      },
    });
  },
});

export const saveAgent = internalMutation({
  args: {
    id: v.optional(v.id('agents')),
    name: v.string(),
    agentId: v.string(),
    level: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      await ctx.db.patch(args.id, {
        name: args.name,
        agentId: args.agentId,
        level: args.level,
      });
    } else {
      const id = await ctx.db.insert('agents', {
        name: args.name,
        agentId: args.agentId,
        level: args.level,
      });
      return id;
    }
  },
});

export const saveGameResources = internalMutation({
  args: {
    gameId: v.string(),
    gameName: v.string(),
    agentResources: v.array(
      v.object({
        level: v.number(),
        agentConfig: v.object({
          name: v.string(),
          description: v.string(),
          avatarStorageId: v.string(),
          spriteStorageId: v.string(),
          status: v.string(),
          visibility: v.string(),
        }),
        agentAvatarStorageId: v.string(),
        agentSpriteStorageId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    ctx.db.insert('games', {
      gameId: args.gameId,
      gameName: args.gameName,
      agentResources: args.agentResources,
    });
  },
});
