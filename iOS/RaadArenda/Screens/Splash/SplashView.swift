import SwiftUI

struct SplashView: View {
    var body: some View {
        ZStack {
            Color.accentColor
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Image(systemName: "cube.box.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.white)

                Text("RaadArenda")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)

                Text("Аренда для вас")
                    .font(.subheadline)
                    .foregroundColor(.white.opacity(0.8))
            }
        }
    }
}

#Preview {
    SplashView()
}
