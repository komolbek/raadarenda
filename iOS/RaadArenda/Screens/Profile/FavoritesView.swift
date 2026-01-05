import SwiftUI

struct FavoritesView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = FavoritesViewModel()

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.products.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "heart.slash")
                        .font(.system(size: 60))
                        .foregroundColor(.secondary)

                    Text("Нет избранных товаров")
                        .font(.headline)

                    Text("Добавляйте товары в избранное, нажав на сердечко")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(viewModel.products) { product in
                            FavoriteProductCard(product: product, viewModel: viewModel)
                                .onTapGesture {
                                    coordinator.catalogPath.append(CatalogRoute.product(product))
                                    coordinator.selectedTab = .catalog
                                }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Избранное")
        .task {
            await viewModel.loadFavorites()
        }
    }
}

struct FavoriteProductCard: View {
    let product: Product
    @ObservedObject var viewModel: FavoritesViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: product.primaryPhoto ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .fill(Color(.systemGray5))
                }
                .frame(height: 140)
                .clipShape(RoundedRectangle(cornerRadius: 12))

                Button {
                    Task {
                        await viewModel.removeFavorite(product)
                    }
                } label: {
                    Image(systemName: "heart.fill")
                        .foregroundColor(.red)
                        .padding(8)
                        .background(.ultraThinMaterial)
                        .clipShape(Circle())
                }
                .padding(8)
            }

            Text(product.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .lineLimit(2)

            HStack {
                Text(formatPrice(product.dailyPrice))
                    .font(.headline)
                    .foregroundColor(.accentColor)
                Text("/ день")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 5, y: 2)
    }

    private func formatPrice(_ price: Int) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: price)) ?? "\(price)") сум"
    }
}

@MainActor
final class FavoritesViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading: Bool = false

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    func loadFavorites() async {
        isLoading = true
        do {
            products = try await userService.getFavorites()
        } catch {
            // Handle error
        }
        isLoading = false
    }

    func removeFavorite(_ product: Product) async {
        do {
            try await userService.removeFavorite(productId: product.id)
            products.removeAll { $0.id == product.id }
        } catch {
            // Handle error
        }
    }
}

#Preview {
    NavigationStack {
        FavoritesView(coordinator: MainCoordinator(appCoordinator: nil))
    }
}
