"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>(() => {
    if (!product.variants?.length) return {}
    const vId = searchParams.get("v_id")
    const targetVariant = vId
      ? product.variants.find((v) => v.id === vId) || product.variants[0]
      : product.variants[0]
    return optionsAsKeymap(targetVariant?.options) ?? {}
  })
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // Preselect options from url param v_id, or first variant by default
  useEffect(() => {
    if (!product.variants?.length) return

    const vId = searchParams.get("v_id")
    const targetVariant = vId
      ? product.variants.find((v) => v.id === vId) || product.variants[0]
      : product.variants[0]

    if (targetVariant) {
      const variantOptions = optionsAsKeymap(targetVariant.options)
      setOptions((prev) => {
        if (Object.keys(prev).length === 0) {
          return variantOptions ?? {}
        }
        return prev
      })
    }
  }, [product.variants, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <div className="flex flex-col gap-y-2" ref={actionsRef}>
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
              <Divider />
            </div>
          )}
        </div>

        <ProductPrice product={product} variant={selectedVariant} />

        {selectedVariant && (
          <div className="my-1">
            {inStock ? (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Na stanju ({selectedVariant.inventory_quantity ?? 0} kom u magacinima)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Trenutno rasprodano</span>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleAddToCart}
          disabled={
            !inStock ||
            !selectedVariant ||
            !!disabled ||
            isAdding ||
            !isValidVariant
          }
          variant="primary"
          className="w-full h-10"
          isLoading={isAdding}
          data-testid="add-product-button"
        >
          {!selectedVariant
            ? "Odaberite opciju"
            : !inStock || !isValidVariant
            ? "Nema na stanju"
            : "Dodaj u korpu"}
        </Button>
        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
