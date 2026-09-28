import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import StoreTemplate from "@modules/store/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export const metadata: Metadata = {
  title: "Store",
  description: "Explore all of our products.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const { countryCode } = await props.params
  const { sortBy, page } = await props.searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={countryCode}
    />
  )
}
