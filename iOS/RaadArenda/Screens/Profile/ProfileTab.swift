import SwiftUI

struct ProfileTab: View {
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        NavigationStack(path: $coordinator.profilePath) {
            ProfileView(coordinator: coordinator)
                .navigationDestination(for: ProfileRoute.self) { route in
                    switch route {
                    case .addresses:
                        AddressesListView(coordinator: coordinator)
                    case .favorites:
                        FavoritesView(coordinator: coordinator)
                    case .editProfile:
                        EditProfileView(coordinator: coordinator)
                    }
                }
        }
    }
}

struct ProfileView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = ProfileViewModel()

    var body: some View {
        List {
            if viewModel.isAuthenticated {
                // Profile Header
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.accentColor)

                        VStack(alignment: .leading, spacing: 4) {
                            Text(viewModel.user?.name ?? "Пользователь")
                                .font(.title3)
                                .fontWeight(.semibold)
                            Text(viewModel.user?.phoneNumber ?? "")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }

                // Account Section
                Section("Аккаунт") {
                    Button {
                        coordinator.profilePath.append(ProfileRoute.editProfile)
                    } label: {
                        ProfileMenuItem(icon: "person", title: "Редактировать профиль")
                    }

                    Button {
                        coordinator.profilePath.append(ProfileRoute.addresses)
                    } label: {
                        ProfileMenuItem(icon: "mappin", title: "Мои адреса")
                    }

                    Button {
                        coordinator.profilePath.append(ProfileRoute.favorites)
                    } label: {
                        ProfileMenuItem(icon: "heart", title: "Избранное")
                    }
                }
            } else {
                // Not Authenticated
                Section {
                    VStack(spacing: 16) {
                        Image(systemName: "person.crop.circle")
                            .font(.system(size: 60))
                            .foregroundColor(.secondary)

                        Text("Войдите в аккаунт")
                            .font(.headline)

                        Text("Чтобы сохранять избранное и отслеживать заказы")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)

                        Button {
                            coordinator.appCoordinator?.navigateToAuth()
                        } label: {
                            Text("Войти")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 12)
                                .background(Color.accentColor)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                    }
                    .padding(.vertical)
                }
            }

            // Support Section
            Section("Поддержка") {
                Button {
                    if let url = URL(string: "tel://+998901234567") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    ProfileMenuItem(icon: "phone", title: "Позвонить")
                }

                Button {
                    if let url = URL(string: "https://t.me/raadarenda") {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    ProfileMenuItem(icon: "paperplane", title: "Telegram")
                }
            }

            // About Section
            Section("О приложении") {
                HStack {
                    Text("Версия")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")
                        .foregroundColor(.secondary)
                }
            }

            // Logout
            if viewModel.isAuthenticated {
                Section {
                    Button(role: .destructive) {
                        Task {
                            await viewModel.logout()
                            coordinator.appCoordinator?.logout()
                        }
                    } label: {
                        HStack {
                            Spacer()
                            Text("Выйти")
                            Spacer()
                        }
                    }
                }
            }
        }
        .navigationTitle("Профиль")
        .task {
            await viewModel.loadProfile()
        }
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String

    var body: some View {
        HStack {
            Image(systemName: icon)
                .frame(width: 24)
                .foregroundColor(.accentColor)
            Text(title)
                .foregroundColor(.primary)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

@MainActor
final class ProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isAuthenticated: Bool = false

    private let userService: UserServiceProtocol
    private let authService: AuthServiceProtocol

    init(userService: UserServiceProtocol = UserService(), authService: AuthServiceProtocol = AuthService()) {
        self.userService = userService
        self.authService = authService
    }

    func loadProfile() async {
        isAuthenticated = await SessionManager.shared.hasValidSession()

        if isAuthenticated {
            do {
                user = try await userService.getProfile()
            } catch {
                // Handle error
            }
        }
    }

    func logout() async {
        do {
            try await authService.logout()
        } catch {
            // Force logout anyway
            await SessionManager.shared.clearSession()
        }
        isAuthenticated = false
        user = nil
    }
}

#Preview {
    ProfileTab(coordinator: MainCoordinator(appCoordinator: nil))
}
