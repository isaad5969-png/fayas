import { Suspense, lazy } from 'react'

/*
  Charge AmbientScene3D (et three.js) de façon différée : le contenu de la
  page s'affiche immédiatement, la scène 3D décorative arrive ensuite sans
  bloquer le rendu initial. Mêmes props que AmbientScene3D.
*/
const AmbientScene3D = lazy(() => import('./AmbientScene3D'))

export default function LazyAmbientScene3D(props) {
  return (
    <Suspense fallback={null}>
      <AmbientScene3D {...props} />
    </Suspense>
  )
}
