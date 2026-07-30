import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { ICategoryPayload } from './category.interface.js'

const createCategoryIntoDB = async (payload: ICategoryPayload) => {
  const newCategory = await prisma.category.create({
    data: payload
  })
  return newCategory
}

const getAllCategoriesFromDB = async () => {
  const categories = await prisma.category.findMany()
  return categories
}

const deleteCategoryFromDB = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { services: true }
  })
  if (!category) throw new AppError(status.NOT_FOUND, 'Category not found')
  if (category.services.length > 0)
    throw new AppError(
      status.CONFLICT,
      'This category has services attached and cannot be deleted'
    )

  await prisma.category.delete({ where: { id: categoryId } })
  return category
}

export const categoryService = {
  create: createCategoryIntoDB,
  getAll: getAllCategoriesFromDB,
  delete: deleteCategoryFromDB
}
