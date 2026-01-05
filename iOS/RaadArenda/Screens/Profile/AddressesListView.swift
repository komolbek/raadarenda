import SwiftUI

struct AddressesListView: View {
    @ObservedObject var coordinator: MainCoordinator
    @StateObject private var viewModel = AddressesViewModel()
    @State private var showAddSheet = false

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.addresses.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "mappin.slash")
                        .font(.system(size: 60))
                        .foregroundColor(.secondary)

                    Text("Нет сохранённых адресов")
                        .font(.headline)

                    Button("Добавить адрес") {
                        showAddSheet = true
                    }
                    .buttonStyle(.borderedProminent)
                }
            } else {
                List {
                    ForEach(viewModel.addresses) { address in
                        AddressListRow(address: address, viewModel: viewModel)
                    }
                    .onDelete { indexSet in
                        Task {
                            for index in indexSet {
                                await viewModel.deleteAddress(viewModel.addresses[index])
                            }
                        }
                    }
                }
                .listStyle(.insetGrouped)
            }
        }
        .navigationTitle("Мои адреса")
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    showAddSheet = true
                } label: {
                    Image(systemName: "plus")
                }
                .disabled(viewModel.addresses.count >= 5)
            }
        }
        .sheet(isPresented: $showAddSheet) {
            AddAddressView(viewModel: viewModel)
        }
        .alert("Ошибка", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
        .task {
            await viewModel.loadAddresses()
        }
    }
}

struct AddressListRow: View {
    let address: Address
    @ObservedObject var viewModel: AddressesViewModel

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(address.title)
                        .font(.headline)
                    if address.isDefault {
                        Text("По умолчанию")
                            .font(.caption)
                            .foregroundColor(.accentColor)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.accentColor.opacity(0.1))
                            .cornerRadius(4)
                    }
                }
                Text(address.fullAddress)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Spacer()

            if !address.isDefault {
                Button {
                    Task {
                        await viewModel.setDefault(address)
                    }
                } label: {
                    Image(systemName: "star")
                        .foregroundColor(.secondary)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.vertical, 4)
    }
}

struct AddAddressView: View {
    @ObservedObject var viewModel: AddressesViewModel
    @Environment(\.dismiss) var dismiss

    @State private var title = ""
    @State private var city = "Ташкент"
    @State private var district = ""
    @State private var street = ""
    @State private var building = ""
    @State private var apartment = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Название") {
                    TextField("Например: Дом, Офис", text: $title)
                }

                Section("Адрес") {
                    TextField("Город", text: $city)
                    TextField("Район", text: $district)
                    TextField("Улица", text: $street)
                    TextField("Дом", text: $building)
                    TextField("Квартира", text: $apartment)
                }
            }
            .navigationTitle("Новый адрес")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Отмена") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Сохранить") {
                        Task {
                            await viewModel.addAddress(
                                title: title,
                                city: city,
                                district: district,
                                street: street,
                                building: building,
                                apartment: apartment
                            )
                            if !viewModel.showError {
                                dismiss()
                            }
                        }
                    }
                    .disabled(title.isEmpty || city.isEmpty)
                }
            }
        }
    }
}

@MainActor
final class AddressesViewModel: ObservableObject {
    @Published var addresses: [Address] = []
    @Published var isLoading: Bool = false
    @Published var showError: Bool = false
    @Published var errorMessage: String = ""

    private let userService: UserServiceProtocol

    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }

    func loadAddresses() async {
        isLoading = true
        do {
            addresses = try await userService.getAddresses()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
        isLoading = false
    }

    func addAddress(title: String, city: String, district: String, street: String, building: String, apartment: String) async {
        let fullAddress = [street, building, apartment].filter { !$0.isEmpty }.joined(separator: ", ")
        let request = CreateAddressRequest(
            title: title,
            fullAddress: fullAddress.isEmpty ? city : "\(city), \(fullAddress)",
            city: city,
            district: district.isEmpty ? nil : district,
            street: street.isEmpty ? nil : street,
            building: building.isEmpty ? nil : building,
            apartment: apartment.isEmpty ? nil : apartment,
            entrance: nil,
            floor: nil,
            latitude: nil,
            longitude: nil
        )

        do {
            let address = try await userService.createAddress(request: request)
            addresses.append(address)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func deleteAddress(_ address: Address) async {
        do {
            try await userService.deleteAddress(id: address.id)
            addresses.removeAll { $0.id == address.id }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func setDefault(_ address: Address) async {
        do {
            let updated = try await userService.setDefaultAddress(id: address.id)
            if addresses.contains(where: { $0.id == updated.id }) {
                // Update all to non-default, then set this one
                addresses = addresses.map { addr in
                    if addr.id == updated.id {
                        return updated
                    }
                    return Address(
                        id: addr.id,
                        userId: addr.userId,
                        title: addr.title,
                        fullAddress: addr.fullAddress,
                        city: addr.city,
                        district: addr.district,
                        street: addr.street,
                        building: addr.building,
                        apartment: addr.apartment,
                        entrance: addr.entrance,
                        floor: addr.floor,
                        latitude: addr.latitude,
                        longitude: addr.longitude,
                        isDefault: false,
                        createdAt: addr.createdAt
                    )
                }
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

#Preview {
    NavigationStack {
        AddressesListView(coordinator: MainCoordinator(appCoordinator: nil))
    }
}
