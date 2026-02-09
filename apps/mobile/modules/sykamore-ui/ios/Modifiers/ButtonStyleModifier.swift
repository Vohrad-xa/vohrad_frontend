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

internal enum ButtonBorderShape: String, Enumerable {
  case automatic
  case capsule
  case circle
  case roundedRectangle
}

// MARK: - Button Style Modifier

/**
 * Applies a button style to a Button view.
 * Supports both standard SwiftUI styles and iOS 26+ glass styles.
 */
internal struct ButtonStyleModifier: ViewModifier, Record {
  @Field var style: ButtonStyle = .automatic
  @Field var borderShape: ButtonBorderShape?
  @Field var cornerRadius: CGFloat = 8

  @ViewBuilder
  func body(content: Content) -> some View {
    switch style {
    case .bordered:
      applyBorderShape(to: content.buttonStyle(.bordered))
    case .borderedProminent:
      applyBorderShape(to: content.buttonStyle(.borderedProminent))
    case .borderless:
      if #available(iOS 13.0, macOS 10.15, tvOS 17.0, *) {
        applyBorderShape(to: content.buttonStyle(.borderless))
      } else {
        applyBorderShape(to: content.buttonStyle(.automatic))
      }
    case .glass:
      if #available(iOS 26.0, macOS 26.0, tvOS 26.0, *) {
        #if compiler(>=6.2)
          applyBorderShape(to: content.buttonStyle(.glass))
        #else
          applyBorderShape(to: content.buttonStyle(.automatic))
        #endif
      } else {
        applyBorderShape(to: content.buttonStyle(.automatic))
      }
    case .glassProminent:
      if #available(iOS 26.0, macOS 26.0, tvOS 26.0, *) {
        #if compiler(>=6.2)
          applyBorderShape(to: content.buttonStyle(.glassProminent))
        #else
          applyBorderShape(to: content.buttonStyle(.automatic))
        #endif
      } else {
        applyBorderShape(to: content.buttonStyle(.automatic))
      }
    case .plain:
      applyBorderShape(to: content.buttonStyle(.plain))
    case .automatic:
      applyBorderShape(to: content.buttonStyle(.automatic))
    }
  }
  
  @ViewBuilder
  private func applyBorderShape<T: View>(to content: T) -> some View {
    if let borderShape, #available(iOS 17.0, macOS 14.0, tvOS 17.0, *) {
      switch borderShape {
      case .automatic:
        content.buttonBorderShape(.automatic)
      case .capsule:
        content.buttonBorderShape(.capsule)
      case .circle:
        content.buttonBorderShape(.circle)
      case .roundedRectangle:
        content.buttonBorderShape(.roundedRectangle(radius: cornerRadius))
      }
    } else {
      content
    }
  }
}
