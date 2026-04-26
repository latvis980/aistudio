// components/ui/VimeoEmbed.tsx

interface VimeoEmbedProps {
  url: string
}

export default function VimeoEmbed({ url }: VimeoEmbedProps) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?/)
  if (!match) return null

  const videoId = match[1]
  const hash = match[2]
  const hashParam = hash ? `&h=${hash}` : ''

  return (
    <div className="aspect-video">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?background=1&dnt=1${hashParam}`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        title="Project video"
      />
    </div>
  )
}
