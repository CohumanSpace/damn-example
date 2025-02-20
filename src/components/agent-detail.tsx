import { useState } from 'react';
import { Doc } from '../../convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AgentDetail({ agent }: { agent: Doc<'agents'> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(agent.name);
  const [prompt, setPrompt] = useState(agent.prompt);
  const [description, setDescription] = useState(agent.description);
  const [status, setStatus] = useState(agent.status);
  const [visibility, setVisibility] = useState(agent.visibility);
  const [selectedAvatarImage, setSelectedAvatarImage] = useState<File | null>(null);
  const [selectedSpriteImage, setSelectedSpriteImage] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.game.generateUploadUrl);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const updateAgent = useAction(api.game.updateAgent);
  const avatarUrl = useQuery(api.game.serveFileUrl, { storageId: agent.avatarStorageId });
  const spriteUrl = useQuery(api.game.serveFileUrl, { storageId: agent.spriteStorageId });
  const onSave = async () => {
    try {
      setLoading(true);
      let avatarStorageId = agent.avatarStorageId;
      let spriteStorageId = agent.spriteStorageId;
      if (selectedAvatarImage) {
        const postUrl = await generateUploadUrl();
        const uploadAvatarResult = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedAvatarImage!.type },
          body: selectedAvatarImage,
        });
        avatarStorageId = (await uploadAvatarResult.json()).storageId;
      }
      if (selectedSpriteImage) {
        const postUrl = await generateUploadUrl();
        const uploadSpriteResult = await fetch(postUrl, {
          method: 'POST',
          headers: { 'Content-Type': selectedSpriteImage!.type },
          body: selectedSpriteImage,
        });
        spriteStorageId = (await uploadSpriteResult.json()).storageId;
      }
      await updateAgent({
        id: agent._id,
        name,
        prompt,
        description,
        avatarStorageId,
        spriteStorageId,
        status,
        visibility,
      });
      setLoading(false);
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      console.error(e);
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Name</Label>
        {isEditing ? (
          <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          <div>{agent.name}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Prompt</Label>
        {isEditing ? (
          <Input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        ) : (
          <div>{agent.prompt}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Description</Label>
        {isEditing ? (
          <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        ) : (
          <div>{agent.description}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Avatar</Label>
        {isEditing ? (
          <Input type="file" accept="image/*" onChange={(e) => setSelectedAvatarImage(e.target.files![0])} />
        ) : (
          <div>{avatarUrl && <img src={avatarUrl} alt="avatar" />}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Sprite</Label>
        {isEditing ? (
          <Input type="file" accept="image/*" onChange={(e) => setSelectedSpriteImage(e.target.files![0])} />
        ) : (
          <div>{spriteUrl && <img src={spriteUrl} alt="sprite" />}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Status</Label>
        {isEditing ? (
          <Input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
        ) : (
          <div>{agent.status}</div>
        )}
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Visibility</Label>
        {isEditing ? (
          <Input type="text" value={visibility} onChange={(e) => setVisibility(e.target.value)} />
        ) : (
          <div>{agent.visibility}</div>
        )}
      </div>
      <div className="mt-2">
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} className="w-full">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
