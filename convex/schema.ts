import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  games: defineTable({
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
  }),
  agents: defineTable({
    name: v.string(),
    agentId: v.string(),
    level: v.number(),
  }),
});
