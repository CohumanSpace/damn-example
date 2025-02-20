import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import AgentDetail from './agent-detail';
import World from './world';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ModeToggle } from './mode-toggle';
import CreateAgent from './create-agent';
import { useLocalStorage } from 'usehooks-ts';

export default function GameMain() {
  const game = useQuery(api.game.getGame);
  const [agentId] = useLocalStorage('agentId', '');
  const agent = useQuery(api.game.getAgentById, agentId ? { id: agentId as Id<'agents'> } : 'skip');

  if (!game) {
    return <div className="flex justify-center pt-2">Loading...</div>;
  }
  return (
    <div>
      <div className="flex">
        <Card className="mx-2 my-2 w-[300px] relative">
          <CardHeader>
            <CardTitle>SDK Demo</CardTitle>
            <CardDescription>This is a demo of the SDK</CardDescription>
          </CardHeader>
          <CardContent>
            {agent && <AgentDetail agent={agent} />}
            {!agent && <CreateAgent />}
          </CardContent>
          <div className="absolute bottom-2 left-2">
            <ModeToggle />
          </div>
        </Card>
        <World gameName={game.gameName} />
      </div>
    </div>
  );
}
