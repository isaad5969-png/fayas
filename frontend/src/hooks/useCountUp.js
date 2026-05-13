import { useEffect, useState } from 'react'

/**
 * Animates a number from 0 to `end` over `duration` ms.
 * Only starts when `trigger` is true.
 * Returns the current animated value (number).
 */
export function useCountUp(end, duration = 1800, trigger = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!trigger || end === 0) return
    let raf
    const startTime = performance.now()

    const step = (now) => {
      const elapsed  = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out-quart
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(Math.round(eased * end))
      if (progress < 1) raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [end, duration, trigger])

  return value
}
