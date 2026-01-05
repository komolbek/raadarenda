import Foundation

enum UserEndpoint: APIEndpoint {
    case getProfile
    case updateProfile(name: String)
    case getAddresses
    case createAddress(request: CreateAddressRequest)
    case updateAddress(id: String, request: CreateAddressRequest)
    case deleteAddress(id: String)
    case setDefaultAddress(id: String)
    case getFavorites
    case addFavorite(productId: String)
    case removeFavorite(productId: String)

    var path: String {
        switch self {
        case .getProfile, .updateProfile:
            return "/user/profile"
        case .getAddresses, .createAddress:
            return "/user/addresses"
        case .updateAddress(let id, _), .deleteAddress(let id):
            return "/user/addresses/\(id)"
        case .setDefaultAddress(let id):
            return "/user/addresses/\(id)/default"
        case .getFavorites, .addFavorite:
            return "/user/favorites"
        case .removeFavorite(let productId):
            return "/user/favorites/\(productId)"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getProfile, .getAddresses, .getFavorites:
            return .get
        case .updateProfile, .createAddress, .addFavorite, .setDefaultAddress:
            return .post
        case .updateAddress:
            return .put
        case .deleteAddress, .removeFavorite:
            return .delete
        }
    }

    var body: Encodable? {
        switch self {
        case .updateProfile(let name):
            return ["name": name]
        case .createAddress(let request), .updateAddress(_, let request):
            return request
        case .addFavorite(let productId):
            return ["product_id": productId]
        default:
            return nil
        }
    }

    var requiresAuth: Bool {
        return true
    }
}

// MARK: - Request Models

struct CreateAddressRequest: Codable {
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

    enum CodingKeys: String, CodingKey {
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
    }
}
