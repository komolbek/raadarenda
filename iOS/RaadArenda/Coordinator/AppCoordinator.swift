import SwiftUI

enum AppRoute: Hashable {
    case splash
    case main
    case auth
}

@MainActor
final class AppCoordinator: ObservableObject {
    @Published var route: AppRoute = .splash
    @Published var isAuthenticated: Bool = false

    private let sessionManager: SessionManager

    init(sessionManager: SessionManager = .shared) {
        self.sessionManager = sessionManager
        checkAuthState()
    }

    func checkAuthState() {
        Task {
            if await sessionManager.hasValidSession() {
                isAuthenticated = true
                route = .main
            } else {
                route = .main // Allow browsing without auth
            }
        }
    }

    func navigateToAuth() {
        route = .auth
    }

    func navigateToMain() {
        route = .main
    }

    func onAuthSuccess() {
        isAuthenticated = true
        route = .main
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
            case .auth:
                AuthCoordinatorView(appCoordinator: coordinator)
            }
        }
    }
}
