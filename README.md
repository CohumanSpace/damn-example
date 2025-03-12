# DAMN.FUN SDK (Demo)

<div align="center">
  <img src="./public/damn-fun-banner.png" alt="DAMN.FUN Banner" width="100%" />
</div>

DAMN SDK—DAMN.FUN's NodeJS Server SDK for deploying AI-native games powered Digimon Engine. This is a demo project for the DAMN.FUN SDK, showing how to use the SDK to integrate or create an AI-native game.

## Quickstart

### Requirement

node > 18.19

### Install

```
npm install @damn-fun/sdk
```

### Get your API key

Visit [damn.fun](https://damn.fun/)

### Create a client

```typescript
const baseUrl = 'https://node.damn.fun';
const apiKey = 'your api key';
const client = new ApiClient({ baseUrl, apiKey });
```

### Upload assets(png, jpg, mp3, etc.)

```typescript
const fileBuffer = fs.readFileSync('damn-logo.png');
const blob = new Blob([fileBuffer], { type: 'image/png' });
const uploadRes = await getApiClient().upload(blob, 'damn-logo.png');
```

### Create map

```typescript
client.createMap({
  storageId: 'storage id from upload',
  title: 'string',
  description: 'string',
  status: 'string',
  visibility: 'string',
  width: 1000,
  height: 1000,
});
```

### Update map

```typescript
client.updateMap({
  id: 'map id',
  updates: { title: 'new title' },
});
```

### Map list

```typescript
client.getMapList();
```

### Create music

```typescript
client.createMusic({
  audioStorageId: 'storage id from upload',
  coverStorageId: 'storage id from upload',
  description: 'string',
  status: 'string',
  title: 'string',
  visibility: 'string',
});
```

### Update music

```typescript
client.updateMusic({
  id: 'music id',
  updates: { title: 'new title' },
});
```

### Music list

```typescript
client.getMusicList();
```

### Create agent

```typescript
client.createAgent({
  avatarStorageId: 'storage id from upload',
  spriteStorageId: 'storage id from upload',
  prompt: 'string',
  name: 'string',
  description: 'string',
  status: 'string',
  visibility: 'string',
});
```

### Update agent

```typescript
client.updateAgent({
  id: 'agent id',
  updates: { name: 'new name' },
});
```

### Agent list

```typescript
client.getAgentList();
```

### Create game

```typescript
client.createGame({
  mapId: 'map id',
  agentIds: ['agent id', 'agent id'],
  musicId: 'music id',
  logoStorageId: 'storage id from upload',
  backgroundStorageId: 'storage id from upload',
  twitterHandle: 'string',
  title: 'string',
  description: 'string',
  visibility: 'string',
});
```

### Update game

```typescript
client.updateGame({
  id: 'game id',
  updates: { title: 'new title' },
});
```

### Game list

```typescript
client.getGameList();
```

### Get world status

```typescript
client.gameData.getWorldStatus('game id');
```

### Get agent player list

```typescript
client.gameData.getAgentPlayerList('game id');
```

### Get human player list

```typescript
client.gameData.getHumanPlayerList('game id', { numItems: 10, cursor: null });
```

### Get player

```typescript
client.gameData.getPlayer('game id', 'player id like p:0');
```

### Get conversation list

```typescript
client.gameData.getConversationList('game id', { numItems: 10, cursor: null });
```

### Get message list

```typescript
client.gameData.getMessageList('conversation id like c:0');
```
