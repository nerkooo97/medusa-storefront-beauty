import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions } from "@lib/data/regions"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
    }
  >
}

export const dynamic = "force-dynamic"

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      return {
        title: "Kategorija | Šminka & Ljepota",
      }
    }

    const title = `${productCategory.name} | Šminka & Ljepota`
    const description = productCategory.description ?? `${title} kategorija.`

    return {
      title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch {
    return {
      title: "Kategorija | Šminka & Ljepota",
    }
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
    />
  )
}
