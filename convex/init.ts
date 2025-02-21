import { action, ActionCtx } from './_generated/server';
import config from './config.json';
import { getApiClient, sleep } from './util';
import { internal } from './_generated/api';

export const initGameResources = action({
  args: {},
  handler: async (ctx) => {
    const client = getApiClient();

    console.log('Creating music...');
    const musicAudioStorageId = await uploadFile(ctx, config.music.audioUrl, 'music.mp3');
    const musicCoverStorageId = await uploadFile(ctx, config.music.coverUrl, 'cover.png');
    const { id: musicId } = await client.createMusic({
      audioStorageId: musicAudioStorageId,
      coverStorageId: musicCoverStorageId,
      description: config.music.description,
      status: config.music.status,
      title: config.music.title,
      visibility: config.music.visibility,
    });

    console.log('Creating map...');
    const mapStorageId = await uploadFile(ctx, config.map.imageUrl, 'map.png');
    const { id: mapId } = await client.createMap({
      storageId: mapStorageId,
      title: config.map.title,
      description: config.map.description,
      status: config.map.status,
      visibility: config.map.visibility,
      width: config.map.width,
      height: config.map.height,
    });

    console.log('Creating game...');
    const backgroundStorageId = await uploadFile(ctx, config.game.backgroundUrl, 'background.png');
    const logoStorageId = await uploadFile(ctx, config.game.logoUrl, 'logo.png');

    const { id: gameId } = await client.createGame({
      musicId,
      mapId,
      agentIds: [],
      backgroundStorageId,
      logoStorageId,
      twitterHandle: config.game.twitterHandle,
      title: config.game.title + '-' + new Date().getTime() / 1000000,
      description: config.game.description,
      visibility: config.game.visibility,
    });

    while (true) {
      console.log('Waiting for world status...');
      await sleep(1000);
      const worldStatus = await client.gameData.getWorldStatus(gameId);
      if (!worldStatus) continue;
      await ctx.runMutation(internal.game.saveGameResources, {
        gameId,
        gameName: worldStatus.name,
      });
      break;
    }
    console.log('Game resources initialized.');
  },
});

export async function uploadFile(_: ActionCtx, fileUrl: string, fileName: string) {
  const response = await fetch(fileUrl);
  const file = await response.blob();
  if (!file) throw new Error(`${fileUrl} not found`);
  const res = await getApiClient().upload(file, fileName);
  return res.storageId;
}
