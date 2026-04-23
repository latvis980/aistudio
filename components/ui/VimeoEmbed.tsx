interface VimeoEmbedProps {
  url: string
}

export default function VimeoEmbed({ url }: VimeoEmbedProps) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (!match) return null

  const videoId = match[1]

  return (
    <div className="aspect-video">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0&autoplay=1&loop=1&muted=1`}
        className="w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        loading="lazy"
        title="Project video"
      />
    </div>
  )
}
