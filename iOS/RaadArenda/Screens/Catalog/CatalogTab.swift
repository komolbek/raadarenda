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
                    case .search(let query):
                        SearchResultsView(query: query, coordinator: coordinator)
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
                if !viewModel.searchQuery.trimmingCharacters(in: .whitespaces).isEmpty {
                    coordinator.showSearch(query: viewModel.searchQuery)
                }
            }
            .padding(.horizontal)

            if viewModel.isLoading {
                ProgressView()
                    .padding(.top, 100)
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task { await viewModel.loadCategories() }
                }
            } else if viewModel.categories.isEmpty {
                EmptyResultsView(
                    title: "Каталог пуст",
                    subtitle: "Категории пока не добавлены",
                    systemImage: "folder",
                    actionTitle: "Обновить"
                ) {
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
            await viewModel.refresh()
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
            // Show icon if available, otherwise show image or fallback
            if let iconName = category.iconName, !iconName.isEmpty {
                Image(systemName: CategoryIcons.sfSymbol(for: iconName))
                    .font(.system(size: 36))
                    .foregroundColor(.accentColor)
                    .frame(width: 80, height: 80)
                    .background(Color.accentColor.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            } else if let imageUrl = category.imageUrl, !imageUrl.isEmpty {
                AsyncImage(url: URL(string: imageUrl)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    ProgressView()
                }
                .frame(width: 80, height: 80)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            } else {
                Image(systemName: "folder.fill")
                    .font(.system(size: 36))
                    .foregroundColor(.accentColor.opacity(0.5))
                    .frame(width: 80, height: 80)
                    .background(Color(.systemGray5))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
            }

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
    var onChange: ((String) -> Void)?

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)

            TextField("Поиск товаров", text: $text)
                .textFieldStyle(.plain)
                .onSubmit(onSubmit)
                .onChange(of: text) { _, newValue in
                    onChange?(newValue)
                }

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                }

                // Search button for better UX
                Button {
                    onSubmit()
                } label: {
                    Image(systemName: "arrow.right.circle.fill")
                        .foregroundColor(.accentColor)
                        .font(.title3)
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

struct EmptyResultsView: View {
    let title: String
    let subtitle: String?
    let systemImage: String
    var actionTitle: String?
    var action: (() -> Void)?

    init(
        title: String = "Ничего не найдено",
        subtitle: String? = nil,
        systemImage: String = "magnifyingglass",
        actionTitle: String? = nil,
        action: (() -> Void)? = nil
    ) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
        self.actionTitle = actionTitle
        self.action = action
    }

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: systemImage)
                .font(.system(size: 60))
                .foregroundColor(.secondary.opacity(0.6))

            VStack(spacing: 8) {
                Text(title)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
            }

            if let actionTitle = actionTitle, let action = action {
                Button(actionTitle, action: action)
                    .buttonStyle(.borderedProminent)
            }
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

@MainActor
final class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var searchQuery: String = ""

    private let catalogService: CatalogServiceProtocol
    private var hasLoadedOnce = false
    private var loadTask: Task<Void, Never>?

    init(catalogService: CatalogServiceProtocol = CatalogService()) {
        self.catalogService = catalogService
    }

    func loadCategories(force: Bool = false) async {
        // Skip if already loaded and not forcing refresh
        if !force && hasLoadedOnce && !categories.isEmpty { return }

        // Cancel any existing load task
        loadTask?.cancel()

        isLoading = true
        errorMessage = nil

        loadTask = Task {
            do {
                try Task.checkCancellation()
                let result = try await catalogService.getCategories()
                try Task.checkCancellation()
                self.categories = result
                self.hasLoadedOnce = true
            } catch is CancellationError {
                // Ignore cancellation errors - likely from pull-to-refresh conflict
            } catch NetworkError.cancelled {
                // Ignore network cancellation
            } catch let error as NSError where error.code == NSURLErrorCancelled {
                // Ignore URL session cancellation
            } catch {
                self.errorMessage = error.localizedDescription
            }
            self.isLoading = false
        }

        await loadTask?.value
    }

    func refresh() async {
        await loadCategories(force: true)
    }
}

#Preview {
    CatalogTab(coordinator: MainCoordinator(appCoordinator: nil))
}
