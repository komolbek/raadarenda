import Foundation

struct User: Identifiable, Codable {
    let id: String
    let phoneNumber: String
    let name: String?
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case phoneNumber = "phone_number"
        case name
        case createdAt = "created_at"
    }
}

struct Address: Identifiable, Hashable, Codable {
    let id: String
    let userId: String
    let title: String
    let fullAddress: String
    let city: String
    let district: String?
    let street: String?
    let building: String?
    let apartment: String?
    let entrance: String?
    let floor: String?
    let latitude: Double?
    let longitude: Double?
    let isDefault: Bool
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case fullAddress = "full_address"
        case city
        case district
        case street
        case building
        case apartment
        case entrance
        case floor
        case latitude
        case longitude
        case isDefault = "is_default"
        case createdAt = "created_at"
    }
}

// MARK: - API Response

struct UserResponse: Codable {
    let success: Bool
    let data: User
    let message: String?
}

struct AddressesResponse: Codable {
    let success: Bool
    let data: [Address]
    let message: String?
}

struct AddressResponse: Codable {
    let success: Bool
    let data: Address
    let message: String?
}
