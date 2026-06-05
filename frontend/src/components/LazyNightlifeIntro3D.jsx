import { Suspense, lazy } from 'react'

/*
  Charge NightlifeIntro3D (et three.js) de façon différée : la page d'accueil
  s'affiche immédiatement, l'intro 3D arrive ensuite sans bloquer le rendu
  initial. Mêmes props que NightlifeIntro3D.
*/
const NightlifeIntro3D = lazy(() => import('./NightlifeIntro3D'))

export default function LazyNightlifeIntro3D(props) {
  return (
    <Suspense fallback={null}>
      <NightlifeIntro3D {...props} />
    </Suspense>
  )
}
