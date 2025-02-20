import { v } from 'convex/values';
import { query, internalMutation, action, internalQuery, mutation, ActionCtx } from './_generated/server';
import { api, internal } from './_generated/api';
import { getApiClient } from './util';

export const getGame = query({
  args: {},
  handler: async (ctx) => {
    const game = await ctx.db.query('games').first();
    return game;
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const serveFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createAgent = action({
  args: {
    name: v.string(),
    prompt: v.string(),
    description: v.string(),
    avatarStorageId: v.string(),
    spriteStorageId: v.string(),
    status: v.string(),
    visibility: v.string(),
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

    const avatarStorageId = await uploadFile(ctx, args.avatarStorageId, 'avatar.png');
    const spriteStorageId = await uploadFile(ctx, args.spriteStorageId, 'sprite.png');

    const agent = await getApiClient().createAgent({
      name: args.name,
      avatarStorageId,
      spriteStorageId,
      prompt: args.prompt,
      description: args.description,
      status: args.status,
      visibility: args.visibility,
    });

    const id = (await ctx.runMutation(internal.game.saveAgent, {
      name: args.name,
      agentId: agent.id,
      prompt: args.prompt,
      description: args.description,
      avatarStorageId: args.avatarStorageId,
      spriteStorageId: args.spriteStorageId,
      status: args.status,
      visibility: args.visibility,
    })) as string;

    await ctx.runAction(api.game.syncGame, {
      gameId: game.gameId,
    });
    return id;
  },
});

export const updateAgent = action({
  args: {
    id: v.id('agents'),
    name: v.string(),
    prompt: v.string(),
    description: v.string(),
    avatarStorageId: v.string(),
    spriteStorageId: v.string(),
    status: v.string(),
    visibility: v.string(),
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
    let avatarStorageId = undefined;
    if (args.avatarStorageId !== agent.avatarStorageId) {
      avatarStorageId = await uploadFile(ctx, args.avatarStorageId, 'avatar.png');
    }
    let spriteStorageId = undefined;
    if (args.spriteStorageId !== agent.spriteStorageId) {
      spriteStorageId = await uploadFile(ctx, args.spriteStorageId, 'sprite.png');
    }
    await getApiClient().updateAgent({
      id: agent.agentId,
      updates: {
        name: args.name,
        avatarStorageId,
        spriteStorageId,
        prompt: args.prompt,
        description: args.description,
        status: args.status,
        visibility: args.visibility,
      },
    });
    await ctx.runMutation(internal.game.saveAgent, {
      id: args.id,
      agentId: agent.agentId,
      name: args.name,
      prompt: args.prompt,
      description: args.description,
      avatarStorageId: args.avatarStorageId,
      spriteStorageId: args.spriteStorageId,
      status: args.status,
      visibility: args.visibility,
    });
    await ctx.runAction(api.game.syncGame, {
      gameId: game.gameId,
    });
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

export const syncGame = action({
  args: { gameId: v.string() },
  handler: async (ctx, args) => {
    const remoteGames = await getApiClient().getGameList();
    const remoteGame = remoteGames.find((o) => o._id === args.gameId);
    if (!remoteGame) {
      throw new Error('Remote game not found');
    }
    const agents = await ctx.runQuery(internal.game.getAllAgents);
    const agentIds = agents.map((o) => o.agentId);
    await getApiClient().updateGame({
      id: args.gameId,
      updates: {
        agentIds,
      },
    });
  },
});

export const getAllAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('agents').collect();
  },
});

export const saveAgent = internalMutation({
  args: {
    id: v.optional(v.id('agents')),
    name: v.string(),
    agentId: v.string(),
    prompt: v.string(),
    description: v.string(),
    avatarStorageId: v.string(),
    spriteStorageId: v.string(),
    status: v.string(),
    visibility: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      await ctx.db.patch(args.id, {
        name: args.name,
        agentId: args.agentId,
        prompt: args.prompt,
        description: args.description,
        avatarStorageId: args.avatarStorageId,
        spriteStorageId: args.spriteStorageId,
        status: args.status,
        visibility: args.visibility,
      });
    } else {
      const id = await ctx.db.insert('agents', {
        name: args.name,
        agentId: args.agentId,
        prompt: args.prompt,
        description: args.description,
        avatarStorageId: args.avatarStorageId,
        spriteStorageId: args.spriteStorageId,
        status: args.status,
        visibility: args.visibility,
      });
      return id;
    }
  },
});

export const saveGameResources = internalMutation({
  args: {
    gameId: v.string(),
    gameName: v.string(),
  },
  handler: async (ctx, args) => {
    ctx.db.insert('games', {
      gameId: args.gameId,
      gameName: args.gameName,
    });
  },
});

async function uploadFile(ctx: ActionCtx, storageId: string, fileName: string) {
  const file = await ctx.storage.get(storageId);
  if (!file) throw new Error(`${storageId} not found`);
  const res = await getApiClient().upload(file, fileName);
  return res.storageId;
}
