import SwiftUI

struct OrderConfirmationView: View {
    let orderId: String
    @ObservedObject var coordinator: MainCoordinator

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.green)

            Text("Заказ оформлен!")
                .font(.title)
                .fontWeight(.bold)

            Text("Номер заказа: \(orderId)")
                .font(.subheadline)
                .foregroundColor(.secondary)

            Text("Мы свяжемся с вами для подтверждения заказа")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            VStack(spacing: 12) {
                Button {
                    coordinator.selectedTab = .orders
                    coordinator.cartPath = NavigationPath()
                } label: {
                    Text("Мои заказы")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                }

                Button {
                    coordinator.selectedTab = .catalog
                    coordinator.cartPath = NavigationPath()
                } label: {
                    Text("Продолжить покупки")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                }
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
    }
}

#Preview {
    OrderConfirmationView(
        orderId: "12345",
        coordinator: MainCoordinator(appCoordinator: nil)
    )
}
