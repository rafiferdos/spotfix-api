import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { categoryService } from './category.service.js'

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body

  const newCategory = await categoryService.create(payload)

  sendResponse(res, {
    statusCode: status.CREATED,
    message: 'Category created successfully',
    data: newCategory
  })
})

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await categoryService.getAll()

  sendResponse(res, {
    statusCode: status.OK,
    message: 'Categories retrieved successfully',
    data: categories
  })
})

export const categoryController = {
  create: createCategory,
  getAll: getAllCategories
}
