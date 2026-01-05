import Foundation

enum CatalogEndpoint: APIEndpoint {
    case getCategories
    case getProducts(categoryId: String?, page: Int, limit: Int, search: String?, sortBy: String?, sortOrder: String?)
    case getProduct(id: String)
    case checkAvailability(productId: String, startDate: Date, endDate: Date)
    case searchProducts(query: String, page: Int, limit: Int)

    var path: String {
        switch self {
        case .getCategories:
            return "/categories"
        case .getProducts:
            return "/products"
        case .getProduct(let id):
            return "/products/\(id)"
        case .checkAvailability(let productId, _, _):
            return "/products/\(productId)/availability"
        case .searchProducts:
            return "/products/search"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getCategories, .getProducts, .getProduct, .checkAvailability, .searchProducts:
            return .get
        }
    }

    var queryParams: [String: String] {
        switch self {
        case .getCategories:
            return [:]

        case .getProducts(let categoryId, let page, let limit, let search, let sortBy, let sortOrder):
            var params: [String: String] = [
                "page": String(page),
                "limit": String(limit)
            ]
            if let categoryId = categoryId {
                params["category_id"] = categoryId
            }
            if let search = search, !search.isEmpty {
                params["search"] = search
            }
            if let sortBy = sortBy {
                params["sort_by"] = sortBy
            }
            if let sortOrder = sortOrder {
                params["sort_order"] = sortOrder
            }
            return params

        case .getProduct:
            return [:]

        case .checkAvailability(_, let startDate, let endDate):
            let formatter = ISO8601DateFormatter()
            return [
                "start_date": formatter.string(from: startDate),
                "end_date": formatter.string(from: endDate)
            ]

        case .searchProducts(let query, let page, let limit):
            return [
                "q": query,
                "page": String(page),
                "limit": String(limit)
            ]
        }
    }

    var requiresAuth: Bool {
        return false
    }
}
