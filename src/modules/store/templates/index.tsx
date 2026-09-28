import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default function StoreTemplate({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="py-6 content-container" data-testid="store-container">
      <div className="mb-8 text-2xl-semi">
        <h1 data-testid="store-page-title">Svi proizvodi</h1>
      </div>

      <div className="w-full">
        <Suspense fallback={<SkeletonProductGrid numberOfProducts={12} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
