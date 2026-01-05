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
    case getCards
    case addCard(request: AddCardRequest)
    case deleteCard(id: String)
    case setDefaultCard(id: String)

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
        case .getCards, .addCard:
            return "/user/cards"
        case .deleteCard(let id):
            return "/user/cards/\(id)"
        case .setDefaultCard(let id):
            return "/user/cards/\(id)/default"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getProfile, .getAddresses, .getFavorites, .getCards:
            return .get
        case .updateProfile, .createAddress, .addFavorite, .setDefaultAddress, .addCard, .setDefaultCard:
            return .post
        case .updateAddress:
            return .put
        case .deleteAddress, .removeFavorite, .deleteCard:
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
        case .addCard(let request):
            return request
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
