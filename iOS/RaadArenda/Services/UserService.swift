import Foundation

protocol UserServiceProtocol {
    func getProfile() async throws -> User
    func updateProfile(name: String) async throws -> User
    func getAddresses() async throws -> [Address]
    func createAddress(request: CreateAddressRequest) async throws -> Address
    func updateAddress(id: String, request: CreateAddressRequest) async throws -> Address
    func deleteAddress(id: String) async throws
    func setDefaultAddress(id: String) async throws -> Address
    func getFavorites() async throws -> [Product]
    func addFavorite(productId: String) async throws
    func removeFavorite(productId: String) async throws
}

final class UserService: UserServiceProtocol {
    private let networkManager: NetworkManager

    init(networkManager: NetworkManager = .shared) {
        self.networkManager = networkManager
    }

    func getProfile() async throws -> User {
        let endpoint = UserEndpoint.getProfile
        let response: UserResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func updateProfile(name: String) async throws -> User {
        let endpoint = UserEndpoint.updateProfile(name: name)
        let response: UserResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func getAddresses() async throws -> [Address] {
        let endpoint = UserEndpoint.getAddresses
        let response: AddressesResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func createAddress(request: CreateAddressRequest) async throws -> Address {
        let endpoint = UserEndpoint.createAddress(request: request)
        let response: AddressResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func updateAddress(id: String, request: CreateAddressRequest) async throws -> Address {
        let endpoint = UserEndpoint.updateAddress(id: id, request: request)
        let response: AddressResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func deleteAddress(id: String) async throws {
        let endpoint = UserEndpoint.deleteAddress(id: id)
        let _: SendOTPResponse = try await networkManager.request(endpoint)
    }

    func setDefaultAddress(id: String) async throws -> Address {
        let endpoint = UserEndpoint.setDefaultAddress(id: id)
        let response: AddressResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func getFavorites() async throws -> [Product] {
        let endpoint = UserEndpoint.getFavorites
        let response: FavoritesResponse = try await networkManager.request(endpoint)
        return response.data
    }

    func addFavorite(productId: String) async throws {
        let endpoint = UserEndpoint.addFavorite(productId: productId)
        let _: SendOTPResponse = try await networkManager.request(endpoint)
    }

    func removeFavorite(productId: String) async throws {
        let endpoint = UserEndpoint.removeFavorite(productId: productId)
        let _: SendOTPResponse = try await networkManager.request(endpoint)
    }
}
