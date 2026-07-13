import { create } from 'zustand'

const useIslandStore = create((set) => ({
  stakeholders: [],
  selectedId: null,
  isLoading: false,

  setStakeholders: (list) => set({ stakeholders: list }),

  selectStakeholder: (id) => set({ selectedId: id }),

  updateStakeholderClimate: (id, climate) =>
    set((state) => ({
      stakeholders: state.stakeholders.map((s) =>
        s.id === id
          ? {
              ...s,
              // Keep flat fields in sync (ConditionsPanel reads s.overall_status directly)
              overall_status: climate.overall_status ?? s.overall_status,
              temperature:    climate.temperature    ?? s.temperature,
              wind:           climate.wind           ?? s.wind,
              storm:          climate.storm          ?? s.storm,
              visibility:     climate.visibility     ?? s.visibility,
              tide:           climate.tide           ?? s.tide,
              uv_index:       climate.uv_index       ?? s.uv_index,
              climate: { ...s.climate, ...climate },
            }
          : s
      ),
    })),

  updateStakeholderPosition: (id, position_x, position_y) =>
    set((state) => ({
      stakeholders: state.stakeholders.map((s) =>
        s.id === id ? { ...s, position_x, position_y } : s
      ),
    })),

  updateStakeholder: (id, fields) =>
    set((state) => ({
      stakeholders: state.stakeholders.map((s) =>
        s.id === id ? { ...s, ...fields } : s
      ),
    })),

  addStakeholder: (stakeholder) =>
    set((state) => ({ stakeholders: [...state.stakeholders, stakeholder] })),

  removeStakeholder: (id) =>
    set((state) => ({
      stakeholders: state.stakeholders.filter((s) => s.id !== id),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}))

export default useIslandStore
