import SwiftUI
import Combine

struct SearchResultsView: View {
    let initialQuery: String
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel: SearchViewModel
    @EnvironmentObject var cartManager: CartManager

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    init(query: String, coordinator: MainCoordinator) {
        self.initialQuery = query
        self.coordinator = coordinator
        _viewModel = StateObject(wrappedValue: SearchViewModel(initialQuery: query))
    }

    var body: some View {
        VStack(spacing: 0) {
            // Search Bar with real-time search
            SearchBar(text: $viewModel.searchQuery) {
                Task { await viewModel.search() }
            } onChange: { newQuery in
                viewModel.debouncedSearch(query: newQuery)
            }
            .padding()

            if viewModel.isLoading && viewModel.products.isEmpty {
                Spacer()
                ProgressView()
                Spacer()
            } else if let error = viewModel.errorMessage, viewModel.products.isEmpty {
                Spacer()
                ErrorView(message: error) {
                    Task { await viewModel.search() }
                }
                Spacer()
            } else if viewModel.products.isEmpty && !viewModel.searchQuery.isEmpty {
                Spacer()
                EmptyResultsView(
                    title: "Ничего не найдено",
                    subtitle: "Попробуйте изменить запрос",
                    systemImage: "magnifyingglass"
                )
                Spacer()
            } else {
                ScrollView {
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

                    if viewModel.isLoading && !viewModel.products.isEmpty {
                        ProgressView()
                            .padding()
                    }
                }
            }
        }
        .navigationTitle("Поиск")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            if viewModel.products.isEmpty {
                await viewModel.search()
            }
        }
    }
}

@MainActor
final class SearchViewModel: ObservableObject {
    @Published var searchQuery: String
    @Published var products: [Product] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private var currentPage = 1
    private var hasMore = true
    private let catalogService: CatalogServiceProtocol
    private var searchTask: Task<Void, Never>?
    private var debounceTask: Task<Void, Never>?

    init(initialQuery: String, catalogService: CatalogServiceProtocol = CatalogService()) {
        self.searchQuery = initialQuery
        self.catalogService = catalogService
    }

    /// Debounced search - waits 300ms after user stops typing
    func debouncedSearch(query: String) {
        // Cancel previous debounce task
        debounceTask?.cancel()

        // Don't search for very short queries
        guard query.trimmingCharacters(in: .whitespaces).count >= 2 else { return }

        debounceTask = Task {
            do {
                try await Task.sleep(nanoseconds: 300_000_000) // 300ms debounce
                await search()
            } catch {
                // Task was cancelled, ignore
            }
        }
    }

    func search() async {
        guard !searchQuery.trimmingCharacters(in: .whitespaces).isEmpty else { return }

        // Cancel any previous search
        searchTask?.cancel()

        isLoading = true
        errorMessage = nil
        currentPage = 1
        hasMore = true

        searchTask = Task {
            do {
                try Task.checkCancellation()
                let response = try await catalogService.searchProducts(
                    query: searchQuery,
                    page: 1,
                    limit: 20
                )
                try Task.checkCancellation()
                self.products = response.data
                self.hasMore = response.pagination?.hasMore ?? false
                self.currentPage = 1
            } catch is CancellationError {
                // Ignore cancellation
            } catch NetworkError.cancelled {
                // Ignore network cancellation
            } catch {
                self.errorMessage = error.localizedDescription
            }
            self.isLoading = false
        }

        await searchTask?.value
    }

    func loadMore() async {
        guard !isLoading, hasMore else { return }

        isLoading = true

        do {
            let response = try await catalogService.searchProducts(
                query: searchQuery,
                page: currentPage + 1,
                limit: 20
            )
            products.append(contentsOf: response.data)
            hasMore = response.pagination?.hasMore ?? false
            currentPage += 1
        } catch {
            // Silent fail for pagination
        }

        isLoading = false
    }
}

#Preview {
    NavigationStack {
        SearchResultsView(query: "стол", coordinator: MainCoordinator(appCoordinator: nil))
            .environmentObject(CartManager())
    }
}
