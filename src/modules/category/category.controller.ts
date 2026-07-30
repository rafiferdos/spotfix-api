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

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const deleted = await categoryService.delete(id as string)
  sendResponse(res, {
    statusCode: status.OK,
    message: 'Category deleted successfully',
    data: deleted
  })
})

export const categoryController = {
  create: createCategory,
  getAll: getAllCategories,
  delete: deleteCategory
}
