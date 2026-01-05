import Foundation

protocol CatalogServiceProtocol {
    func getCategories() async throws -> [Category]
    func getProducts(categoryId: String?, page: Int, limit: Int, search: String?, sortBy: String?, sortOrder: String?) async throws -> ProductsResponse
    func getProduct(id: String) async throws -> Product
    func checkAvailability(productId: String, startDate: Date, endDate: Date) async throws -> ProductAvailability
    func searchProducts(query: String, page: Int, limit: Int) async throws -> ProductsResponse
}

final class CatalogService: CatalogServiceProtocol {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager = .shared) {
        self.networkManager = networkManager
    }

    func getCategories() async throws -> [Category] {
        let endpoint = CatalogEndpoint.getCategories
        let response: CategoriesResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func getProducts(
        categoryId: String? = nil,
        page: Int = 1,
        limit: Int = 20,
        search: String? = nil,
        sortBy: String? = nil,
        sortOrder: String? = nil
    ) async throws -> ProductsResponse {
        let endpoint = CatalogEndpoint.getProducts(
            categoryId: categoryId,
            page: page,
            limit: limit,
            search: search,
            sortBy: sortBy,
            sortOrder: sortOrder
        )
        return try await networkManager.request(endpoint)
    }

    func getProduct(id: String) async throws -> Product {
        let endpoint = CatalogEndpoint.getProduct(id: id)
        let response: ProductResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func checkAvailability(productId: String, startDate: Date, endDate: Date) async throws -> ProductAvailability {
        let endpoint = CatalogEndpoint.checkAvailability(productId: productId, startDate: startDate, endDate: endDate)
        let response: AvailabilityResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func searchProducts(query: String, page: Int = 1, limit: Int = 20) async throws -> ProductsResponse {
        let endpoint = CatalogEndpoint.searchProducts(query: query, page: page, limit: limit)
        return try await networkManager.request(endpoint)
    }
}
