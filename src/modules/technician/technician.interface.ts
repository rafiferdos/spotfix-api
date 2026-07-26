export interface ITechnicianProfilePayload {
  skills: string[]
  experience: number
  pricing: number
  availabilitySlots?: string[]
}

export interface IAvailabilityPayload {
  availabilitySlots: string[]
}
