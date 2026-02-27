"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"

interface VideoExplainerProps {
  /** Section headline displayed above the video */
  title: string
  /** Optional short paragraph displayed below the headline */
  subtitle?: string
  /**
   * Your Bunny Stream library ID.
   * Find it in Bunny Dashboard > Stream > Library > Settings.
   * Example: "285399"
   */
  libraryId?: string
  /**
   * The individual video GUID from your Bunny Stream library.
   * Find it under the video's embed code or API response.
   * Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   */
  videoId?: string
  /** Current locale string, e.g. "en" or "fr" */
  locale?: string
  /** Alternative video GUID to use when locale is "fr" */
  videoIdFr?: string
}

/**
 * Elite video section powered by Bunny Stream CDN.
 *
 * To configure:
 * 1. Log into https://dash.bunny.net
 * 2. Go to Stream > your library
 * 3. Copy the Library ID from the library settings
 * 4. Upload your video and copy its GUID
 * 5. Pass both as props: <VideoExplainer libraryId="285399" videoId="your-guid" />
 *
 * The embed URL follows Bunny's standard pattern:
 *   https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}
 */
export function VideoExplainer({
  title,
  subtitle,
  libraryId,
  videoId,
  locale,
  videoIdFr,
}: VideoExplainerProps) {
  const resolvedVideoId = locale === "fr" && videoIdFr ? videoIdFr : videoId
  const hasVideo = libraryId && resolvedVideoId

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <h2 className="font-[var(--font-playfair)] text-2xl italic text-[#ffffff] mb-2 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="view-intro mb-5">{subtitle}</p>
      )}

      {hasVideo ? (
        <div className="bunny-player-wrapper rounded-2xl overflow-hidden border border-[#C5A059]/20 shadow-2xl relative w-full aspect-video">
          <iframe
            src={`https://iframe.mediadelivery.net/embed/${libraryId}/${resolvedVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
            loading="lazy"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={title}
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      ) : (
        /* Elegant placeholder when no Bunny video is configured */
        <div className="bunny-player-wrapper flex items-center justify-center bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#C5A059]/10 shadow-2xl relative w-full aspect-video">
          <div className="flex flex-col items-center gap-4 text-center px-6 absolute inset-0 justify-center">
            <div className="w-16 h-16 rounded-full border border-[#C5A059]/30 bg-[#C5A059]/5 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-6 h-6 text-[#C5A059] ml-1 opacity-80" />
            </div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C5A059] font-medium">
              Video Briefing
            </p>
            <p className="text-xs text-[#a3a3a3] max-w-xs leading-relaxed opacity-60">
              Configure your Bunny Stream library ID and video ID to display the investor briefing here.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
