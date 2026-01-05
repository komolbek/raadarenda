import Foundation
import SwiftUI

@MainActor
final class FavoritesManager: ObservableObject {
    @Published private(set) var favoriteIds: Set<String> = []
    @Published private(set) var favorites: [Product] = []
    @Published private(set) var isLoading: Bool = false

    private let userService: UserServiceProtocol
    private let favoritesKey = "cached_favorite_ids"

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
        loadCachedIds()
    }

    var isEmpty: Bool { favoriteIds.isEmpty }
    var count: Int { favoriteIds.count }

    func isFavorite(_ productId: String) -> Bool {
        favoriteIds.contains(productId)
    }

    func toggleFavorite(_ product: Product) async {
        if isFavorite(product.id) {
            await removeFavorite(product.id)
        } else {
            await addFavorite(product)
        }
    }

    func addFavorite(_ product: Product) async {
        // Optimistic update
        favoriteIds.insert(product.id)
        if !favorites.contains(where: { $0.id == product.id }) {
            favorites.insert(product, at: 0)
        }
        saveCachedIds()

        do {
            try await userService.addFavorite(productId: product.id)
        } catch {
            // Rollback on error
            favoriteIds.remove(product.id)
            favorites.removeAll { $0.id == product.id }
            saveCachedIds()
        }
    }

    func removeFavorite(_ productId: String) async {
        // Optimistic update
        let wasInFavorites = favoriteIds.contains(productId)
        let removedProduct = favorites.first { $0.id == productId }
        let removedIndex = favorites.firstIndex { $0.id == productId }

        favoriteIds.remove(productId)
        favorites.removeAll { $0.id == productId }
        saveCachedIds()

        do {
            try await userService.removeFavorite(productId: productId)
        } catch {
            // Rollback on error
            if wasInFavorites {
                favoriteIds.insert(productId)
            }
            if let product = removedProduct, let index = removedIndex {
                favorites.insert(product, at: min(index, favorites.count))
            }
            saveCachedIds()
        }
    }

    func loadFavorites() async {
        isLoading = true
        do {
            favorites = try await userService.getFavorites()
            favoriteIds = Set(favorites.map { $0.id })
            saveCachedIds()
        } catch {
            // Keep cached IDs if load fails
        }
        isLoading = false
    }

    func clear() {
        favoriteIds.removeAll()
        favorites.removeAll()
        saveCachedIds()
    }

    // MARK: - Persistence

    private func saveCachedIds() {
        let ids = Array(favoriteIds)
        UserDefaults.standard.set(ids, forKey: favoritesKey)
    }

    private func loadCachedIds() {
        if let ids = UserDefaults.standard.array(forKey: favoritesKey) as? [String] {
            favoriteIds = Set(ids)
        }
    }
}
