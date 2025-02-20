import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from 'usehooks-ts';
import { useToast } from '@/hooks/use-toast';

export default function CreateAgent() {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [selectedAvatarImage, setSelectedAvatarImage] = useState<File | null>(null);
  const [selectedSpriteImage, setSelectedSpriteImage] = useState<File | null>(null);
  const generateUploadUrl = useMutation(api.game.generateUploadUrl);
  const [loading, setLoading] = useState(false);
  const [, setAgentId] = useLocalStorage('agentId', '');
  const { toast } = useToast();
  const createAgent = useAction(api.game.createAgent);
  const onSave = async () => {
    try {
      setLoading(true);
      const postUrl = await generateUploadUrl();
      const uploadAvatarResult = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedAvatarImage!.type },
        body: selectedAvatarImage,
      });
      const { storageId: avatarStorageId } = await uploadAvatarResult.json();
      const uploadSpriteResult = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedSpriteImage!.type },
        body: selectedSpriteImage,
      });
      const { storageId: spriteStorageId } = await uploadSpriteResult.json();

      const agentId = await createAgent({
        name,
        prompt,
        description,
        avatarStorageId,
        spriteStorageId,
        status,
        visibility,
      });
      setAgentId(agentId);
      setLoading(false);
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
  return (
    <div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Name</Label>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Prompt</Label>
        <Input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Description</Label>
        <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Avatar</Label>
        <Input type="file" accept="image/*" onChange={(e) => setSelectedAvatarImage(e.target.files![0])} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Sprite</Label>
        <Input type="file" accept="image/*" onChange={(e) => setSelectedSpriteImage(e.target.files![0])} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Status</Label>
        <Input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
      </div>
      <div className="flex flex-col space-y-1.5 mb-2">
        <Label className="text-muted-foreground">Visibility</Label>
        <Input type="text" value={visibility} onChange={(e) => setVisibility(e.target.value)} />
      </div>
      <div className="mt-2">
        <Button onClick={onSave} disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
