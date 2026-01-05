import SwiftUI

struct ProductsListView: View {
    let category: Category
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel: ProductsListViewModel

    init(category: Category, coordinator: MainCoordinator) {
        self.category = category
        self.coordinator = coordinator
        _viewModel = StateObject(wrappedValue: ProductsListViewModel(categoryId: category.id))
    }

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            // Filters
            HStack {
                Menu {
                    Button("По названию") { viewModel.setSorting(by: "name", order: "asc") }
                    Button("Сначала дешевые") { viewModel.setSorting(by: "price", order: "asc") }
                    Button("Сначала дорогие") { viewModel.setSorting(by: "price", order: "desc") }
                    Button("Популярные") { viewModel.setSorting(by: "popularity", order: "desc") }
                } label: {
                    HStack {
                        Image(systemName: "arrow.up.arrow.down")
                        Text("Сортировка")
                    }
                    .font(.subheadline)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                }

                Spacer()

                Text("\(viewModel.totalCount) товаров")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal)

            if viewModel.isLoading && viewModel.products.isEmpty {
                ProgressView()
                    .padding(.top, 100)
            } else if let error = viewModel.errorMessage, viewModel.products.isEmpty {
                ErrorView(message: error) {
                    Task { await viewModel.loadProducts() }
                }
            } else {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(viewModel.products) { product in
                        ProductCard(product: product)
                            .onTapGesture {
                                coordinator.showProduct(product)
                            }
                            .onAppear {
                                if product.id == viewModel.products.last?.id {
                                    Task { await viewModel.loadMore() }
                                }
                            }
                    }
                }
                .padding()

                if viewModel.isLoadingMore {
                    ProgressView()
                        .padding()
                }
            }
        }
        .navigationTitle(category.name)
        .refreshable {
            await viewModel.loadProducts()
        }
        .task {
            await viewModel.loadProducts()
        }
    }
}

struct ProductCard: View {
    let product: Product
    @EnvironmentObject var cartManager: CartManager

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Image
            AsyncImage(url: URL(string: product.primaryPhoto ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color(.systemGray5))
                    .overlay {
                        Image(systemName: "photo")
                            .foregroundColor(.gray)
                    }
            }
            .frame(height: 140)
            .clipShape(RoundedRectangle(cornerRadius: 12))

            // Name
            Text(product.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .lineLimit(2)

            // Price
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
final class ProductsListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading: Bool = false
    @Published var isLoadingMore: Bool = false
    @Published var errorMessage: String?
    @Published var totalCount: Int = 0

    private let categoryId: String
    private let catalogService: CatalogServiceProtocol
    private var currentPage: Int = 1
    private var hasMore: Bool = true
    private var sortBy: String?
    private var sortOrder: String?
    private let limit: Int = 20

    init(categoryId: String, catalogService: CatalogServiceProtocol = CatalogService()) {
        self.categoryId = categoryId
        self.catalogService = catalogService
    }

    func loadProducts() async {
        isLoading = true
        errorMessage = nil
        currentPage = 1

        do {
            let response = try await catalogService.getProducts(
                categoryId: categoryId,
                page: currentPage,
                limit: limit,
                search: nil,
                sortBy: sortBy,
                sortOrder: sortOrder
            )
            products = response.data
            hasMore = response.pagination?.hasMore ?? false
            totalCount = response.pagination?.totalCount ?? products.count
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    func loadMore() async {
        guard !isLoadingMore && hasMore else { return }

        isLoadingMore = true
        currentPage += 1

        do {
            let response = try await catalogService.getProducts(
                categoryId: categoryId,
                page: currentPage,
                limit: limit,
                search: nil,
                sortBy: sortBy,
                sortOrder: sortOrder
            )
            products.append(contentsOf: response.data)
            hasMore = response.pagination?.hasMore ?? false
        } catch {
            currentPage -= 1
        }

        isLoadingMore = false
    }

    func setSorting(by field: String, order: String) {
        sortBy = field
        sortOrder = order
        Task { await loadProducts() }
    }
}

#Preview {
    NavigationStack {
        ProductsListView(
            category: Category(
                id: "1",
                name: "Мебель",
                imageUrl: nil,
                displayOrder: 0,
                isActive: true,
                createdAt: Date()
            ),
            coordinator: MainCoordinator(appCoordinator: nil)
        )
        .environmentObject(CartManager())
    }
}
