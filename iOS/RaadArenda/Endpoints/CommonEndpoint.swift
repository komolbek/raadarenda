import Foundation

enum CommonEndpoint: APIEndpoint {
    case getBusinessInfo
    case getDeliveryZones

    var path: String {
        switch self {
        case .getBusinessInfo:
            return "/business/info"
        case .getDeliveryZones:
            return "/delivery/zones"
        }
    }

    var method: HTTPMethod {
        return .get
    }

    var requiresAuth: Bool {
        return false
    }
}
