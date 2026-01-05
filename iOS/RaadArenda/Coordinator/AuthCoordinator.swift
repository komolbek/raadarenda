import SwiftUI

enum AuthRoute: Hashable {
    case phoneEntry
    case otpVerification(phoneNumber: String)
}

@MainActor
final class AuthCoordinator: ObservableObject {
    @Published var path: NavigationPath = NavigationPath()

    weak var appCoordinator: AppCoordinator?

    init(appCoordinator: AppCoordinator?) {
        self.appCoordinator = appCoordinator
    }

    func showOTPVerification(phoneNumber: String) {
        path.append(AuthRoute.otpVerification(phoneNumber: phoneNumber))
    }

    func onAuthSuccess() {
        appCoordinator?.onAuthSuccess()
    }

    func dismiss() {
        appCoordinator?.navigateToMain()
    }
}

struct AuthCoordinatorView: View {
    @StateObject private var coordinator: AuthCoordinator

    init(appCoordinator: AppCoordinator) {
        _coordinator = StateObject(wrappedValue: AuthCoordinator(appCoordinator: appCoordinator))
    }

    var body: some View {
        NavigationStack(path: $coordinator.path) {
            PhoneEntryView(coordinator: coordinator)
                .navigationDestination(for: AuthRoute.self) { route in
                    switch route {
                    case .otpVerification(let phoneNumber):
                        OTPVerificationView(
                            phoneNumber: phoneNumber,
                            coordinator: coordinator
                        )
                    default:
                        EmptyView()
                    }
                }
        }
        .environmentObject(coordinator)
    }
}
