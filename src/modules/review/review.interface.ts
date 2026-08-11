export interface IReviewPayload {
  rating: number
  comment?: string
  bookingId: string
}

export interface IUpdateReviewPayload {
  rating?: number
  comment?: string
}
