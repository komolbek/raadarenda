import SwiftUI

enum AppRoute: Hashable {
    case splash
    case main
}

@MainActor
final class AppCoordinator: ObservableObject {
    @Published var route: AppRoute = .splash
    @Published var isAuthenticated: Bool = false
    @Published var showAuthSheet: Bool = false

    private let sessionManager: SessionManager

    init(sessionManager: SessionManager = .shared) {
        self.sessionManager = sessionManager
        checkAuthState()
    }

    func checkAuthState() {
        Task {
            if await sessionManager.hasValidSession() {
                isAuthenticated = true
            }
            route = .main
        }
    }

    func navigateToAuth() {
        showAuthSheet = true
    }

    func navigateToMain() {
        showAuthSheet = false
    }

    func onAuthSuccess() {
        isAuthenticated = true
        showAuthSheet = false
    }

    func logout() {
        Task {
            await sessionManager.clearSession()
            isAuthenticated = false
        }
    }
}

struct AppCoordinatorView: View {
    @ObservedObject var coordinator: AppCoordinator

    var body: some View {
        Group {
            switch coordinator.route {
            case .splash:
                SplashView()
            case .main:
                MainCoordinatorView(appCoordinator: coordinator)
            }
        }
        .fullScreenCover(isPresented: $coordinator.showAuthSheet) {
            AuthCoordinatorView(appCoordinator: coordinator)
        }
    }
}
