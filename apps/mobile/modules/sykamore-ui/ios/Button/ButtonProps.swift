import SwiftUI
import ExpoModulesCore

internal enum ButtonRole: String, Enumerable {
  case `default`
  case destructive
  case cancel

  func toNativeRole() -> SwiftUI.ButtonRole? {
    switch self {
    case .default:
      return nil
    case .destructive:
      return SwiftUI.ButtonRole.destructive
    case .cancel:
      return SwiftUI.ButtonRole.cancel
    }
  }
}

internal enum ButtonControlSize: String, Enumerable {
  case mini
  case small
  case regular
  case large
  case extraLarge
  
  func toNativeControlSize() -> SwiftUI.ControlSize {
    switch self {
    case .mini:
      return .mini
    case .small:
      return .small
    case .regular:
      return .regular
    case .large:
      return .large
    case .extraLarge:
      if #available(iOS 17.0, *) {
        return .extraLarge
      } else {
        return .large
      }
    }
  }
}

internal enum ButtonVariant: String, Enumerable {
  case `default`
  case bordered
  case borderedProminent
  case borderless
  case plain
  case glass
  case glassProminent
}

final class ButtonProps: UIBaseViewProps, Observable {
  @Field var text: String?
  @Field var systemImage: String?
  @Field var color: Color?
  @Field var buttonRole: ButtonRole? = .default
  @Field var controlSize: ButtonControlSize? = .regular
  @Field var variant: ButtonVariant? = .default
  @Field var disabled: Bool = false
  var onButtonPressed = EventDispatcher()
}

