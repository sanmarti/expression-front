import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getStakeholders } from '../api/stakeholders.js'
import useIslandStore from '../store/islandStore.js'

export function useClimateSync() {
  const location = useLocation()
  const setStakeholders = useIslandStore((s) => s.setStakeholders)

  useEffect(() => {
    if (location.pathname !== '/island') return

    const sync = async () => {
      try {
        const { data } = await getStakeholders()
        setStakeholders(data)
      } catch {
        // silent
      }
    }

    const id = setInterval(sync, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [location.pathname, setStakeholders])
}
