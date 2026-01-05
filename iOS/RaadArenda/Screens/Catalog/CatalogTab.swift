import SwiftUI

struct CatalogTab: View {
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        NavigationStack(path: $coordinator.catalogPath) {
            CategoriesView(coordinator: coordinator)
                .navigationDestination(for: CatalogRoute.self) { route in
                    switch route {
                    case .category(let category):
                        ProductsListView(category: category, coordinator: coordinator)
                    case .product(let product):
                        ProductDetailView(product: product, coordinator: coordinator)
                    }
                }
        }
    }
}

struct CategoriesView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = CategoriesViewModel()

    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]

    var body: some View {
        ScrollView {
            // Search Bar
            SearchBar(text: $viewModel.searchQuery) {
                // Navigate to search results
            }
            .padding(.horizontal)

            if viewModel.isLoading {
                ProgressView()
                    .padding(.top, 100)
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task { await viewModel.loadCategories() }
                }
            } else {
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(viewModel.categories) { category in
                        CategoryCard(category: category)
                            .onTapGesture {
                                coordinator.showCategory(category)
                            }
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Каталог")
        .refreshable {
            await viewModel.loadCategories()
        }
        .task {
            await viewModel.loadCategories()
        }
    }
}

struct CategoryCard: View {
    let category: Category

    var body: some View {
        VStack(spacing: 12) {
            AsyncImage(url: URL(string: category.imageUrl ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Image(systemName: "folder.fill")
                    .font(.system(size: 40))
                    .foregroundColor(.accentColor.opacity(0.5))
            }
            .frame(width: 80, height: 80)
            .clipShape(RoundedRectangle(cornerRadius: 16))

            Text(category.name)
                .font(.subheadline)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(16)
    }
}

struct SearchBar: View {
    @Binding var text: String
    var onSubmit: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)

            TextField("Поиск товаров", text: $text)
                .textFieldStyle(.plain)
                .onSubmit(onSubmit)

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct ErrorView: View {
    let message: String
    let retry: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 50))
                .foregroundColor(.orange)

            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            Button("Повторить", action: retry)
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

@MainActor
final class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var searchQuery: String = ""

    private let catalogService: CatalogServiceProtocol

    init(catalogService: CatalogServiceProtocol = CatalogService()) {
        self.catalogService = catalogService
    }

    func loadCategories() async {
        isLoading = true
        errorMessage = nil

        do {
            categories = try await catalogService.getCategories()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}

#Preview {
    CatalogTab(coordinator: MainCoordinator(appCoordinator: nil))
}
