import Foundation

enum NetworkError: LocalizedError {
    case invalidURL
    case noData
    case invalidResponse
    case decodingError(Error)
    case serverError(Int, String)
    case unauthorized
    case networkError(Error)
    case cancelled
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Неверный URL"
        case .noData:
            return "Нет данных"
        case .invalidResponse:
            return "Неверный ответ сервера"
        case .decodingError(let error):
            return "Ошибка декодирования: \(error.localizedDescription)"
        case .serverError(_, let message):
            return message
        case .unauthorized:
            return "Необходима авторизация"
        case .networkError(let error):
            return "Ошибка сети: \(error.localizedDescription)"
        case .cancelled:
            return nil // Silent error, no message needed
        case .unknown:
            return "Неизвестная ошибка"
        }
    }
}
