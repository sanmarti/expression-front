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
        s.id === id ? { ...s, climate: { ...s.climate, ...climate } } : s
      ),
    })),

  updateStakeholderPosition: (id, position_x, position_y) =>
    set((state) => ({
      stakeholders: state.stakeholders.map((s) =>
        s.id === id ? { ...s, position_x, position_y } : s
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
