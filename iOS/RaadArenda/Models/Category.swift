import Foundation

struct Category: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let imageUrl: String?
    let displayOrder: Int
    let isActive: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case imageUrl = "image_url"
        case displayOrder = "display_order"
        case isActive = "is_active"
        case createdAt = "created_at"
    }
}

// MARK: - API Response

struct CategoriesResponse: Codable {
    let success: Bool
    let data: [Category]
    let message: String?
}
