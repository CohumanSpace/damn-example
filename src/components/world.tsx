const baseUrl = import.meta.env.VITE_GAME_WORLD_BASE_URL;
export default function World({ gameName }: { gameName: string }) {
  const url = `${baseUrl}${gameName}`;
  return (
    <div className="w-[100%] h-screen mx-auto">
      <iframe src={url} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
