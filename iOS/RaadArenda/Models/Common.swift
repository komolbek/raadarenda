import Foundation

// MARK: - Pagination

struct PaginationInfo: Codable {
    let currentPage: Int
    let limit: Int
    let totalCount: Int
    let hasMore: Bool
    let totalPages: Int

    enum CodingKeys: String, CodingKey {
        case currentPage = "current_page"
        case limit
        case totalCount = "total_count"
        case hasMore = "has_more"
        case totalPages = "total_pages"
    }
}

// MARK: - API Error Response

struct APIErrorResponse: Codable {
    let success: Bool
    let message: String
    let code: String?
}

// MARK: - Auth

struct SendOTPRequest: Codable {
    let phoneNumber: String

    enum CodingKeys: String, CodingKey {
        case phoneNumber = "phone_number"
    }
}

struct SendOTPResponse: Codable {
    let success: Bool
    let message: String
}

struct VerifyOTPRequest: Codable {
    let phoneNumber: String
    let code: String
    let deviceId: String

    enum CodingKeys: String, CodingKey {
        case phoneNumber = "phone_number"
        case code
        case deviceId = "device_id"
    }
}

struct VerifyOTPResponse: Codable {
    let success: Bool
    let data: AuthData?
    let message: String
}

struct AuthData: Codable {
    let user: User
    let sessionToken: String

    enum CodingKeys: String, CodingKey {
        case user
        case sessionToken = "session_token"
    }
}

// MARK: - Delivery Pricing

struct DeliveryZone: Identifiable, Codable {
    let id: String
    let name: String
    let price: Int
    let isFree: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case price
        case isFree = "is_free"
    }
}

struct DeliveryPricingResponse: Codable {
    let success: Bool
    let data: [DeliveryZone]
    let message: String?
}

// MARK: - Business Info

struct BusinessInfo: Codable {
    let name: String
    let phone: String
    let address: String
    let workingHours: String

    enum CodingKeys: String, CodingKey {
        case name
        case phone
        case address
        case workingHours = "working_hours"
    }
}

struct BusinessInfoResponse: Codable {
    let success: Bool
    let data: BusinessInfo
    let message: String?
}

// MARK: - Favorites

struct Favorite: Identifiable, Codable {
    let id: String
    let userId: String
    let productId: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case productId = "product_id"
        case createdAt = "created_at"
    }
}

struct FavoritesResponse: Codable {
    let success: Bool
    let data: [Product]
    let message: String?
}
