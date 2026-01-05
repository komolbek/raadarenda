import Foundation

struct Product: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let description: String?
    let categoryId: String
    let photos: [String]
    let specifications: ProductSpecifications?
    let dailyPrice: Int
    let pricingTiers: [PricingTier]
    let quantityPricing: [QuantityPricing]
    let totalStock: Int
    let isActive: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case categoryId = "category_id"
        case photos
        case specifications
        case dailyPrice = "daily_price"
        case pricingTiers = "pricing_tiers"
        case quantityPricing = "quantity_pricing"
        case totalStock = "total_stock"
        case isActive = "is_active"
        case createdAt = "created_at"
    }

    var primaryPhoto: String? {
        photos.first
    }
}

struct ProductSpecifications: Hashable, Codable {
    let width: String?
    let height: String?
    let depth: String?
    let weight: String?
    let color: String?
    let material: String?
}

struct PricingTier: Hashable, Codable {
    let days: Int
    let totalPrice: Int

    enum CodingKeys: String, CodingKey {
        case days
        case totalPrice = "total_price"
    }

    func savingsPercentage(baseDailyPrice: Int) -> Int {
        let fullPrice = baseDailyPrice * days
        guard fullPrice > 0 else { return 0 }
        let savings = fullPrice - totalPrice
        return Int((Double(savings) / Double(fullPrice)) * 100)
    }
}

struct QuantityPricing: Hashable, Codable {
    let quantity: Int
    let totalPrice: Int

    enum CodingKeys: String, CodingKey {
        case quantity
        case totalPrice = "total_price"
    }

    func savingsPercentage(baseDailyPrice: Int) -> Int {
        let fullPrice = baseDailyPrice * quantity
        guard fullPrice > 0 else { return 0 }
        let savings = fullPrice - totalPrice
        return Int((Double(savings) / Double(fullPrice)) * 100)
    }
}

// MARK: - Availability

struct ProductAvailability: Codable {
    let productId: String
    let startDate: Date
    let endDate: Date
    let availableQuantity: Int

    enum CodingKeys: String, CodingKey {
        case productId = "product_id"
        case startDate = "start_date"
        case endDate = "end_date"
        case availableQuantity = "available_quantity"
    }
}

// MARK: - API Response

struct ProductsResponse: Codable {
    let success: Bool
    let data: [Product]
    let message: String?
    let pagination: PaginationInfo?
}

struct ProductResponse: Codable {
    let success: Bool
    let data: Product
    let message: String?
}

struct AvailabilityResponse: Codable {
    let success: Bool
    let data: ProductAvailability
    let message: String?
}
