import Foundation

enum AuthEndpoint: APIEndpoint {
    case sendOTP(phoneNumber: String)
    case verifyOTP(phoneNumber: String, code: String, deviceId: String)
    case logout

    var path: String {
        switch self {
        case .sendOTP:
            return "/auth/send-otp"
        case .verifyOTP:
            return "/auth/verify-otp"
        case .logout:
            return "/auth/logout"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .sendOTP, .verifyOTP, .logout:
            return .post
        }
    }

    var body: Encodable? {
        switch self {
        case .sendOTP(let phoneNumber):
            return SendOTPRequest(phoneNumber: phoneNumber)
        case .verifyOTP(let phoneNumber, let code, let deviceId):
            return VerifyOTPRequest(phoneNumber: phoneNumber, code: code, deviceId: deviceId)
        case .logout:
            return nil
        }
    }

    var requiresAuth: Bool {
        switch self {
        case .sendOTP, .verifyOTP:
            return false
        case .logout:
            return true
        }
    }
}
