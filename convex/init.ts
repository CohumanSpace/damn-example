'use node';
import { action, ActionCtx } from './_generated/server';
import config from './config.json';
import { getApiClient } from './util';
import { internal } from './_generated/api';

type Config = typeof config;

export const initGameResources = action({
  args: {},
  handler: async (ctx) => {
    const client = getApiClient();

    const musicAudioStorageId = await uploadFile(ctx, config.music.audioStorageId, 'music.mp3');
    const musicCoverStorageId = await uploadFile(ctx, config.music.coverStorageId, 'cover.png');
    const { id: musicId } = await client.createMusic({
      audioStorageId: musicAudioStorageId,
      coverStorageId: musicCoverStorageId,
      description: config.music.description,
      status: config.music.status,
      title: config.music.title,
      visibility: config.music.visibility,
    });

    const mapStorageId = await uploadFile(ctx, config.map.storageId, 'map.png');
    const { id: mapId } = await client.createMap({
      storageId: mapStorageId,
      title: config.map.title,
      description: config.map.description,
      status: config.map.status,
      visibility: config.map.visibility,
      width: config.map.width,
      height: config.map.height,
    });

    const agentResources = [];
    for (let i = 1; i <= 4; i++) {
      const agentResource = await buildAgentResource(ctx, config, i);
      agentResources.push(agentResource);
    }

    const backgroundStorageId = await uploadFile(ctx, config.game.backgroundStorageId, 'background.png');
    const logoStorageId = await uploadFile(ctx, config.game.logoStorageId, 'logo.png');

    const { id: gameId } = await client.createGame({
      musicId,
      mapId,
      agentIds: [],
      backgroundStorageId,
      logoStorageId,
      twitterHandle: config.game.twitterHandle,
      title: config.game.title,
      description: config.game.description,
      visibility: config.game.visibility,
    });

    const worldStatus = await client.gameData.getWorldStatus(gameId);

    ctx.runMutation(internal.game.saveGameResources, {
      gameId,
      gameName: worldStatus.name,
      agentResources,
    });
  },
});

async function buildAgentResource(ctx: ActionCtx, config: Config, level: number) {
  const agentConfig = config.agents.find((o) => o.level === level)!;
  const agentAvatarStorageId = await uploadFile(ctx, agentConfig.avatarStorageId, 'avatar.png');
  const agentSpriteStorageId = await uploadFile(ctx, agentConfig.spriteStorageId, 'sprite.png');
  return { level, agentConfig, agentAvatarStorageId, agentSpriteStorageId };
}

async function uploadFile(ctx: ActionCtx, storageId: string, fileName: string) {
  const music = await ctx.storage.get(storageId);
  const buffer = await music?.arrayBuffer();
  const res = await getApiClient().upload(Buffer.from(buffer!), fileName);
  return res.storageId;
}
