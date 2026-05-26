import { useState, useEffect, useRef } from 'react'
import { Icon } from './Icons'
import toast from 'react-hot-toast'

/**
 * Bouton de partage avec menu (WhatsApp, Facebook, Twitter, Copy link).
 *   - eventTitle / eventUrl : contenu à partager
 *   - variant : "inline" | "floating"
 */
export default function ShareButton({ eventTitle, eventUrl, variant = 'inline' }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const url = eventUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = `🎉 Découvre cet événement : ${eventTitle}`

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Native share API on mobile
  const tryNativeShare = async (e) => {
    if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      e.preventDefault()
      try {
        await navigator.share({ title: eventTitle, text: shareText, url })
        return true
      } catch { /* user cancelled */ }
    }
    return false
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Lien copié ! 📋')
      setOpen(false)
    } catch {
      toast.error('Impossible de copier le lien')
    }
  }

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: 'whatsapp',
      color: 'text-emerald-600 dark:text-emerald-400 group-hover/s:bg-emerald-50 dark:group-hover/s:bg-emerald-900/30',
      href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`,
    },
    {
      name: 'Facebook',
      icon: 'facebook',
      color: 'text-blue-600 dark:text-blue-400 group-hover/s:bg-blue-50 dark:group-hover/s:bg-blue-900/30',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: 'Twitter / X',
      icon: 'twitter',
      color: 'text-sky-600 dark:text-sky-400 group-hover/s:bg-sky-50 dark:group-hover/s:bg-sky-900/30',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    },
  ]

  const triggerClass = variant === 'floating'
    ? `absolute top-3 right-16 z-30 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-200 hover:scale-110`
    : variant === 'hero'
    ? `w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white transition-all duration-200 hover:scale-105 active:scale-95`
    : `inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 border-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-700 dark:hover:text-purple-400`

  return (
    <div className={(variant === 'floating' || variant === 'hero') ? 'relative' : 'relative inline-block'} ref={menuRef}>
      <button
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          const handled = await tryNativeShare(e)
          if (!handled) setOpen(v => !v)
        }}
        aria-label="Partager cet événement"
        className={triggerClass}
      >
        <Icon name="share" className={(variant === 'floating' || variant === 'hero') ? 'w-4 h-4 text-white' : 'w-4 h-4'} />
        {(variant !== 'floating' && variant !== 'hero') && 'Partager'}
      </button>

      {open && (
        <>
          {/* Backdrop on floating variant */}
          {variant === 'floating' && (
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          )}
          <div className={`${variant === 'floating'
              ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72'
              : variant === 'hero'
              ? 'absolute right-0 top-12 w-64 z-50'
              : 'absolute right-0 mt-2 w-64 z-50'}
              bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800
              py-2 animate-scale-in`}>
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
              <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">Partager</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{eventTitle}</p>
            </div>

            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`group/s flex items-center gap-3 px-4 py-2.5 transition-colors`}
              >
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${link.color}`}>
                  <Icon name={link.icon} className="w-5 h-5" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{link.name}</span>
              </a>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
              <button
                onClick={handleCopy}
                className="group/s flex items-center gap-3 w-full px-4 py-2.5 transition-colors text-left"
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover/s:bg-purple-50 dark:group-hover/s:bg-purple-900/30 transition-colors">
                  <Icon name="copy" className="w-5 h-5" />
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copier le lien</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
