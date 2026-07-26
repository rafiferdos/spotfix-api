import { prisma } from '@/lib/prisma.js'
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

export const categoryService = {
  create: createCategoryIntoDB,
  getAll: getAllCategoriesFromDB
}
