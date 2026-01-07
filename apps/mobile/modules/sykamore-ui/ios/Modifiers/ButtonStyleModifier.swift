import ExpoModulesCore
import SwiftUI

// MARK: - Button Style Types

internal enum ButtonStyle: String, Enumerable {
  case automatic
  case bordered
  case borderedProminent
  case borderless
  case glass
  case glassProminent
  case plain
}

// MARK: - Button Style Modifier

/**
 * Applies a button style to a Button view.
 * Supports both standard SwiftUI styles and iOS 26+ glass styles.
 */
internal struct ButtonStyleModifier: ViewModifier, Record {
  @Field var style: ButtonStyle = .automatic

  @ViewBuilder
  func body(content: Content) -> some View {
    switch style {
    case .bordered:
      content.buttonStyle(.bordered)
    case .borderedProminent:
      content.buttonStyle(.borderedProminent)
    case .borderless:
      if #available(iOS 13.0, macOS 10.15, tvOS 17.0, *) {
        content.buttonStyle(.borderless)
      } else {
        content.buttonStyle(.automatic)
      }
    case .glass:
      if #available(iOS 26.0, macOS 26.0, tvOS 26.0, *) {
        #if compiler(>=6.2)
          content.buttonStyle(.glass)
        #else
          content.buttonStyle(.automatic)
        #endif
      } else {
        content.buttonStyle(.automatic)
      }
    case .glassProminent:
      if #available(iOS 26.0, macOS 26.0, tvOS 26.0, *) {
        #if compiler(>=6.2)
          content.buttonStyle(.glassProminent)
        #else
          content.buttonStyle(.automatic)
        #endif
      } else {
        content.buttonStyle(.automatic)
      }
    case .plain:
      content.buttonStyle(.plain)
    case .automatic:
      content.buttonStyle(.automatic)
    }
  }
}
