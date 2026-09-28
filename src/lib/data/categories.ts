import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

import { activeShop } from "@/config/shop"

export const listCategories = async (query?: Record<string, unknown>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category, +metadata",
          limit,
          ...query,
        },
        next,
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => {
      const channelHandle = activeShop.channel.handle
      const rootCategoryHandle = activeShop.rootCategory.handle

      return product_categories.filter((cat: any) => {
        const catChannel = (cat.metadata?.channel as string) || ""
        const parentChannel = (cat.parent_category?.metadata?.channel as string) || ""
        const parentHandle = cat.parent_category?.handle || ""

        // If category is explicitly tagged for this channel or child of channel parent
        if (catChannel === channelHandle) return true
        if (parentChannel === channelHandle) return true
        if (cat.handle === rootCategoryHandle || parentHandle === rootCategoryHandle) return true

        return false
      })
    })
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products, *parent_category, +metadata",
          handle,
        },
        next,
        cache: "no-store",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
